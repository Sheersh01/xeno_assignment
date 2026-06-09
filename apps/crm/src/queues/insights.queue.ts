import { Queue } from "bullmq";
import { connection } from "../config/redis";

export const insightsQueueName = "insights-queue";

export const insightsQueue = new Queue(insightsQueueName, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // 5s
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
