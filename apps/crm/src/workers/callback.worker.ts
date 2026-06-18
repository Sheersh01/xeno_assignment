import { Worker, DelayedError } from "bullmq";
import { EventType, CommunicationStatus } from "@prisma/client";
import { connection } from "../config/redis";
import { callbackQueueName } from "../queues";
import { prisma } from "../lib/prisma";
import { analyzeSentiment } from "../services/ai.service";

export const callbackWorker = new Worker(
  callbackQueueName,
  async (job) => {
    const { communicationId, eventType, metadata } = job.data;

    let sentimentMetadata = metadata;

    if (eventType === 'REPLIED' && metadata?.replyText) {
      try {
        const sentiment = await analyzeSentiment(metadata.replyText);
        sentimentMetadata = { ...metadata, sentiment };
        
        if (sentiment === 'OPT_OUT') {
          const comm = await prisma.communication.findUnique({ where: { id: communicationId }});
          if (comm) {
            await prisma.customer.update({
              where: { id: comm.customerId },
              data: { dnd: true, dndReason: metadata.replyText }
            });
          }
        }
      } catch (error: any) {
        if (error.name === 'AIRateLimitError') {
          console.warn(`[Callback Worker] AI rate limit hit. Delaying job natively for 15s...`);
          await job.moveToDelayed(Date.now() + 15000, job.token);
          throw new DelayedError();
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      // 1. Create Event row
      await tx.event.create({
        data: {
          communicationId,
          eventType: eventType as EventType,
          metadata: sentimentMetadata
        },
      });

      // 2. Update Communication
      const updateData: any = { lastEventAt: new Date() };
      if (eventType !== 'REPLIED') {
        updateData.status = eventType as CommunicationStatus;
      }

      const comm = await tx.communication.update({
        where: { id: communicationId },
        data: updateData,
      });

      // 3. Update CampaignStats
      let incrementField = "";
      switch (eventType as EventType) {
        case "SENT":
          incrementField = "sentCount";
          break;
        case "DELIVERED":
          incrementField = "deliveredCount";
          break;
        case "OPENED":
          incrementField = "openedCount";
          break;
        case "CLICKED":
          incrementField = "clickedCount";
          break;
        case "FAILED":
          incrementField = "failedCount";
          break;
        case "PURCHASED":
          incrementField = "purchasedCount";
          break;
      }

      if (incrementField) {
        await tx.campaignStats.update({
          where: { campaignId: comm.campaignId },
          data: {
            [incrementField]: {
              increment: 1,
            },
          },
        });
      }
    });
  },
  { connection, concurrency: 50 }
);

callbackWorker.on("completed", (job) => {
  console.log(`[Callback Worker] Processed ${job.data.eventType} for comm ${job.data.communicationId}`);
});

callbackWorker.on("failed", (job, err) => {
  console.error(`[Callback Worker] Failed job ${job?.id} with error: ${err.message}`);
});
