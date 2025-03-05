import express from "express";
import {
  getSalesReport,
  getHourlyWorkload,
  getPopularItems,
} from "../services/analytics.service";

const router = express.Router();

router.get("/sales-report", async (req, res) => {
  try {
    const report = await getSalesReport();
    res.json(report);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

router.get("/hourly-workload", async (req, res) => {
  try {
    const workload = await getHourlyWorkload();
    res.json(workload);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

router.get("/popular-items", async (req, res) => {
  try {
    const items = await getPopularItems();
    res.json(items);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

export default router;
