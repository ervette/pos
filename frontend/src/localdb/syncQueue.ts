import db from "./index";
import { SyncQueueItem, Order } from "./index";

export const addToSyncQueue = async (operation: string, data: Order): Promise<void> => {
  await db.table("syncQueue").add({ operation, data });
};

export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  return await db.table("syncQueue").toArray();
};

export const clearSyncQueue = async (): Promise<void> => {
  await db.table("syncQueue").clear();
};
