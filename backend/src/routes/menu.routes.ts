import express from "express";
import {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  adjustInventory,
  getMenuItemsByCategory,
  getMenuCategories,
} from "../controllers/menu.controller";

const router = express.Router();

// CRUD endpoints for menu items
router.get("/items", getMenuItemsByCategory); // ✅ Fix the route
router.get("/categories", getMenuCategories);

router.post("/", createMenuItem); // Create
router.get("/", getAllMenuItems); // Read (all)
router.get("/:id", getMenuItemById); // Read (specific item)
router.put("/:id", updateMenuItem); // Update
router.delete("/:id", deleteMenuItem); // Delete

// Inventory adjustment endpoint
router.patch("/inventory", adjustInventory);

export default router;
