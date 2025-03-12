import Dexie from "dexie"

export interface OrderItem {
  itemId: string
  name: string
  variation: string
  price: number
  quantity: number
  modifiers?: string[] // ✅ Added this field
  notes?: string // ✅ Added this field
}

// ✅ Define Order Schema with Correct Structure
export interface Order {
  _id?: string
  orderId: string
  tableNumber: number
  items: OrderItem[] // ✅ Ensure Order.items uses OrderItem[]
  totalPrice: number
  orderStatus: "open" | "complete" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

export interface SyncQueueItem {
  id?: number
  operation: string
  data: Order
}

export interface MenuItem {
  itemId: string
  name: string
  variations: MenuVariation[] // ✅ Fix: Keep variations array
  isAvailable: boolean
  modifiers?: string[]
  category: string
  subcategory: string
}

export interface MenuVariation {
  type: string
  price: number
  quantity: number
}

export interface MenuCategory {
  superCategory: string
  subCategories: string[]
}

// ✅ Extend Dexie to include tables
class POSDatabase extends Dexie {
  orders!: Dexie.Table<Order, string>
  syncQueue!: Dexie.Table<SyncQueueItem, number>
  menuCategories!: Dexie.Table<MenuCategory, number>
  menuItems!: Dexie.Table<MenuItem, number>
  config!: Dexie.Table<{ id?: number }, number>

  constructor() {
    super("POSDB")

    this.version(2).stores({
      orders:
        "++id, orderId, tableNumber, items, totalPrice, orderStatus, createdAt",
      syncQueue: "++id, operation, data, data.orderId",
      menuCategories: "++id, superCategory, subCategories", // ✅ Fixed
      menuItems: "++id, itemId, name, variation, price, category, subcategory", // ✅ Fixed
      config: "++id",
    })
  }
}

const db = new POSDatabase()
export default db
