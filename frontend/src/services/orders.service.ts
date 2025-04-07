import db from "../localdb/index"
import { addToSyncQueue } from "../localdb/syncQueue"
import { Order, OrderItem } from "../localdb/index"

// ✅ Fetch Open Orders (Online First, Offline Fallback)
export const getOpenOrders = async (): Promise<Order[]> => {
  if (navigator.onLine) {
    try {
      const response = await fetch(
        "http://18.130.143.223:5050/api/orders?status=open"
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
        `http://18.130.143.223:5050/api/orders?tableNumber=${tableNumber}&status=open`
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
  orderItemId: string
): Promise<void> => {
  try {
    console.log(
      `🛠 Deleting orderItemId: ${orderItemId} from orderId: ${orderId}`
    )

    if (navigator.onLine) {
      // ✅ Online: normal backend delete
      const response = await fetch(
        `http://18.130.143.223:5050/api/orders/${orderId}/items/${orderItemId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      )

      if (!response.ok) {
        throw new Error(`❌ Failed to remove item: ${response.statusText}`)
      }

      console.log(`✅ Order item ${orderItemId} removed from backend.`)
    }

    // ✅ Either way (online or offline), update local order
    const localOrder = await db.orders
      .where("orderId")
      .equals(orderId)
      .first()

    if (!localOrder) {
      console.warn("⚠️ No local order found with ID:", orderId)
      return
    }

    // ✅ Remove item from order
    const updatedItems = localOrder.items.filter(
      (item) => item.orderItemId !== orderItemId
    )
    const updatedOrder: Order = {
      ...localOrder,
      items: updatedItems,
      updatedAt: new Date(),
      totalPrice: updatedItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      ),
    }

    // ✅ Save updated order locally
    await db.orders.put(updatedOrder)
    console.log("📦 Updated local order after item removal.")

    // ✅ Update syncQueue entry (if any)
    const existingQueueEntry = await db.syncQueue
      .where("data.orderId")
      .equals(orderId)
      .first()

    if (existingQueueEntry) {
      await db.syncQueue.put({
        id: existingQueueEntry.id,
        operation: "addOrder", // still treat as add/update
        data: updatedOrder,
      })
      console.log("🔁 Updated syncQueue with modified order (item removed).")
    } else if (!navigator.onLine) {
      await addToSyncQueue("addOrder", updatedOrder)
      console.log("⏳ Queued updated order for sync (offline removal).")
    }
  } catch (error) {
    console.error("❌ Error removing order item:", error)
  }
}


export const cancelOrder = async (_id: string) => {
  const response = await fetch(`http://18.130.143.223:5050/api/orders/${_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderStatus: "cancelled" }),
  })

  if (!response.ok) {
    throw new Error("Failed to cancel the order")
  }

  const data = await response.json()
  return data
}

export const changeOrderStatus = async (
  orderId: string,
  newStatus: "open" | "paid_other" | "paid_cash" | "paid_card" | "cancelled"
): Promise<void> => {
  try {
    const existingOrder = await db.orders
      .where("orderId")
      .equals(orderId)
      .first()

    if (!existingOrder) {
      console.error("Order not found in local DB:", orderId)
      return
    }

    // Update status locally
    const updatedOrder = {
      ...existingOrder,
      orderStatus: newStatus,
      updatedAt: new Date(),
    }

    await db.orders.put(updatedOrder)
    console.log("✅ Order status updated in IndexedDB:", updatedOrder)

    // Send update to MongoDB using orderId
    if (navigator.onLine) {
      const response = await fetch(
        `http://18.130.143.223:5050/api/orders/orderId/${orderId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderStatus: newStatus }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to update status on server")
      }

      console.log("✅ Order status updated in MongoDB via orderId:", orderId)
    } else {
      console.log("📴 Offline: Status updated locally only.")
    }
  } catch (error) {
    console.error("❌ Failed to change order status:", error)
  }
}
