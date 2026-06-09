import { Router } from "express";
import {
  createCampaign,
  getCampaignById,
  getCampaigns,
  getCampaignStats,
  deleteCampaign,
} from "../services/campaign.service";
import { launchCampaign } from "../services/campaign-launch.service";
const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const campaigns = await getCampaigns();
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await deleteCampaign(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const campaign = await getCampaignById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        error: "Campaign not found",
      });
    }

    res.json(campaign);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const campaign = await createCampaign(req.body);

    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
});
router.post("/:id/launch", async (req, res, next) => {
  try {
    const result = await launchCampaign(req.params.id);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/stats", async (req, res, next) => {
  try {
    const stats = await getCampaignStats(req.params.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;