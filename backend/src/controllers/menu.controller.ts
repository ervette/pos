import { Request, Response } from "express";
import Menu from "../models/menu.model";

// Create a new menu item
export const createMenuItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const newMenuItem = new Menu(req.body);
      await newMenuItem.save();
      res.status(201).json(newMenuItem);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  };

// Get all menu items
export const getAllMenuItems = async (req: Request, res: Response): Promise<void> => {
    try {
      const menus = await Menu.find();
      res.json(menus);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  };

// Get a specific menu item by ID
export const getMenuItemById = async (req: Request, res: Response): Promise<void> => {
    try {
      const menuItem = await Menu.findById(req.params.id);
  
      if (!menuItem) {
        res.status(404).json({ error: "Menu item not found" }); // Removed return
        return; // Explicitly end function execution after sending the response
      }
  
      res.json(menuItem); // Send the menu item if found
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  };
  
// Update a menu item
export const updateMenuItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedMenuItem = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedMenuItem) {
        res.status(404).json({ error: "Menu item not found" });
        return; // End function execution after sending the response
      }
      res.json(updatedMenuItem); // Send the updated menu item
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  };
  

// Delete a menu item
export const deleteMenuItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedMenuItem = await Menu.findByIdAndDelete(req.params.id);
      if (!deletedMenuItem) {
        res.status(404).json({ error: "Menu item not found" });
        return; // End function execution after sending the response
      }
      res.json({ message: "Menu item deleted successfully" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  };
  

// Adjust inventory for a specific variation
export const adjustInventory = async (req: Request, res: Response): Promise<void> => {
    const { itemId, variationType, quantity } = req.body;
    try {
      const menu = await Menu.findOneAndUpdate(
        { "items._id": itemId, "items.variations.type": variationType },
        { $inc: { "items.$[item].variations.$[variation].quantity": quantity } },
        {
          arrayFilters: [
            { "item._id": itemId },
            { "variation.type": variationType },
          ],
          new: true,
        }
      );
  
      if (!menu) {
        res.status(404).json({ error: "Menu item or variation not found" });
        return; // End function execution after sending the response
      }
      res.json(menu); // Send the updated menu
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  };
  