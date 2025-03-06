import { Request, Response } from "express"
import Menu from "../models/menu.model"

// Create a new menu item
export const createMenuItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newMenuItem = new Menu(req.body)
    await newMenuItem.save()
    res.status(201).json(newMenuItem)
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message })
    } else {
      res.status(500).json({ error: "An unknown error occurred" })
    }
  }
}

// Get all menu items
export const getAllMenuItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const menus = await Menu.find()
    res.json(menus)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })
    } else {
      res.status(500).json({ error: "An unknown error occurred" })
    }
  }
}

// Get a specific menu item by ID
export const getMenuItemById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const menuItem = await Menu.findById(req.params.id)

    if (!menuItem) {
      res.status(404).json({ error: "Menu item not found" }) // Removed return
      return // Explicitly end function execution after sending the response
    }

    res.json(menuItem) // Send the menu item if found
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })
    } else {
      res.status(500).json({ error: "An unknown error occurred" })
    }
  }
}

// Update a menu item
export const updateMenuItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updatedMenuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!updatedMenuItem) {
      res.status(404).json({ error: "Menu item not found" })
      return // End function execution after sending the response
    }
    res.json(updatedMenuItem) // Send the updated menu item
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message })
    } else {
      res.status(500).json({ error: "An unknown error occurred" })
    }
  }
}

// Delete a menu item
export const deleteMenuItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deletedMenuItem = await Menu.findByIdAndDelete(req.params.id)
    if (!deletedMenuItem) {
      res.status(404).json({ error: "Menu item not found" })
      return // End function execution after sending the response
    }
    res.json({ message: "Menu item deleted successfully" })
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })
    } else {
      res.status(500).json({ error: "An unknown error occurred" })
    }
  }
}

// Adjust inventory for a specific variation
export const adjustInventory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { itemId, variationType, quantity } = req.body
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
    )

    if (!menu) {
      res.status(404).json({ error: "Menu item or variation not found" })
      return // End function execution after sending the response
    }
    res.json(menu) // Send the updated menu
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })
    } else {
      res.status(500).json({ error: "An unknown error occurred" })
    }
  }
}
// ✅ Get Menu Items by SubCategory
export const getMenuItemsByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subCategory } = req.query

    if (!subCategory || typeof subCategory !== "string") {
      res
        .status(400)
        .json({ error: "Invalid or missing subCategory parameter." })
      return
    }

    // ✅ Find the menu category that contains the requested subCategory
    const menuCategory = await Menu.findOne({ subCategory })

    if (!menuCategory) {
      res.status(404).json({ error: "No items found for this subcategory." })
      return
    }

    res.json({
      superCategory: menuCategory.superCategory,
      subCategory: menuCategory.subCategory,
      items: menuCategory.items,
    })
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })
    } else {
      res.status(500).json({ error: "An unknown error occurred" })
    }
  }
}

// ✅ Get all distinct superCategories and their subCategories
export const getMenuCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    // ✅ Fetch all menu items from the database
    const menuItems = await Menu.find();

    if (!menuItems.length) {
      res.status(404).json({ error: "No menu categories found." });
      return;
    }

    // ✅ Aggregate superCategories with corresponding subCategories
    const categoriesMap = new Map<string, Set<string>>();

    menuItems.forEach((menuItem) => {
      if (!categoriesMap.has(menuItem.superCategory)) {
        categoriesMap.set(menuItem.superCategory, new Set());
      }
      categoriesMap.get(menuItem.superCategory)?.add(menuItem.subCategory);
    });

    // ✅ Convert Map to an array format
    const categories = Array.from(categoriesMap.entries()).map(
      ([superCategory, subCategories]) => ({
        superCategory,
        subCategories: Array.from(subCategories),
      })
    );

    res.json(categories);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};