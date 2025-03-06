import db from "../localdb/index";
import { Order } from "../localdb/index";

// ✅ Fetch Open Orders (Online First, Offline Fallback)
export const getOpenOrders = async (): Promise<Order[]> => {
    if (navigator.onLine) {
        try {
            const response = await fetch("http://localhost:5050/api/orders?status=open");
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error("Error fetching open orders:", error);
        }
    }

    // ✅ If offline, return local orders
    return getOrdersOffline();
};

// ✅ Fetch Orders from IndexedDB (Offline Mode)
export const getOrdersOffline = async (): Promise<Order[]> => {
    try {
        return await db.table("orders").where("orderStatus").equals("open").toArray();
    } catch (error) {
        console.error("Error fetching orders from IndexedDB:", error);
        return [];
    }
};

// ✅ Fetch Order by Table Number
export const getOrderByTable = async (tableNumber: number): Promise<Order | null> => {
    if (navigator.onLine) {
        try {
            const response = await fetch(`http://localhost:5050/api/orders?tableNumber=${tableNumber}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error("Error fetching order by table:", error);
        }
    }

    // ✅ Fallback to IndexedDB if offline
    try {
        return await db.table("orders").where("tableNumber").equals(tableNumber).first();
    } catch (error) {
        console.error("Error fetching order from IndexedDB:", error);
        return null;
    }
};
