import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const totalCustomers = await prisma.customer.count();
    const totalOrders = await prisma.order.count();
    const totalCampaigns = await prisma.campaign.count();
    const activeCampaigns = await prisma.campaign.count({
      where: { status: 'RUNNING' }
    });
    const dndCustomers = await prisma.customer.count({
      where: { dnd: true }
    });

    res.json({
      totalCustomers,
      totalOrders,
      totalCampaigns,
      activeCampaigns,
      dndCustomers
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
