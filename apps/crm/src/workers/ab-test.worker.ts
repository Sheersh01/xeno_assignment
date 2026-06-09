import { Worker } from "bullmq";
import { connection } from "../config/redis";
import { abTestQueueName, dispatchQueue } from "../queues";
import { prisma } from "../lib/prisma";
import { generateABTestInsight } from "../services/ai.service";
import { CommunicationStatus } from "@prisma/client";

export const abTestWorker = new Worker(
  abTestQueueName,
  async (job) => {
    const { campaignId } = job.data;

    // 1. Fetch Campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { segment: true },
    });

    if (!campaign || !campaign.variants) {
      console.log(`[AB Test Worker] Invalid campaign or no variants ${campaignId}`);
      return;
    }

    const variantsArray = campaign.variants as any[];

    // 2. Fetch all communications for this campaign that were part of the test (have variantIndex)
    const testComms = await prisma.communication.findMany({
      where: {
        campaignId,
        variantIndex: { not: null }
      },
      include: { events: true }
    });

    // 3. Calculate scores per variant
    const scores = [0, 0, 0];
    const metrics = [
      { opened: 0, clicked: 0, purchased: 0 },
      { opened: 0, clicked: 0, purchased: 0 },
      { opened: 0, clicked: 0, purchased: 0 },
    ];

    testComms.forEach(comm => {
      const vIdx = comm.variantIndex as number;
      comm.events.forEach(event => {
        if (event.eventType === 'OPENED') {
          metrics[vIdx].opened++;
          scores[vIdx] += 2;
        }
        if (event.eventType === 'CLICKED') {
          metrics[vIdx].clicked++;
          scores[vIdx] += 5;
        }
        if (event.eventType === 'PURCHASED') {
          metrics[vIdx].purchased++;
          scores[vIdx] += 10;
        }
      });
    });

    // 4. Find the winner
    let winnerIndex = 0;
    let highestScore = -1;
    for (let i = 0; i < 3; i++) {
      if (scores[i] > highestScore) {
        highestScore = scores[i];
        winnerIndex = i;
      }
    }

    const winningVariant = variantsArray[winnerIndex];

    // 5. Generate AI Insight
    const insight = await generateABTestInsight(winningVariant, variantsArray);

    // 6. Update Campaign
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        winnerIndex,
        aiInsight: insight,
        abTestCompleted: true,
        abTestCompletedAt: new Date()
      }
    });

    // 7. Dispatch the remaining audience
    const baseQuery = campaign.segment.query ? (typeof campaign.segment.query === 'string' ? JSON.parse(campaign.segment.query) : campaign.segment.query) : {};
    const query = {
      ...baseQuery,
      dnd: false
    };

    const allValidCustomers = await prisma.customer.findMany({
      where: query as any,
    });

    // Filter out customers who already received a communication
    const testCustomerIds = new Set(testComms.map(c => c.customerId));
    const remainingCustomers = allValidCustomers.filter(c => !testCustomerIds.has(c.id));

    if (remainingCustomers.length > 0) {
      const communicationsData = remainingCustomers.map(customer => ({
        campaignId: campaign.id,
        customerId: customer.id,
        channel: campaign.channel,
        status: CommunicationStatus.PENDING,
        variantIndex: winnerIndex,
      }));

      await prisma.communication.createMany({
        data: communicationsData,
      });

      // Fetch created communications
      const createdCommunications = await prisma.communication.findMany({
        where: {
          campaignId: campaign.id,
          status: CommunicationStatus.PENDING,
          customerId: { in: remainingCustomers.map(c => c.id) }
        }
      });

      // Enqueue jobs
      const jobs = createdCommunications.map((comm) => ({
        name: "send-communication",
        data: {
          communicationId: comm.id,
          campaignId: comm.campaignId,
          customerId: comm.customerId,
          channel: comm.channel,
          message: winningVariant.message,
        },
      }));

      await dispatchQueue.addBulk(jobs);
    }

    console.log(`[AB Test Worker] Completed evaluation for campaign ${campaignId}. Winner: Variant ${winnerIndex}`);
  },
  { connection }
);

abTestWorker.on("failed", (job, err) => {
  console.error(`[AB Test Worker] Failed job ${job?.id} with error: ${err.message}`);
});
