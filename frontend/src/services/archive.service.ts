import db from "../localdb"
import { Order } from "../localdb"
import axios from "axios"

export const fetchOrders = async (limit: number): Promise<Order[]> => {
  if (navigator.onLine) {
    const res = await axios.get(
      `http://localhost:5050/api/orders?limit=${limit}`
    )
    const orders: Order[] = res.data

    // Cache offline
    await db.orders.clear()
    await db.orders.bulkAdd(orders)

    return orders
  }

  // Offline: Load cached and limit manually
  const cachedOrders = await db.orders
    .orderBy("createdAt")
    .reverse()
    .limit(limit)
    .toArray()
  return cachedOrders
}

export const deleteOrder = async (orderId: string): Promise<void> => {
  const response = await fetch(`http://localhost:5050/api/orders/${orderId}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete order")
}

export const updateOrderStatus = async (
  orderId: string,
  status: "open" | "paid_other" | "paid_cash" | "paid_card" | "cancelled"
): Promise<void> => {
  const response = await fetch(`http://localhost:5050/api/orders/${orderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderStatus: status }),
  })
  if (!response.ok) throw new Error("Failed to update order status")
}
