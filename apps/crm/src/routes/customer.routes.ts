import { Router } from "express";
import {
  getCustomers,
  getCustomerById,
} from "../services/customer.service";
import { getSegments } from "../services/customer.service";

const router = Router();

router.get("/", async (_, res) => {
  const customers = await getCustomers();
  res.json(customers);
});

router.get("/:id", async (req, res) => {
  const customer = await getCustomerById(req.params.id);

  if (!customer) {
    return res.status(404).json({
      error: "Customer not found",
    });
  }

  res.json(customer);
});

export default router;