import {
  CampaignStatus,
  CommunicationStatus,
} from "@prisma/client";
import { prisma } from "../lib/prisma";
import { dispatchQueue } from "../queues";

export async function launchCampaign(campaignId: string) {
  // 1. Fetch campaign
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
    include: {
      segment: true,
    },
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  // Prevent relaunch
  if (
    campaign.status === CampaignStatus.RUNNING ||
    campaign.status === CampaignStatus.COMPLETED
  ) {
    throw new Error(
      `Campaign already ${campaign.status.toLowerCase()}`
    );
  }

  // 2. Resolve audience from segment
  const query = campaign.segment.query ? (typeof campaign.segment.query === 'string' ? JSON.parse(campaign.segment.query) : campaign.segment.query) : {};

  // We safely cast the JSON query from the AI segment builder directly to the Prisma where clause.
  const customers = await prisma.customer.findMany({
    where: query as any,
  });

  // 3. Create communications
  const communicationsData = customers.map((customer) => ({
    campaignId: campaign.id,
    customerId: customer.id,
    channel: campaign.channel,
    status: CommunicationStatus.PENDING,
  }));

  // Create many doesn't return created records in standard Prisma (without preview features or specific adapters), 
  // so we will create them and then fetch them or use a transaction if needed. 
  // Wait, Prisma doesn't return IDs for createMany in Postgres reliably. Let's create and then fetch.
  await prisma.communication.createMany({
    data: communicationsData,
  });

  const createdCommunications = await prisma.communication.findMany({
    where: {
      campaignId: campaign.id,
      status: CommunicationStatus.PENDING
    }
  });

  // 4. Create campaign stats
  await prisma.campaignStats.upsert({
    where: {
      campaignId: campaign.id,
    },
    update: {},
    create: {
      campaignId: campaign.id,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      purchasedCount: 0,
      failedCount: 0,
    },
  });

  // 5. Mark campaign running
  await prisma.campaign.update({
    where: {
      id: campaign.id,
    },
    data: {
      status: CampaignStatus.RUNNING,
    },
  });

  // 6. Enqueue jobs into dispatch-queue
  const jobs = createdCommunications.map((comm) => ({
    name: "send-communication",
    data: {
      communicationId: comm.id,
      campaignId: comm.campaignId,
      customerId: comm.customerId,
      channel: comm.channel,
      message: campaign.message,
    },
  }));

  if (jobs.length > 0) {
    await dispatchQueue.addBulk(jobs);
  }

  return {
    campaignId: campaign.id,
    campaignName: campaign.name,
    audienceSize: customers.length,
    communicationsCreated: customers.length,
    status: CampaignStatus.RUNNING,
  };
}