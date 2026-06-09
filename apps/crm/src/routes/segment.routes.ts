import { Router } from "express";
import { getSegments, createSegment } from "../services/segment.service";

const router = Router();

router.get("/", async (_, res) => {
  const segments = await getSegments();
  res.json(segments);
});

router.post("/", async (req, res, next) => {
  try {
    const segment = await createSegment(req.body);
    res.json(segment);
  } catch (error) {
    next(error);
  }
});

export default router;