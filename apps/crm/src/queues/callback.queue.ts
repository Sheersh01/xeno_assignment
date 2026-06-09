import { Queue } from "bullmq";
import { connection } from "../config/redis";

export const callbackQueueName = "callback-queue";

export const callbackQueue = new Queue(callbackQueueName, {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "fixed",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
