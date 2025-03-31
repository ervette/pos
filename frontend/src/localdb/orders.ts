import db from "./index"
import { Order } from "./index" // Import Order interface
import { addToSyncQueue, getSyncQueue, deleteFromSyncQueue } from "./syncQueue" // Import sync queue handling

// Add a new order locally and queue for sync
export const addOrder = async (order: Partial<Order>): Promise<number> => {
  const fullOrder: Order = {
    orderId: order.orderId ?? crypto.randomUUID(), // ✅ Ensure orderId exists
    tableNumber: order.tableNumber !== undefined ? order.tableNumber : -1, // ✅ Ensure tableNumber is always a number
    items: order.items ?? [], // ✅ Default empty items array
    totalPrice: order.totalPrice ?? 0, // ✅ Ensure total price is defined
    orderStatus: order.orderStatus ?? "open", // ✅ Fix: Use orderStatus instead of status
    createdAt: order.createdAt ?? new Date(), // ✅ Ensure createdAt timestamp is present
    updatedAt: order.updatedAt ?? new Date(), // ✅ Ensure updatedAt is set
  }

  const orderId = (await db.table("orders").add(fullOrder)) as number
  console.log(`Order saved locally with ID: ${orderId}`)

  // ✅ Add the order to the sync queue
  await addToSyncQueue("addOrder", fullOrder)
  return orderId
}

// Get all orders (including offline)
export const getAllOrders = async (): Promise<Order[]> => {
  return await db.table("orders").toArray()
}

// Get an order by ID
export const getOrderById = async (id: number): Promise<Order | undefined> => {
  return await db.table("orders").get(id)
}

// Update an order locally and queue for sync
export const updateOrder = async (
  id: number,
  updatedOrder: Partial<Order>
): Promise<void> => {
  const existingOrder = await db.table("orders").get(id)
  if (!existingOrder) {
    console.error(`Order ${id} not found for update.`)
    return
  }

  const updatedFullOrder: Order = {
    ...existingOrder,
    ...updatedOrder,
    tableNumber:
      updatedOrder.tableNumber !== undefined
        ? updatedOrder.tableNumber
        : existingOrder.tableNumber,
    totalPrice: updatedOrder.totalPrice ?? existingOrder.totalPrice,
    orderStatus: updatedOrder.orderStatus ?? existingOrder.orderStatus, // ✅ Fix: Use orderStatus
    createdAt: updatedOrder.createdAt ?? existingOrder.createdAt,
    updatedAt: new Date(), // ✅ Always update the timestamp
  }

  await db.table("orders").put(updatedFullOrder)
  console.log(`Order ${id} updated locally`)

  // ✅ Add the update operation to the sync queue
  await addToSyncQueue("updateOrder", updatedFullOrder)
}

// Delete an order locally and queue for sync
export const deleteOrder = async (id: number): Promise<void> => {
  const existingOrder = await db.table("orders").get(id)

  if (!existingOrder) {
    console.error(`Order ${id} not found for deletion.`)
    return
  }

  await db.table("orders").delete(id)
  console.log(`Order ${id} deleted locally`)

  // ✅ Add delete operation to sync queue
  await addToSyncQueue("deleteOrder", {
    orderId: existingOrder.orderId, // ✅ Ensure orderId is passed correctly
    tableNumber: existingOrder.tableNumber,
    items: existingOrder.items,
    totalPrice: existingOrder.totalPrice,
    orderStatus: existingOrder.orderStatus, // ✅ Fix: Use orderStatus
    createdAt: existingOrder.createdAt,
    updatedAt: new Date(), // ✅ Ensure updatedAt is updated
  })
}

export const handleOfflineDelete = async (orderId: string) => {
  const queueItems = await getSyncQueue()
  const existingAdd = queueItems.find(
    (item) => item.data.orderId === orderId && item.operation === "add"
  )

  if (existingAdd) {
    // Remove the queued "add" if it hasn’t been synced yet
    await deleteFromSyncQueue(existingAdd.id!)
    await db.orders.delete(orderId)
  } else {
    // Otherwise queue a "delete"
    await addToSyncQueue("delete", { orderId } as Order)
    await db.orders.delete(orderId)
  }
}
