import { Router } from "express";
import {
  getCustomers,
  getCustomerById,
} from "../services/customer.service";
import { getSegments } from "../services/customer.service";

const router = Router();

router.get("/", async (req, res) => {
  const query = req.query.query as string | undefined;
  const customers = await getCustomers(query);
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