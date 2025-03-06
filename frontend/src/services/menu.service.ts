import db from "../localdb/index"

export interface MenuVariation {
  type: string
  price: number
  quantity: number
}

export interface MenuItem {
  itemId: string
  name: string
  variation?: string
  price: number
  category: string
  subcategory: string
  variations: { type: string; price: number; quantity: number }[] // ✅ Ensure variations exist
  isAvailable: boolean // ✅ Include isAvailable field
}

export interface MenuCategory {
  superCategory: string
  subCategories: string[]
}

// ✅ Fetch and Cache Menu Data (Online and Offline)
export const fetchAndCacheMenu = async (): Promise<void> => {
  if (!navigator.onLine) {
    console.log("Offline: Using cached menu data.")
    return
  }

  try {
    const response = await fetch("http://localhost:5050/api/menu")
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const menuData = await response.json()

    // ✅ Validate the API response
    if (
      !menuData ||
      !Array.isArray(menuData.categories) ||
      !Array.isArray(menuData.items)
    ) {
      throw new Error("Invalid menu data received from API.")
    }

    console.log("Fetched menu data:", menuData)

    await db.transaction("rw", db.menuCategories, db.menuItems, async () => {
      await db.menuCategories.clear()
      await db.menuItems.clear()
      await db.menuCategories.bulkAdd(menuData.categories)
      await db.menuItems.bulkAdd(menuData.items)
    })
  } catch (error) {
    console.error("Failed to fetch menu data:", error)
  }
}

// ✅ Get Menu Categories (Online/Offline)
export const getMenuCategories = async (): Promise<MenuCategory[]> => {
  if (navigator.onLine) {
    try {
      const response = await fetch("http://localhost:5050/api/menu/categories")
      if (response.ok) {
        const categories: MenuCategory[] = await response.json()
        return categories
      }
    } catch (error) {
      console.warn("Failed to fetch categories, using offline data:", error)
    }
  }

  return db.menuCategories.toArray() // ✅ IndexedDB fallback
}

// ✅ Get Menu Items by Subcategory (Online/Offline)
export const getMenuItemsByCategory = async (
  subCategory: string
): Promise<MenuItem[]> => {
  if (navigator.onLine) {
    try {
      const response = await fetch(
        `http://localhost:5050/api/menu/items?subCategory=${subCategory}`
      )
      if (response.ok) {
        const categoryData: {
          items: {
            _id: string
            name: string
            variations: { type: string; price: number; quantity?: number }[]
            isAvailable?: boolean
            modifiers?: string[]
            category: string
            subcategory: string
          }[]
        } = await response.json()

        return categoryData.items.map((item) => ({
          itemId: item._id,
          name: item.name,
          category: item.category,
          subcategory: item.subcategory,
          variations: item.variations.map((v) => ({
            type: v.type,
            price: v.price,
            quantity: v.quantity ?? 1, // ✅ Ensure quantity exists
          })) as MenuVariation[], // ✅ Explicitly cast to MenuVariation[]
          price: item.variations.length > 0 ? item.variations[0].price : 0, // ✅ Assign price from first variation
          isAvailable: item.isAvailable ?? true,
          modifiers: item.modifiers || [],
        }))
      }
    } catch (error) {
      console.warn("Failed to fetch items, using offline data:", error)
    }
  }

  // ✅ IndexedDB fallback with quantity fix
  return db.menuItems
    .where("subcategory")
    .equals(subCategory)
    .toArray()
    .then((items) =>
      items.map((item) => ({
        ...item,
        variations: item.variations.map((v) => ({
          ...v,
          quantity: v.quantity ?? 1, // ✅ Ensure quantity exists in offline mode
        })) as MenuVariation[], // ✅ Explicitly cast to MenuVariation[]
        price: item.variations.length > 0 ? item.variations[0].price : 0, // ✅ Assign price from first variation
      }))
    )
}

// ✅ Sync Menu Data When Online
export const syncMenuData = async (): Promise<void> => {
  console.log("Reconnecting: Syncing menu data...")
  await fetchAndCacheMenu()
}

// ✅ Automatically Sync Menu Data When Going Online
window.addEventListener("online", syncMenuData)
