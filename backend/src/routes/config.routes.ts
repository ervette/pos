import express from "express"
// import { authenticate } from "../middleware/auth.middleware"
import {
  createConfig,
  getConfig,
  updateParameter,
} from "../controllers/config.controller"

const router = express.Router()

// router.post("/", createConfig)
router.post("/", async (req, res) => {
  try {
    await createConfig(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error});
  }
});

// Get configuration
router.get("/", getConfig)

// Update a specific parameter
router.patch("/parameter", updateParameter)

export default router
