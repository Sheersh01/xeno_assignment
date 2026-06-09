import express from "express";
import cors from "cors";

import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

import healthRoutes from "./routes/health.routes";
import customerRoutes from "./routes/customer.routes";
import segmentRoutes from "./routes/segment.routes";
import campaignRoutes from "./routes/campaign.routes";
import webhookRoutes from "./routes/webhook.routes";
import aiRoutes from "./routes/ai.routes";
import { dispatchQueue, callbackQueue, insightsQueue } from "./queues";

// Also import workers so they start processing when the app starts
import "./workers";

const app = express();

app.use(cors());
app.use(express.json());

// Setup Bull Board
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullMQAdapter(dispatchQueue), 
    new BullMQAdapter(callbackQueue),
    new BullMQAdapter(insightsQueue)
  ],
  serverAdapter: serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());

import statsRoutes from "./routes/stats.routes";

app.use("/health", healthRoutes);
app.use("/customers", customerRoutes);
app.use("/segments", segmentRoutes);
app.use("/campaigns", campaignRoutes);
app.use("/webhook", webhookRoutes);
app.use("/ai", aiRoutes);
app.use("/stats", statsRoutes);

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`CRM running on ${PORT}`);
});