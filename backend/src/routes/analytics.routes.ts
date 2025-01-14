import express from "express";
import {
  totalSalesByCategory,
  dailySalesReport,
  lowStockItems,
  popularItems,
} from "../controllers/analytics.controller";

const router = express.Router();

// Analytics routes
router.get("/sales-by-category", totalSalesByCategory);
router.get("/daily-sales", dailySalesReport);
router.get("/low-stock", lowStockItems);
router.get("/popular-items", popularItems);

export default router;
