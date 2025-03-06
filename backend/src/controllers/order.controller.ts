import { Request, Response } from "express"
import Order from "../models/order.model"
import { Error } from "mongoose"

// Create a new order

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { orderId, tableNumber, items, totalPrice, orderStatus } = req.body

    // ✅ Check if an open order already exists for the table
    const existingOrder = await Order.findOne({
      tableNumber,
      orderStatus: "open",
    })

    if (existingOrder) {
      console.warn(
        `Existing open order found for table ${tableNumber}. Updating order instead.`
      )

      // ✅ Update the existing open order
      existingOrder.items = items
      existingOrder.totalPrice = totalPrice
      existingOrder.updatedAt = new Date()
      await existingOrder.save()

      return res.status(200).json({
        message: "Order updated instead of creating a duplicate.",
        order: existingOrder,
      })
    }

    // ✅ Otherwise, create a new order
    const newOrder = new Order({
      orderId,
      tableNumber,
      items,
      totalPrice,
      orderStatus,
    })
    await newOrder.save()

    return res
      .status(201)
      .json({ message: "Order created successfully.", order: newOrder })
  } catch (error) {
    console.error("Error processing order:", error)
    res.status(500).json({ error: Error })
  }
}

// Get all orders
export const getOrders = async (req: Request, res: Response) => {
  try {
    const { tableNumber, status } = req.query

    const filter: Record<string, unknown> = {}

    if (tableNumber) {
      filter.tableNumber = Number(tableNumber)
    }

    if (status) {
      filter.orderStatus = status
    }

    const orders = await Order.find(filter)
    res.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    res.status(500).json({ error: "Failed to fetch orders" })
  }
}

// Get an order by ID
export const getOrderById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }
    return res.json(order)
  } catch (error: unknown) {
    console.error("Error retrieving order:", error)

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message })
    }
    return res.status(500).json({ error: "An unknown error occurred" })
  }
}

// Update an order
export const updateOrder = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    )
    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" })
    }
    return res.json(updatedOrder)
  } catch (error: unknown) {
    console.error("Error updating order:", error)

    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: "An unknown error occurred" })
  }
}

// Delete an order
export const deleteOrder = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id)
    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" })
    }
    return res.json({ message: "Order deleted successfully" })
  } catch (error: unknown) {
    console.error("Error deleting order:", error)

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message })
    }
    return res.status(500).json({ error: "An unknown error occurred" })
  }
}
