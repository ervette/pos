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
      const response = await fetch("http://localhost:5050/api/orders", {
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
      await addToSyncQueue("addOrder", orderData)
      console.log("⏳ Order added to sync queue.")
    }
  } catch (error) {
    console.error("❌ Error processing order:", error)

    // ✅ Save offline fallback
    await db.orders.put(orderData)
    await addToSyncQueue("addOrder", orderData)
    console.log("📦 Order saved offline after failure.")
  }
}



// // ✅ Updated: Submit Order to Backend and return the saved order (with _id)
// const submitOrderToBackend = async (orderData: Order): Promise<Order | null> => {
//   try {
//     const response = await fetch("http://localhost:5050/api/orders", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(orderData),
//     })

//     if (!response.ok) {
//       throw new Error(`Failed to save order: ${response.statusText}`)
//     }

//     const savedOrder = await response.json()
//     console.log("✅ Order successfully saved to backend:", savedOrder)
//     return savedOrder // includes _id
//   } catch (error) {
//     console.warn("⚠️ Failed to sync order, saving locally.", error)
//     return null
//   }
// }


// // ✅ Save Order to IndexedDB & Queue for Sync
// const saveOrderOffline = async (orderData: Order): Promise<void> => {
//   try {
//     if (!orderData.orderId) {
//       throw new Error("Missing orderId for offline order.")
//     }

//     const existingOrder = await db
//       .table("orders")
//       .where("orderId")
//       .equals(orderData.orderId)
//       .first()

//     if (existingOrder) {
//       console.warn(
//         "Duplicate order detected, skipping save:",
//         orderData.orderId
//       )
//       return
//     }

//     // ✅ Convert `_id` to a string since IndexedDB returns a number
//     const localId = await db.table("orders").add(orderData)
//     const localIdString = String(localId)

//     console.log(`Order saved locally with ID: ${localIdString}`)

//     const existingQueueItem = await db
//       .table("syncQueue")
//       .where("data.orderId")
//       .equals(orderData.orderId)
//       .first()

//     if (!existingQueueItem) {
//       await addToSyncQueue("addOrder", { ...orderData, _id: localIdString }) // ✅ Use `_id` as a string
//       console.log("Order added to sync queue.")
//     } else {
//       console.warn(
//         "Order already in sync queue, skipping add:",
//         orderData.orderId
//       )
//     }
//   } catch (error) {
//     console.error("Failed to save order offline:", error)
//   }
// }

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
          `http://localhost:5050/api/orders/${record.data.orderId}`
        )

        if (checkOrder.ok) {
          console.warn(
            "Order already exists in backend, updating instead of re-adding:",
            record.data.orderId
          )

          await fetch(
            `http://localhost:5050/api/orders/${record.data.orderId}`,
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
          response = await fetch("http://localhost:5050/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record.data),
          })
        } else if (record.operation === "updateOrder") {
          response = await fetch(
            `http://localhost:5050/api/orders/${record.data.orderId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(record.data),
            }
          )
        } else if (record.operation === "deleteOrder") {
          response = await fetch(
            `http://localhost:5050/api/orders/${record.data.orderId}`,
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
