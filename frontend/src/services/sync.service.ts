import db from "../localdb/index"
import { addToSyncQueue, getSyncQueue } from "../localdb/syncQueue"
import { Order } from "../localdb/index"

// ✅ Handle Order Submission (Works Online and Offline)
export const handleOrderSubmission = async (orderData: Order): Promise<void> => {
  try {
    if (!orderData.orderId) {
      orderData.orderId = crypto.randomUUID()
    }

    if (navigator.onLine) {
      const response = await fetch("http://18.130.143.223:5050/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const { order: mongoOrder } = await response.json()

        if (mongoOrder?._id) {
          orderData._id = mongoOrder._id
          console.log("✅ Order saved to backend:", mongoOrder)
        } else {
          console.warn("No _id returned from backend, saving without _id.")
        }
      } else {
        throw new Error(`Failed to save order: ${response.statusText}`)
      }
    }

    // ✅ Always save to IndexedDB (new or updated)
    await db.orders.put(orderData)
    console.log("📦 Order saved locally with ID:", orderData.orderId)

    // ✅ Queue for sync if no _id (offline or backend failed)
    if (!orderData._id) {
      const existing = await db.syncQueue
        .where("data.orderId")
        .equals(orderData.orderId)
        .first()
    
      if (existing) {
        // Replace existing queue entry
        await db.syncQueue.put({
          id: existing.id, // Keep same ID to overwrite
          operation: "addOrder",
          data: orderData,
        })
        console.log("🔁 Updated existing sync queue entry for order:", orderData.orderId)
      } else {
        await addToSyncQueue("addOrder", orderData)
        console.log("⏳ New order added to sync queue.")
      }
    }
    
  } catch (error) {
    console.error("❌ Error processing order:", error)

    // ✅ Save offline fallback
    await db.orders.put(orderData)
    await addToSyncQueue("addOrder", orderData)
    console.log("📦 Order saved offline after failure.")
  }
}

// ✅ Sync Offline Orders with Backend
export const syncOfflineData = async (): Promise<void> => {
  try {
    const syncQueue = await getSyncQueue()

    for (const record of syncQueue) {
      try {
        let response

        if (!record.data.orderId) {
          console.warn("Skipping record due to missing orderId:", record)
          continue
        }

        const checkOrder = await fetch(
          `http://18.130.143.223:5050/api/orders/${record.data.orderId}`
        )

        if (checkOrder.ok) {
          console.warn(
            "Order already exists in backend, updating instead of re-adding:",
            record.data.orderId
          )

          await fetch(
            `http://18.130.143.223:5050/api/orders/${record.data.orderId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(record.data),
            }
          )

          // ✅ Use `record.id` instead of `record._id`
          if (typeof record.id !== "undefined") {
            await db.table("syncQueue").delete(record.id)
          } else {
            console.warn("Skipping deletion from syncQueue: Missing id", record)
          }
          continue
        }

        if (record.operation === "addOrder") {
          response = await fetch("http://18.130.143.223:5050/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record.data),
          })
        } else if (record.operation === "updateOrder") {
          response = await fetch(
            `http://18.130.143.223:5050/api/orders/${record.data.orderId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(record.data),
            }
          )
        } else if (record.operation === "deleteOrder") {
          response = await fetch(
            `http://18.130.143.223:5050/api/orders/${record.data.orderId}`,
            {
              method: "DELETE",
            }
          )
        }

        if (response?.ok) {
          console.log("Sync successful:", record)

          // ✅ Use `record.id` instead of `record._id`
          if (typeof record.id !== "undefined") {
            await db.table("syncQueue").delete(record.id)
          } else {
            console.warn("Skipping deletion from syncQueue: Missing id", record)
          }

          if (typeof record.data._id !== "undefined") {
            await db.table("orders").delete(record.data._id)
          } else {
            console.warn(
              "Skipping deletion from orders table: Missing _id",
              record
            )
          }
        } else {
          console.error("Failed to sync order:", response?.statusText)
        }
      } catch (error) {
        console.error("Sync error:", error)
      }
    }
  } catch (error) {
    console.error("Error fetching sync queue:", error)
  }
}

// ✅ Automatically trigger sync when going online
window.addEventListener("online", syncOfflineData)
