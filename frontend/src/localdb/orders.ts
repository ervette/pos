import { IndexableType } from "dexie";
import db from "./index";
import { Order } from "./index"; // Import Order interface

// Add a new order locally
export const addOrder = async (order: Order): Promise<IndexableType> => {
  return await db.table("orders").add(order);
};

// Get all orders
export const getAllOrders = async (): Promise<Order[]> => {
  return await db.table("orders").toArray();
};

// Get an order by ID
export const getOrderById = async (id: number): Promise<Order | undefined> => {
  return await db.table("orders").get(id);
};

// Update an order
export const updateOrder = async (id: number, updatedOrder: Partial<Order>): Promise<void> => {
  await db.table("orders").update(id, updatedOrder);
};

// Delete an order
export const deleteOrder = async (id: number): Promise<void> => {
  await db.table("orders").delete(id);
};
