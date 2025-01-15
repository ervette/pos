import db from "../localdb/index"; // Import Dexie instance
import { addToSyncQueue } from "../localdb/syncQueue"; // Import sync queue helper
import { Order } from "../localdb/index"; // Import Order interface

// Function to handle order submission (online and offline)
export const handleOrderSubmission = async (orderData: Order): Promise<void> => {
  if (navigator.onLine) {
    // Online Mode: Send order to backend
    try {
      const response = await fetch("http://localhost:5050/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Order successfully saved to backend:", data);
      } else {
        throw new Error(`Failed to save order to backend: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error saving order online. Saving locally instead:", error);
      await saveOrderOffline(orderData); // Fallback to offline storage
    }
  } else {
    // Offline Mode: Save locally
    console.warn("Offline: Saving order locally");
    await saveOrderOffline(orderData);
  }
};

// Save order to IndexedDB and queue for sync
const saveOrderOffline = async (orderData: Order): Promise<void> => {
  try {
    // Save order locally in the orders table
    const localId = await db.table("orders").add(orderData);
    console.log(`Order saved locally with ID: ${localId}`);

    // Add order to the sync queue for later synchronization
    await addToSyncQueue("addOrder", orderData);
    console.log("Order added to sync queue for synchronization");
  } catch (error) {
    console.error("Failed to save order locally:", error);
  }
};

// Sync offline data to backend
export const syncOfflineData = async (): Promise<void> => {
    try {
      const syncQueue = await db.table("syncQueue").toArray();
  
      for (const record of syncQueue) {
        try {
          if (record.operation === "addOrder") {
            const response = await fetch("http://localhost:5050/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(record.data),
            });
  
            if (response.ok) {
              console.log("Order synced successfully:", record.data);
              // Remove the synced record from the queue
              await db.table("syncQueue").delete(record.id);
            } else {
              console.error("Failed to sync order:", response.statusText);
            }
          }
        } catch (error) {
          console.error("Sync error:", record, error);
          // Do not remove the record if syncing fails
        }
      }
    } catch (error) {
      console.error("Error fetching sync queue:", error);
    }
  };