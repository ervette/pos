import { Request, Response } from "express";
import Order from "../models/order.model";

export const syncOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { syncQueue } = req.body; // Expecting a queue of operations

    for (const operation of syncQueue) {
      const { type, data } = operation;

      if (type === "addOrder") {
        const existingOrder = await Order.findOne({ _id: data._id });
        if (!existingOrder) {
          await new Order(data).save();
        }
      } else if (type === "updateOrder") {
        await Order.findByIdAndUpdate(data._id, data, { new: true });
      } else if (type === "deleteOrder") {
        await Order.findByIdAndDelete(data._id);
      }
    }

    res.status(200).json({ message: "Sync completed successfully" });
  } catch (error) {
    console.error("Error syncing orders:", error);
    res.status(500).json({ error: "Failed to sync orders" });
  }
};
