import db from "./index";
import { SyncQueueItem, Order } from "./index";

// Add an operation to the sync queue
export const addToSyncQueue = async (operation: string, data: Order): Promise<void> => {
    await db.table("syncQueue").add({ operation, data });
};

// Retrieve all items from the sync queue
export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
    return await db.table("syncQueue").toArray();
};

// Clear the sync queue
export const clearSyncQueue = async (): Promise<void> => {
    await db.table("syncQueue").clear();
};

// Delete a specific item from the sync queue by ID
export const deleteFromSyncQueue = async (id: number): Promise<void> => {
    await db.table("syncQueue").delete(id);
};
