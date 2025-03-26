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
  updateSubCategory,
  updateSuperCategory,
  deleteSuperCategory,
  deleteSubCategory
} from "../controllers/menu.controller";

const router = express.Router();

// CRUD endpoints for menu items
router.get("/items", getMenuItemsByCategory); // ✅ Fix the route
router.get("/categories", getMenuCategories);
router.put("/super-category", updateSuperCategory); // Rename superCategory
router.put("/sub-category", updateSubCategory);     // Rename subCategory
router.delete("/super-category", deleteSuperCategory); // Delete superCategory
router.delete("/sub-category", deleteSubCategory);     // Delete subCategory

router.post("/", createMenuItem); // Create
router.get("/", getAllMenuItems); // Read (all)
router.get("/:id", getMenuItemById); // Read (specific item)
router.put("/:id", updateMenuItem); // Update
router.delete("/:id", deleteMenuItem); // Delete

// Inventory adjustment endpoint
router.patch("/inventory", adjustInventory);

export default router;
