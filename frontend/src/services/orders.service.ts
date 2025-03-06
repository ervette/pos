import db from "../localdb/index"
import { Order } from "../localdb/index"

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

      // ✅ Ensure at least one order exists before returning
      if (!Array.isArray(orderData) || orderData.length === 0) {
        console.warn(`No active order found for table ${tableNumber}`)
        return null
      }

      console.log(`Fetched open order for table ${tableNumber}:`, orderData[0])

      return orderData[0] // ✅ Always return the latest open order
    } catch (error) {
      console.error("Error fetching order by table:", error)
    }
  }

  // ✅ Fallback to IndexedDB if offline
  try {
    const localOrder = await db
      .table("orders")
      .where("tableNumber")
      .equals(tableNumber)
      .and((order) => order.orderStatus === "open") // ✅ Only return open orders
      .first()

    if (!localOrder) {
      console.warn(`No active offline order found for table ${tableNumber}`)
    }

    return localOrder || null
  } catch (error) {
    console.error("Error fetching order from IndexedDB:", error)
    return null
  }
}
