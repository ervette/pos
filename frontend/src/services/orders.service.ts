import db from "../localdb/index"
import { Order, OrderItem } from "../localdb/index"

// ✅ Fetch Open Orders (Online First, Offline Fallback)
export const getOpenOrders = async (): Promise<Order[]> => {
  if (navigator.onLine) {
    try {
      const response = await fetch(
        "http://localhost:5050/api/orders?status=open"
      )
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error("Error fetching open orders:", error)
    }
  }

  // ✅ If offline, return local orders
  return getOrdersOffline()
}

// ✅ Fetch Orders from IndexedDB (Offline Mode)
export const getOrdersOffline = async (): Promise<Order[]> => {
  try {
    return await db
      .table("orders")
      .where("orderStatus")
      .equals("open")
      .toArray()
  } catch (error) {
    console.error("Error fetching orders from IndexedDB:", error)
    return []
  }
}

// ✅ Fetch Order by Table Number
export const getOrderByTable = async (
  tableNumber: number
): Promise<Order | null> => {
  if (navigator.onLine) {
    try {
      const response = await fetch(
        `http://localhost:5050/api/orders?tableNumber=${tableNumber}&status=open`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.statusText}`)
      }

      const orderData: Order[] = await response.json()

      if (!Array.isArray(orderData) || orderData.length === 0) {
        console.warn(`No active order found for table ${tableNumber}`)
        return null
      }

      return orderData[0]
    } catch (error) {
      console.error("Error fetching order by table:", error)
    }
  }

  try {
    const localOrder = await db
      .table("orders")
      .where("tableNumber")
      .equals(tableNumber)
      .and((order) => order.orderStatus === "open")
      .first()

    if (!localOrder) {
      console.warn(`No active offline order found for table ${tableNumber}`)
    }

    return localOrder
      ? {
          ...localOrder,
          items: localOrder.items.map((item: OrderItem) => ({
            ...item,
            variation: item.variation || "Default", // ✅ Ensure variation is always set
            modifiers: item.modifiers ?? [], // ✅ Default to empty array if undefined
            notes: item.notes ?? "", // ✅ Default to empty string if undefined
          })),
        }
      : null
  } catch (error) {
    console.error("Error fetching order from IndexedDB:", error)
    return null
  }
}

export const removeOrderItem = async (
  orderId: string,
  orderItemId: string // ✅ Ensure we pass `orderItemId`, not `itemId`
): Promise<void> => {
  try {
    console.log(`🛠 API CALL: Deleting orderItemId: ${orderItemId} from orderId: ${orderId}`);

    const response = await fetch(
      `http://localhost:5050/api/orders/${orderId}/items/${orderItemId}`, // ✅ Use `orderItemId`
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`❌ Failed to remove item: ${response.statusText}`);
    }

    console.log(`✅ Successfully deleted orderItemId: ${orderItemId} from orderId: ${orderId}`);
  } catch (error) {
    console.error("❌ Error removing order item:", error);
  }
};
