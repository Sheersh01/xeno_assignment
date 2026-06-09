import { Worker } from "bullmq";
import { EventType, CommunicationStatus } from "@prisma/client";
import { connection } from "../config/redis";
import { callbackQueueName } from "../queues";
import { prisma } from "../lib/prisma";

export const callbackWorker = new Worker(
  callbackQueueName,
  async (job) => {
    const { communicationId, eventType } = job.data;

    await prisma.$transaction(async (tx) => {
      // 1. Create Event row
      await tx.event.create({
        data: {
          communicationId,
          eventType: eventType as EventType,
        },
      });

      // 2. Update Communication
      const comm = await tx.communication.update({
        where: { id: communicationId },
        data: {
          status: eventType as CommunicationStatus,
          lastEventAt: new Date(),
        },
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
  { connection }
);

callbackWorker.on("completed", (job) => {
  console.log(`[Callback Worker] Processed ${job.data.eventType} for comm ${job.data.communicationId}`);
});

callbackWorker.on("failed", (job, err) => {
  console.error(`[Callback Worker] Failed job ${job?.id} with error: ${err.message}`);
});
