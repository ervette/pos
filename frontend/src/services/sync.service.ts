import db from "../localdb/index"; 
import { addToSyncQueue, getSyncQueue } from "../localdb/syncQueue"; 
import { Order } from "../localdb/index"; 

// ✅ Handle Order Submission (Works Online and Offline)
export const handleOrderSubmission = async (orderData: Order): Promise<void> => {
    try {
        // ✅ Ensure orderId is always present
        if (!orderData.orderId) {
            orderData.orderId = crypto.randomUUID();
        }

        // ✅ Check if order already exists in IndexedDB (avoid duplicate saves)
        const existingOrder = await db.table("orders")
            .where("orderId").equals(orderData.orderId)
            .first();

        if (existingOrder) {
            console.warn("Duplicate order detected, skipping save:", orderData.orderId);
            return;
        }

        if (navigator.onLine) {
            await submitOrderToBackend(orderData);
        } else {
            console.warn("Offline: Saving order locally.");
            await saveOrderOffline(orderData);
        }
    } catch (error) {
        console.error("Error processing order:", error);
    }
};

// ✅ Send Order to Backend
const submitOrderToBackend = async (orderData: Order): Promise<void> => {
    try {
        const response = await fetch("http://localhost:5050/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
        });

        if (response.ok) {
            console.log("Order successfully saved to backend.");
        } else {
            throw new Error(`Failed to save order: ${response.statusText}`);
        }
    } catch (error) {
        console.warn("Failed to sync order, saving locally.", error);
        await saveOrderOffline(orderData);
    }
};

// ✅ Save Order to IndexedDB & Queue for Sync
const saveOrderOffline = async (orderData: Order): Promise<void> => {
    try {
        // ✅ Ensure orderId is defined before querying IndexedDB
        if (!orderData.orderId) {
            throw new Error("Missing orderId for offline order.");
        }

        // ✅ Check if order exists in IndexedDB
        const existingOrder = await db.table("orders")
            .where("orderId").equals(orderData.orderId)
            .first();
        
        if (existingOrder) {
            console.warn("Duplicate order detected, skipping save:", orderData.orderId);
            return;
        }

        // ✅ Add order to IndexedDB
        const localId = await db.table("orders").add(orderData);
        if (typeof localId !== "number") {
            throw new Error(`Invalid ID returned by IndexedDB: ${localId}`);
        }

        console.log(`Order saved locally with ID: ${localId}`);

        // ✅ Check if order is already in syncQueue before adding
        const existingQueueItem = await db.table("syncQueue")
            .where("data.orderId").equals(orderData.orderId)
            .first();
        
        if (!existingQueueItem) {
            await addToSyncQueue("addOrder", { ...orderData, id: localId });
            console.log("Order added to sync queue.");
        } else {
            console.warn("Order already in sync queue, skipping add:", orderData.orderId);
        }
    } catch (error) {
        console.error("Failed to save order offline:", error);
    }
};

// ✅ Sync Offline Orders with Backend
export const syncOfflineData = async (): Promise<void> => {
    try {
        const syncQueue = await getSyncQueue();

        for (const record of syncQueue) {
            try {
                let response;

                // ✅ Ensure record.data.orderId is valid before making requests
                if (!record.data.orderId) {
                    console.warn("Skipping record due to missing orderId:", record);
                    continue;
                }

                // ✅ Check if the order already exists in MongoDB
                const checkOrder = await fetch(`http://localhost:5050/api/orders/${record.data.orderId}`);

                if (checkOrder.ok) {
                    console.warn("Order already exists in backend, updating instead of re-adding:", record.data.orderId);
                    
                    await fetch(`http://localhost:5050/api/orders/${record.data.orderId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(record.data),
                    });

                    // ✅ Ensure ID exists before deleting from syncQueue
                    if (typeof record.id !== "undefined") {
                        await db.table("syncQueue").delete(record.id);
                    } else {
                        console.warn("Skipping deletion from syncQueue: Missing ID", record);
                    }
                    continue;
                }

                // ✅ Process Sync Based on Operation Type
                if (record.operation === "addOrder") {
                    response = await fetch("http://localhost:5050/api/orders", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(record.data),
                    });
                } else if (record.operation === "updateOrder") {
                    response = await fetch(`http://localhost:5050/api/orders/${record.data.orderId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(record.data),
                    });
                } else if (record.operation === "deleteOrder") {
                    response = await fetch(`http://localhost:5050/api/orders/${record.data.orderId}`, {
                        method: "DELETE",
                    });
                }

                // ✅ Step 3: Handle Sync Response
                if (response?.ok) {
                    console.log("Sync successful:", record);

                    // ✅ Ensure ID exists before deleting from syncQueue
                    if (typeof record.id !== "undefined") {
                        await db.table("syncQueue").delete(record.id);
                    } else {
                        console.warn("Skipping deletion from syncQueue: Missing ID", record);
                    }

                    // ✅ Ensure record.data.id exists before deleting from orders table
                    if (typeof record.data.id !== "undefined") {
                        await db.table("orders").delete(record.data.id);
                    } else {
                        console.warn("Skipping deletion from orders table: Missing ID", record);
                    }
                } else {
                    console.error("Failed to sync order:", response?.statusText);
                }
            } catch (error) {
                console.error("Sync error:", error);
            }
        }
    } catch (error) {
        console.error("Error fetching sync queue:", error);
    }
};


// ✅ Automatically trigger sync when going online
window.addEventListener("online", syncOfflineData);
