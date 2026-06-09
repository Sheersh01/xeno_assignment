import { Worker } from "bullmq";
import axios from "axios";
import { connection } from "../config/redis";
import { dispatchQueueName } from "../queues";

export const dispatchWorker = new Worker(
  dispatchQueueName,
  async (job) => {
    const { communicationId, customerId, channel, message } = job.data;

    // Send to channel simulator
    await axios.post("http://localhost:4001/send", {
      communicationId,
      customerId,
      channel,
      message,
    });
  },
  { connection }
);

dispatchWorker.on("completed", (job) => {
  console.log(`[Dispatch Worker] Completed job ${job.id} for comm ${job.data.communicationId}`);
});

dispatchWorker.on("failed", (job, err) => {
  console.error(`[Dispatch Worker] Failed job ${job?.id} with error: ${err.message}`);
});
