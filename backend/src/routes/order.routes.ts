import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/order.controller";

const router = express.Router();

// CRUD endpoints for orders
router.post("/", createOrder); // Create
router.get("/", getAllOrders); // Read (all)
router.get("/:id", getOrderById); // Read (specific order)
router.put("/:id", updateOrder); // Update
router.delete("/:id", deleteOrder); // Delete

export default router;
