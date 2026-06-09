import { Router } from "express";
import {
  generateSegmentFilter,
  generateCampaignMessage,
  recommendChannel,
  generateSegmentExplainer
} from "../services/ai.service";
import { prisma } from "../lib/prisma";

const router = Router();

router.post("/segment-builder", async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt is required" });

    const aiResponse = await generateSegmentFilter(prompt);

    // Build prisma where clause
    const where: any = {};
    
    if (aiResponse.query) {
      if (aiResponse.query.totalSpend) {
        where.totalSpend = aiResponse.query.totalSpend;
      }
      if (aiResponse.query.orderCount) {
        where.orderCount = aiResponse.query.orderCount;
      }
      if (aiResponse.query.lastOrderDays) {
        // Map lastOrderDays { gt, lt } to lastOrderDate { lt, gt }
        where.lastOrderDate = {};
        if (aiResponse.query.lastOrderDays.gt !== undefined) {
          const date = new Date();
          date.setDate(date.getDate() - aiResponse.query.lastOrderDays.gt);
          where.lastOrderDate.lt = date;
        }
        if (aiResponse.query.lastOrderDays.lt !== undefined) {
          const date = new Date();
          date.setDate(date.getDate() - aiResponse.query.lastOrderDays.lt);
          where.lastOrderDate.gt = date;
        }
      }
      if (aiResponse.query.city) {
        where.city = { contains: aiResponse.query.city, mode: "insensitive" };
      }
    }

    const audienceSize = await prisma.customer.count({ where });

    res.json({
      segmentName: aiResponse.segmentName,
      description: aiResponse.description,
      query: aiResponse.query,
      audienceSize
    });
  } catch (error) {
    next(error);
  }
});

router.post("/segment-explainer", async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "query is required" });
    
    const explainer = await generateSegmentExplainer(query);
    res.json(explainer);
  } catch (error) {
    next(error);
  }
});

router.post("/generate-message", async (req, res, next) => {
  try {
    const { goal, segmentDescription } = req.body;
    if (!goal) return res.status(400).json({ error: "goal is required" });

    const message = await generateCampaignMessage(goal, segmentDescription || "All customers");
    res.json(message);
  } catch (error) {
    next(error);
  }
});

router.post("/recommend-channel", async (req, res, next) => {
  try {
    const { segmentId } = req.body;
    if (!segmentId) return res.status(400).json({ error: "segmentId is required" });

    const segment = await prisma.segment.findUnique({ where: { id: segmentId } });
    if (!segment) return res.status(404).json({ error: "Segment not found" });

    const recommendation = await recommendChannel({
      name: segment.name,
      description: segment.description,
      audienceSize: segment.audienceSize
    });

    res.json(recommendation);
  } catch (error) {
    next(error);
  }
});

export default router;
