import {
  CampaignStatus,
  CommunicationStatus,
} from "@prisma/client";
import { prisma } from "../lib/prisma";
import { dispatchQueue, abTestQueue } from "../queues";

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

  // 2. Resolve audience from segment, excluding DND customers
  const baseQuery = campaign.segment.query ? (typeof campaign.segment.query === 'string' ? JSON.parse(campaign.segment.query) : campaign.segment.query) : {};
  
  const prismaQuery: any = { ...baseQuery, dnd: false };

  // Map dynamic relative lastOrderDays to absolute lastOrderDate for Prisma
  if (prismaQuery.lastOrderDays) {
    prismaQuery.lastOrderDate = {};
    if (prismaQuery.lastOrderDays.gt !== undefined) {
      const date = new Date();
      date.setDate(date.getDate() - prismaQuery.lastOrderDays.gt);
      prismaQuery.lastOrderDate.lt = date; // older than X days means date < today - X
    }
    if (prismaQuery.lastOrderDays.lt !== undefined) {
      const date = new Date();
      date.setDate(date.getDate() - prismaQuery.lastOrderDays.lt);
      prismaQuery.lastOrderDate.gt = date; // newer than X days means date > today - X
    }
    delete prismaQuery.lastOrderDays;
  }

  // Ensure city is case-insensitive contains
  if (prismaQuery.city && typeof prismaQuery.city === 'string') {
    prismaQuery.city = { contains: prismaQuery.city, mode: 'insensitive' };
  }

  const customers = await prisma.customer.findMany({
    where: prismaQuery,
  });

  if (customers.length === 0) {
    throw new Error("Audience is empty or all opted out.");
  }

  // 3. Determine if A/B Test and calculate dynamic sample
  const variantsArray = Array.isArray(campaign.variants) ? campaign.variants : [];
  const isABTest = variantsArray.length === 3;
  
  let targetCustomers = customers;
  let abTestSampleSize = 0;

  // We shuffle the array to ensure random sampling
  const shuffledCustomers = [...customers].sort(() => 0.5 - Math.random());

  if (isABTest) {
    const totalAudience = customers.length;
    // Math.max(15, Math.floor(15%))
    const calculatedSample = Math.max(15, Math.floor(totalAudience * 0.15));
    // Never sample more than the total audience
    abTestSampleSize = Math.min(totalAudience, calculatedSample);
    
    // We only take the sample for the initial dispatch
    targetCustomers = shuffledCustomers.slice(0, abTestSampleSize);
  } else {
    targetCustomers = shuffledCustomers;
  }

  // 4. Create communications
  const communicationsData = targetCustomers.map((customer, index) => {
    let variantIndex = null;
    if (isABTest) {
      // Distribute evenly among 0, 1, 2
      variantIndex = index % 3;
    }
    return {
      campaignId: campaign.id,
      customerId: customer.id,
      channel: campaign.channel,
      status: CommunicationStatus.PENDING,
      variantIndex,
    };
  });

  await prisma.communication.createMany({
    data: communicationsData,
  });

  const createdCommunications = await prisma.communication.findMany({
    where: {
      campaignId: campaign.id,
      status: CommunicationStatus.PENDING
    }
  });

  // 5. Create campaign stats
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

  // 6. Update Campaign State
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      status: CampaignStatus.RUNNING,
      abTestStartedAt: isABTest ? new Date() : null,
      abTestSampleSize: isABTest ? abTestSampleSize : 0,
    },
  });

  // 7. Enqueue initial dispatch jobs
  const jobs = createdCommunications.map((comm) => {
    let msgToSend = campaign.message;
    if (isABTest && comm.variantIndex !== null) {
      msgToSend = variantsArray[comm.variantIndex].message;
    }
    return {
      name: "send-communication",
      data: {
        communicationId: comm.id,
        campaignId: comm.campaignId,
        customerId: comm.customerId,
        channel: comm.channel,
        message: msgToSend,
      },
    };
  });

  if (jobs.length > 0) {
    await dispatchQueue.addBulk(jobs);
  }

  // 8. If A/B test, schedule the evaluation job
  if (isABTest && abTestSampleSize < customers.length) {
    await abTestQueue.add(
      "evaluate-ab-test",
      { campaignId: campaign.id },
      { delay: 15000 } // Wait 15 seconds
    );
  } else if (isABTest && abTestSampleSize >= customers.length) {
    // If the sample size swallowed the whole audience, just end the test immediately
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { abTestCompleted: true, abTestCompletedAt: new Date() }
    });
  }

  return {
    campaignId: campaign.id,
    campaignName: campaign.name,
    audienceSize: customers.length,
    communicationsCreated: targetCustomers.length,
    status: CampaignStatus.RUNNING,
    isABTest,
    abTestSampleSize
  };
}