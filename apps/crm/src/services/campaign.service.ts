import { prisma } from "../lib/prisma";

export async function getCampaigns() {
  return prisma.campaign.findMany({
    include: {
      segment: true,
      stats: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCampaignById(id: string) {
  return prisma.campaign.findUnique({
    where: {
      id,
    },
    include: {
      segment: true,
      stats: true,
      communications: true,
    },
  });
}

export async function createCampaign(data: {
  name: string;
  segmentId: string;
  message: string;
  channel: "WHATSAPP" | "EMAIL" | "SMS" | "RCS";
}) {
  return prisma.campaign.create({
    data: {
      name: data.name,
      segmentId: data.segmentId,
      message: data.message,
      channel: data.channel,
    },
  });
}

export async function getCampaignStats(id: string) {
  const stats = await prisma.campaignStats.findUnique({
    where: {
      campaignId: id,
    },
  });

  if (!stats) {
    return {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      failed: 0,
      purchased: 0,
    };
  }

  return {
    sent: stats.sentCount,
    delivered: stats.deliveredCount,
    opened: stats.openedCount,
    clicked: stats.clickedCount,
    failed: stats.failedCount,
    purchased: stats.purchasedCount,
  };
}