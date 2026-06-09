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
      communications: {
        orderBy: {
          lastEventAt: "desc"
        },
        take: 15,
        include: {
          customer: { select: { name: true, email: true } },
          events: { orderBy: { timestamp: "desc" }, take: 1 }
        }
      },
    },
  });
}

export async function createCampaign(data: {
  name: string;
  segmentId: string;
  message: string;
  channel: "WHATSAPP" | "EMAIL" | "SMS" | "RCS";
  variants?: any[];
}) {
  return prisma.campaign.create({
    data: {
      name: data.name,
      segmentId: data.segmentId,
      message: data.message,
      channel: data.channel,
      variants: data.variants || undefined,
    },
  });
}

export async function getCampaignStats(id: string) {
  const stats = await prisma.campaignStats.findUnique({
    where: {
      campaignId: id,
    },
  });

  // Calculate variant-specific stats if A/B testing
  const testComms = await prisma.communication.findMany({
    where: {
      campaignId: id,
      variantIndex: { not: null }
    },
    include: { events: true }
  });

  const variantStats = [
    { variantIndex: 0, opened: 0, clicked: 0, purchased: 0, score: 0, sent: 0 },
    { variantIndex: 1, opened: 0, clicked: 0, purchased: 0, score: 0, sent: 0 },
    { variantIndex: 2, opened: 0, clicked: 0, purchased: 0, score: 0, sent: 0 },
  ];

  testComms.forEach(comm => {
    const vIdx = comm.variantIndex as number;
    if (vIdx >= 0 && vIdx <= 2) {
      variantStats[vIdx].sent++;
      comm.events.forEach(event => {
        if (event.eventType === 'OPENED') {
          variantStats[vIdx].opened++;
          variantStats[vIdx].score += 2;
        }
        if (event.eventType === 'CLICKED') {
          variantStats[vIdx].clicked++;
          variantStats[vIdx].score += 5;
        }
        if (event.eventType === 'PURCHASED') {
          variantStats[vIdx].purchased++;
          variantStats[vIdx].score += 10;
        }
      });
    }
  });

  if (!stats) {
    return {
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      failedCount: 0,
      purchasedCount: 0,
      variantStats
    };
  }

  return {
    sentCount: stats.sentCount,
    deliveredCount: stats.deliveredCount,
    openedCount: stats.openedCount,
    clickedCount: stats.clickedCount,
    failedCount: stats.failedCount,
    purchasedCount: stats.purchasedCount,
    variantStats
  };
}

export async function deleteCampaign(id: string) {
  // Use a transaction to safely delete the campaign and its explicitly linked relations
  return prisma.$transaction(async (tx) => {
    // Delete communications (this cascades to events manually here if needed, or by deleting events first)
    await tx.event.deleteMany({
      where: { communication: { campaignId: id } },
    });
    
    await tx.communication.deleteMany({
      where: { campaignId: id },
    });
    
    // stats and conversions have onDelete: Cascade in prisma schema, but we can do it explicitly just in case
    await tx.campaignStats.deleteMany({
      where: { campaignId: id },
    });
    
    await tx.conversion.deleteMany({
      where: { campaignId: id },
    });

    return tx.campaign.delete({
      where: { id },
    });
  });
}