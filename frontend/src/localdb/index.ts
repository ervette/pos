import Dexie from "dexie";

export interface Order {
  id?: number;
  orderId?: string;
  tableNumber: number;
  items: { name: string; quantity: number; price: number }[];
  totalPrice: number;
  status: "open" | "completed" | "cancelled";
  createdAt: Date;
}

export interface SyncQueueItem {
  id?: number;
  operation: string;
  data: Order;
}

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

// ✅ Extend Dexie to include tables
class POSDatabase extends Dexie {
  orders!: Dexie.Table<Order, number>;
  syncQueue!: Dexie.Table<SyncQueueItem, number>;
  menuCategories!: Dexie.Table<MenuCategory, number>;
  menuItems!: Dexie.Table<MenuItem, number>;
  config!: Dexie.Table<{ id?: number }, number>;

  constructor() {
    super("POSDB");

    this.version(2).stores({
      orders: "++id, orderId, tableNumber, items, totalPrice, orderStatus, createdAt",
      syncQueue: "++id, operation, data, data.orderId",
      menuCategories: "++id, superCategory, subCategories", // ✅ Fixed
      menuItems: "++id, itemId, name, variation, price, category, subcategory", // ✅ Fixed
      config: "++id",
    });
  }
}

const db = new POSDatabase();
export default db;
