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
  variations: MenuVariation[]
  isAvailable: boolean
  modifiers?: string[]
}

export interface MenuCategory {
  superCategory: string
  subCategories: string[]
}

export interface IVariationInput {
  type: string
  price: number
}

export interface IModifierInput {
  type: string
  price: number
}

export interface IMenuItemPayload {
  superCategory: string
  subCategory: string
  itemName: string
  variations: IVariationInput[]
  modifiers: string[]
}

export interface IMenuItemUpdatePayload {
  name: string
  superCategory: string
  subCategory: string
  variations: {
    type: string
    price: number
  }[]
  modifiers: string[]
}

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

// ✅ Fetch and Cache Menu Data (Online and Offline)
export const fetchAndCacheMenu = async (): Promise<void> => {
  if (!navigator.onLine) {
    console.log("Offline: Using cached menu data.")
    return
  }

  try {
    const response = await fetch("http://localhost:5050/api/menu")

    if (!response.ok) {
      throw new Error(`Failed to fetch menu data: ${response.statusText}`)
    }

    const menuData: {
      _id: string
      superCategory: string
      subCategory: string
      items: {
        _id: string
        name: string
        variations: { type: string; price: number; quantity?: number }[]
        isAvailable?: boolean
        modifiers?: string[]
      }[]
      createdAt: string
    }[] = await response.json()

    console.log("Received menu data:", menuData)

    if (!Array.isArray(menuData)) {
      throw new Error("Invalid menu structure received: Expected an array.")
    }

    // ✅ Deduplicate categories using a Map
    const categoryMap = new Map<string, Set<string>>()

    menuData.forEach((entry) => {
      if (!categoryMap.has(entry.superCategory)) {
        categoryMap.set(entry.superCategory, new Set())
      }
      categoryMap.get(entry.superCategory)?.add(entry.subCategory)
    })

    const categories: MenuCategory[] = Array.from(categoryMap.entries()).map(
      ([superCategory, subCategorySet]) => ({
        superCategory,
        subCategories: Array.from(subCategorySet),
      })
    )

    // ✅ Transform items
    const items: MenuItem[] = menuData.flatMap((category) =>
      category.items.map((item) => ({
        itemId: item._id,
        name: item.name,
        category: category.superCategory,
        subcategory: category.subCategory,
        variations: item.variations.map((v) => ({
          type: v.type,
          price: v.price,
          quantity: v.quantity ?? 1,
        })),
        price: item.variations.length > 0 ? item.variations[0].price : 0,
        isAvailable: item.isAvailable ?? true,
        modifiers: item.modifiers || [],
      }))
    )

    // ✅ Save to IndexedDB
    await db.transaction("rw", db.menuCategories, db.menuItems, async () => {
      await db.menuCategories.clear()
      await db.menuItems.clear()
      await db.menuCategories.bulkAdd(categories)
      await db.menuItems.bulkAdd(items)
    })

    console.log("✅ Menu data successfully cached (deduplicated).")
  } catch (error) {
    console.error("❌ Failed to fetch menu data:", error)
  }
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
          variations: item.variations.map(
            (v: { type: string; price: number; quantity?: number }) => ({
              type: v.type,
              price: v.price,
              quantity: v.quantity ?? 1,
            })
          ) as MenuVariation[],
          price: item.variations.length > 0 ? item.variations[0].price : 0,
          isAvailable: item.isAvailable ?? true,
          modifiers: item.modifiers || [],
        }))
      }
    } catch (error) {
      console.warn("Failed to fetch items, using offline data:", error)
    }
  }

  return db.menuItems
    .where("subcategory")
    .equals(subCategory)
    .toArray()
    .then((items) =>
      items.map((item) => ({
        ...item,
        variations: item.variations.map((v: MenuVariation) => ({
          ...v,
          quantity: v.quantity ?? 1,
        })),
        price: item.variations.length > 0 ? item.variations[0].price : 0,
      }))
    )
}

export const getAllMenuItemsSafe = async (): Promise<MenuItem[]> => {
  const categories = await getMenuCategories()
  const allItems: MenuItem[] = []

  // Fetch all subcategories one by one, then fetch items
  for (const category of categories) {
    for (const sub of category.subCategories) {
      const itemsInSub = await getMenuItemsByCategory(sub)
      allItems.push(...itemsInSub)
    }
  }

  return allItems
}

export const createMenuItem = async (
  payload: IMenuItemPayload
): Promise<void> => {
  const requestBody = {
    superCategory: payload.superCategory,
    subCategory: payload.subCategory,
    items: [
      {
        name: payload.itemName,
        variations: payload.variations.map((v) => ({
          ...v,
          quantity: 0, // Set default quantity
        })),
        modifiers: payload.modifiers,
        isAvailable: true,
      },
    ],
  }

  const response = await fetch("http://localhost:5050/api/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to create menu item.")
  }
}

export const updateSuperCategoryName = async (
  oldName: string,
  newName: string
): Promise<void> => {
  const response = await fetch(`http://localhost:5050/api/menu/supercategory`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      oldSuperCategory: oldName,
      newSuperCategory: newName,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to update supercategory.")
  }
}

export const updateSubCategoryName = async (
  superCategory: string,
  oldName: string,
  newName: string
): Promise<void> => {
  const response = await fetch(`http://localhost:5050/api/menu/subcategory`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      superCategory: superCategory,
      oldSubCategory: oldName,
      newSubCategory: newName,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to update subcategory.")
  }
}

export const deleteSuperCategory = async (
  superCategory: string
): Promise<void> => {
  const response = await fetch(
    `http://localhost:5050/api/menu/supercategory/${superCategory}`,
    {
      method: "DELETE",
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to delete supercategory.")
  }
}

export const deleteSubCategory = async (
  superCategory: string,
  subCategory: string
): Promise<void> => {
  const response = await fetch(
    `http://localhost:5050/api/menu/subcategory/${superCategory}/${subCategory}`,
    {
      method: "DELETE",
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to delete subcategory.")
  }
}

export const updateMenuItem = async (
  itemId: string,
  updatedData: {
    name: string
    variations: { type: string; price: number }[]
    modifiers: string[]
  }
): Promise<void> => {
  const response = await fetch(
    `http://localhost:5050/api/menu/item/${itemId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error?.message || "Failed to update menu item.")
  }
}

export const deleteMenuItem = async (itemId: string): Promise<void> => {
  const response = await fetch(
    `http://localhost:5050/api/menu/item/${itemId}`,
    {
      method: "DELETE",
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to delete menu item.")
  }
}
