import db from "../localdb/index";

export interface MenuItem {
  itemId: string;
  name: string;
  variation?: string;
  price: number;
  category: string;
  subcategory: string;
}

export interface MenuCategory {
  superCategory: string;
  subCategories: string[];
}

// ✅ Fetch and Cache Menu Data (Online and Offline)
export const fetchAndCacheMenu = async (): Promise<void> => {
  if (!navigator.onLine) {
    console.log("Offline: Using cached menu data.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5050/api/menu");
    if (response.ok) {
      const menuData: { categories: MenuCategory[]; items: MenuItem[] } = await response.json();
      console.log("Fetched menu data:", menuData);

      await db.transaction("rw", db.menuCategories, db.menuItems, async () => {
        await db.menuCategories.clear();
        await db.menuItems.clear();
        await db.menuCategories.bulkAdd(menuData.categories);
        await db.menuItems.bulkAdd(menuData.items);
      });
    }
  } catch (error) {
    console.error("Failed to fetch menu data:", error);
  }
};

// ✅ Get Menu Categories (Online/Offline)
export const getMenuCategories = async (): Promise<MenuCategory[]> => {
  if (navigator.onLine) {
    try {
      const response = await fetch("http://localhost:5050/api/menu/categories");
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn("Failed to fetch categories, using offline data:", error);
    }
  }
  return db.menuCategories.toArray();
};

// ✅ Get Menu Items by Subcategory (Online/Offline)
export const getMenuItemsByCategory = async (subcategory: string): Promise<MenuItem[]> => {
  if (navigator.onLine) {
    try {
      const response = await fetch(`http://localhost:5050/api/menu/items?subcategory=${subcategory}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn("Failed to fetch items, using offline data:", error);
    }
  }
  return db.menuItems.where("subcategory").equals(subcategory).toArray();
};

// ✅ Sync Menu Data When Online
export const syncMenuData = async (): Promise<void> => {
  console.log("Reconnecting: Syncing menu data...");
  await fetchAndCacheMenu();
};

// ✅ Automatically Sync Menu Data When Going Online
window.addEventListener("online", syncMenuData);
