import express from "express";
import {
  upsertConfig,
  getConfig,
  updateParameter,
} from "../controllers/config.controller";

const router = express.Router();

// Upsert configuration
router.post("/", upsertConfig);

// Get configuration
router.get("/", getConfig);

// Update a specific parameter
router.patch("/parameter", updateParameter);

export default router;
