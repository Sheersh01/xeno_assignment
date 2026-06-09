import { Worker } from "bullmq";
import { connection } from "../config/redis";
import { insightsQueueName } from "../queues";
import { prisma } from "../lib/prisma";
import { generateCampaignInsight } from "../services/ai.service";

export const insightsWorker = new Worker(
  insightsQueueName,
  async (job) => {
    const { campaignId } = job.data;

    // Gather campaign stats
    const stats = await prisma.campaignStats.findUnique({
      where: { campaignId },
    });

    if (!stats) {
      console.log(`[Insights Worker] No stats found for campaign ${campaignId}`);
      return;
    }

    // Generate AI Insight
    const insight = await generateCampaignInsight(stats);

    // Save insight to Campaign
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { aiInsight: insight },
    });
  },
  { connection }
);

insightsWorker.on("completed", (job) => {
  console.log(`[Insights Worker] Completed insight generation for campaign ${job.data.campaignId}`);
});

insightsWorker.on("failed", (job, err) => {
  console.error(`[Insights Worker] Failed job ${job?.id} with error: ${err.message}`);
});
