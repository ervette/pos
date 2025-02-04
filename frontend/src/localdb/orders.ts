import db from "./index";
import { Order } from "./index"; // Import Order interface
import { addToSyncQueue } from "./syncQueue"; // Import sync queue handling

// Add a new order locally and queue for sync
export const addOrder = async (order: Partial<Order>): Promise<number> => {
  const fullOrder: Order = {
    id: order.id ?? 0, // Ensure an ID is assigned
    tableNumber: order.tableNumber !== undefined ? order.tableNumber : -1, // Ensure tableNumber is always a number
    items: order.items ?? [], // Default empty items array
    totalPrice: order.totalPrice ?? 0, // Ensure total price is defined
    status: order.status ?? "open", // Ensure status is always set
    createdAt: order.createdAt ?? new Date(), // Ensure createdAt timestamp is present
  };

  const orderId = (await db.table("orders").add(fullOrder)) as number; // Fix type issue
  console.log(`Order saved locally with ID: ${orderId}`);

  // Add the order to the sync queue for later synchronization
  await addToSyncQueue("addOrder", { ...fullOrder, id: orderId });
  return orderId;
};

// Get all orders (including offline)
export const getAllOrders = async (): Promise<Order[]> => {
  return await db.table("orders").toArray();
};

// Get an order by ID
export const getOrderById = async (id: number): Promise<Order | undefined> => {
  return await db.table("orders").get(id);
};

// Update an order locally and queue for sync
export const updateOrder = async (id: number, updatedOrder: Partial<Order>): Promise<void> => {
  const existingOrder = await db.table("orders").get(id);
  if (!existingOrder) {
    console.error(`Order ${id} not found for update.`);
    return;
  }

  const updatedFullOrder: Order = {
    ...existingOrder,
    ...updatedOrder,
    tableNumber: updatedOrder.tableNumber !== undefined ? updatedOrder.tableNumber : existingOrder.tableNumber,
    totalPrice: updatedOrder.totalPrice ?? existingOrder.totalPrice,
    status: updatedOrder.status ?? existingOrder.status,
    createdAt: updatedOrder.createdAt ?? existingOrder.createdAt,
  };

  await db.table("orders").put(updatedFullOrder);
  console.log(`Order ${id} updated locally`);

  // Add the update operation to the sync queue
  await addToSyncQueue("updateOrder", { id, ...updatedFullOrder });
};

// Delete an order locally and queue for sync
export const deleteOrder = async (id: number): Promise<void> => {
  const existingOrder = await db.table("orders").get(id);

  if (!existingOrder) {
    console.error(`Order ${id} not found for deletion.`);
    return;
  }

  await db.table("orders").delete(id);
  console.log(`Order ${id} deleted locally`);

  // Ensure all required fields are present before adding to sync queue
  await addToSyncQueue("deleteOrder", {
    id,
    tableNumber: existingOrder.tableNumber,
    items: existingOrder.items,
    totalPrice: existingOrder.totalPrice,
    status: existingOrder.status,
    createdAt: existingOrder.createdAt,
  });
};
