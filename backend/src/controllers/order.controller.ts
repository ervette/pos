import { Request, Response } from "express";
import Order from "../models/order.model";

// Create a new order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableNumber, items, totalPrice, orderStatus } = req.body;

    const newOrder = new Order({
      tableNumber,
      items,
      totalPrice,
      orderStatus,
    });

    await newOrder.save();
    res.status(201).json(newOrder); // MongoDB will generate `_id`
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Get all orders
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Get an order by ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(order);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Update an order
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedOrder) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(updatedOrder);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Delete an order
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};
