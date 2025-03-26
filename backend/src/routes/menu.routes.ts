import express from "express"
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
  deleteSubCategory,
  updateMenuItemByItemId,
} from "../controllers/menu.controller"

const router = express.Router()

// CRUD endpoints for menu items
router.get("/items", getMenuItemsByCategory)
router.get("/categories", getMenuCategories)
router.put("/supercategory", updateSuperCategory) // Rename superCategory
router.put("/subcategory", updateSubCategory) // Rename subCategory
router.delete("/supercategory/:superCategory", deleteSuperCategory) // Delete superCategory
router.delete("/subcategory/:superCategory/:subCategory", deleteSubCategory) // Delete subCategory
router.put("/item/:itemId", updateMenuItemByItemId) // Update menu item

router.post("/", createMenuItem) // Create
router.get("/", getAllMenuItems) // Read (all)
router.get("/:id", getMenuItemById) // Read (specific item)
router.put("/:id", updateMenuItem) // Update
router.delete("/item/:itemId", deleteMenuItem) // Delete

// Inventory adjustment endpoint
router.patch("/inventory", adjustInventory)

export default router
