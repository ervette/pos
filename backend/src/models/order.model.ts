import mongoose, { Schema, Document } from "mongoose"

export interface IOrderItem {
  orderItemId: string
  itemId: mongoose.Types.ObjectId
  name: string
  variation: string
  price: number
  quantity: number
  notes?: string
  modifiers: string[] // ✅ Added modifiers field
}

export interface IOrder extends Document {
  orderId: string
  tableNumber?: number
  items: IOrderItem[]
  totalPrice: number
  orderStatus: "open" | "paid_other" | "paid_cash" | "paid_card" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

// ✅ Define Schema for Order Items
const OrderItemSchema = new Schema<IOrderItem>(
  {
    orderItemId: { type: String, required: true, default: crypto.randomUUID }, // ✅ Auto-generate orderItemId
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "MenuItem",
    },
    name: { type: String, required: true },
    variation: { type: String, default: "Default" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, default: "" },
    modifiers:{type: [String], default: []}
  },
  { _id: false } // ✅ Prevent MongoDB from auto-generating _id for items
)

// ✅ Define Schema for Orders
const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    }, // ✅ Ensure orderId is unique
    tableNumber: { type: Number, required: true, index: true },
    items: [OrderItemSchema], // ✅ Updated to use the embedded schema
    totalPrice: { type: Number, required: true, min: 0 },
    orderStatus: {
      type: String,
      enum: ["open", "paid_other", "paid_cash", "paid_card", "cancelled"],
      default: "open",
    },
  },
  { timestamps: true }
)

// ✅ Prevent multiple open orders for the same tableNumber
OrderSchema.index(
  { tableNumber: 1, orderStatus: 1 },
  { unique: true, partialFilterExpression: { orderStatus: "open" } }
)

const Order = mongoose.model<IOrder>("Order", OrderSchema)
export default Order
