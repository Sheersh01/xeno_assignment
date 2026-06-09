import { Router } from "express";
import { callbackQueue } from "../queues";

const router = Router();

router.post("/events", async (req, res, next) => {
  try {
    const { communicationId, eventType } = req.body;

    if (!communicationId || !eventType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Push payload to callback-queue. Do not update DB directly.
    await callbackQueue.add("process-webhook-event", {
      communicationId,
      eventType,
    });

    res.status(202).json({ status: "accepted" });
  } catch (error) {
    next(error);
  }
});

export default router;
