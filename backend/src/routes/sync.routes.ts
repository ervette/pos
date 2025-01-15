import { Router } from "express";
import { syncOrders } from "../controllers/sync.controller";

const router = Router();

// POST /api/sync
router.post("/", syncOrders);

export default router;
