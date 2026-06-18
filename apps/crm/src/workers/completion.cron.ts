import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { insightsQueue } from "../queues";

// Run every 1 minute
cron.schedule("* * * * *", async () => {
  try {
    const runningCampaigns = await prisma.campaign.findMany({
      where: { status: "RUNNING" },
    });

    for (const campaign of runningCampaigns) {
      // Skip if AB test is still running
      if (campaign.variants && !campaign.abTestCompleted) {
        continue;
      }

      // Check if all communications have finished processing
      const pendingCount = await prisma.communication.count({
        where: {
          campaignId: campaign.id,
          status: "PENDING",
        },
      });

      if (pendingCount === 0) {
        // Mark as completed
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });

        console.log(`[Completion Cron] Campaign ${campaign.id} marked as COMPLETED.`);

        // Add to insights queue for final AI summary
        await insightsQueue.add("generate-insight", {
          campaignId: campaign.id,
        });
      }
    }
  } catch (error) {
    console.error("[Completion Cron] Error checking campaign completion:", error);
  }
});

console.log("[Completion Cron] Initialized.");
