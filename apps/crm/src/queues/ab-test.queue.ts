import { Queue } from "bullmq";
import { connection } from "../config/redis";

export const abTestQueueName = "ab-test-queue";

export const abTestQueue = new Queue(abTestQueueName, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
