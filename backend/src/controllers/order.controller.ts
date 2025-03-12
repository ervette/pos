import { Request, Response } from "express"
import Order, { IOrderItem } from "../models/order.model"
import { Error } from "mongoose"

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { orderId, tableNumber, items, totalPrice, orderStatus } = req.body

    const existingOrder = await Order.findOne({
      tableNumber,
      orderStatus: "open",
    })

    if (existingOrder) {
      console.warn(`Updating existing order for table ${tableNumber}`)

      existingOrder.items = items.map((item: IOrderItem) => ({
        ...item,
        orderItemId: item.orderItemId ?? crypto.randomUUID(), // ✅ Ensure every item has a unique orderItemId
      }))
      existingOrder.totalPrice = totalPrice
      existingOrder.updatedAt = new Date()
      await existingOrder.save()

      return res
        .status(200)
        .json({ message: "Order updated.", order: existingOrder })
    }

    const newOrder = new Order({
      orderId,
      tableNumber,
      items: items.map((item: IOrderItem) => ({
        ...item,
        orderItemId: item.orderItemId ?? crypto.randomUUID(), // ✅ Assign orderItemId if missing
      })),
      totalPrice,
      orderStatus,
    })

    await newOrder.save()
    return res
      .status(201)
      .json({ message: "Order created successfully.", order: newOrder })
  } catch (error) {
    console.error("Error processing order:", error)
    res.status(500).json({ error: "Internal Server Error" })
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
    const { items } = req.body

    // ✅ Ensure every item in the order has a unique `orderItemId`
    items.forEach((item: IOrderItem) => {
      if (!item.orderItemId) {
        item.orderItemId = crypto.randomUUID()
      }
    })

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { ...req.body, items },
      { new: true }
    )

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" })
    }

    return res.json(updatedOrder)
  } catch (error: unknown) {
    console.error("Error updating order:", error)
    return res.status(400).json({ error: (error as Error).message })
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

// ✅ Remove an item from an order
export const removeOrderItem = async (req: Request, res: Response) => {
  try {
    const { orderId, orderItemId } = req.params

    const order = await Order.findOne({ orderId })

    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    // ✅ Remove item using orderItemId
    order.items = order.items.filter((item) => item.orderItemId !== orderItemId)
    order.totalPrice = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    await order.save()
    return res.json({ message: "Item removed successfully", order })
  } catch (error) {
    console.error("Error removing item:", error)
    return res.status(500).json({ error: "Failed to remove item" })
  }
}
