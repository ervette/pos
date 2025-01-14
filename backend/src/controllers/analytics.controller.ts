import { Request, Response } from "express";
import {
  getTotalSalesByCategory,
  getDailySales,
  getLowStockItems,
  getPopularItems,
} from "../services/analytics.service";

// Total sales by category
export const totalSalesByCategory = async (req: Request, res: Response): Promise<void> => {
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
};

// Daily sales report
export const dailySalesReport = async (req: Request, res: Response): Promise<void> => {
  const { date } = req.query;
  try {
    const sales = await getDailySales(new Date(date as string));
    res.json(sales);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Low-stock items
export const lowStockItems = async (req: Request, res: Response): Promise<void> => {
  const threshold = parseInt(req.query.threshold as string, 10) || 5;
  try {
    const items = await getLowStockItems(threshold);
    res.json(items);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Popular items
export const popularItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await getPopularItems();
    res.json(items);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};
