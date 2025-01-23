import mongoose, { Schema, Document } from "mongoose";

interface IOrderItem {
  itemId: mongoose.Types.ObjectId;
  name: string;
  variation: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface IOrder extends Document {
  orderId: string;
  tableNumber?: number;
  items: IOrderItem[];
  totalPrice: number;
  orderStatus: "open" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Add unique index constraint: Only ONE open order per tableNumber
const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, unique: true, required: true, default: () => new mongoose.Types.ObjectId().toString() }, // ✅ Ensure orderId is unique
    tableNumber: { type: Number, required: true, index: true }, 
    items: [{ type: Object, required: true }],
    totalPrice: { type: Number, required: true, min: 0 },
    orderStatus: {
      type: String,
      enum: ["open", "completed", "cancelled"],
      default: "open",
    },
  },
  { timestamps: true }
);

// ✅ Prevent multiple open orders for the same tableNumber
OrderSchema.index({ tableNumber: 1, orderStatus: 1 }, { unique: true, partialFilterExpression: { orderStatus: "open" } });

const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
