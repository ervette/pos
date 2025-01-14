import express from "express";
import { getTotalSalesByCategory, getLowStockItems, getDailySales } from "../services/analytics.service";

const router = express.Router();

// Route to get total sales by category
router.get("/sales-by-category", async (req, res) => {
  try {
    const sales = await getTotalSalesByCategory();
    res.json(sales);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

// Route to get low stock items
router.get("/low-stock", async (req, res) => {
  const threshold = parseInt(req.query.threshold as string, 10) || 5; // Default threshold is 5
  try {
    const lowStockItems = await getLowStockItems(threshold);
    res.json(lowStockItems);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

// Route to get daily sales report
router.get("/daily-sales", async (req, res) => {
  try {
    const dailySales = await getDailySales();
    res.json({ totalSales: dailySales });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

export default router;
