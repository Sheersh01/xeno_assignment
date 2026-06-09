import { Queue } from "bullmq";
import { connection } from "../config/redis";

export const dispatchQueueName = "dispatch-queue";

export const dispatchQueue = new Queue(dispatchQueueName, {
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
