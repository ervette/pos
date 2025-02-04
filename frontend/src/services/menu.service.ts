import db from "../localdb/index";

// Fetch menu from backend and store in IndexedDB
export const fetchAndCacheMenu = async (): Promise<void> => {
  if (!navigator.onLine) {
    console.log("Offline: Fetching menu from local storage.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5050/api/menu");
    if (response.ok) {
      const menu = await response.json();
      console.log("Menu fetched from backend:", menu);

      // Store menu in IndexedDB
      await db.table("menu").clear(); // Clear old menu data
      await db.table("menu").bulkAdd(menu);
    }
  } catch (error) {
    console.error("Failed to fetch menu:", error);
  }
};

// Get menu from IndexedDB (fallback for offline mode)
export const getMenuOffline = async () => {
  return await db.table("menu").toArray();
};
