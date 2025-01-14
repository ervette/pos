import mongoose, { Schema, Document } from "mongoose";

interface IOrderItem {
  itemId: mongoose.Types.ObjectId;
  name: string;
  variation: string;
  price: number;
  quantity: number;
  totalItemPrice: number;
  notes?: string;
}

interface IOrder extends Document {
  tableNumber: number;
  items: IOrderItem[];
  totalPrice: number;
  orderStatus: "open" | "paid" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  tableNumber: { type: Number, required: true },
  items: [
    {
      itemId: { type: Schema.Types.ObjectId, ref: "Menu", required: true },
      name: { type: String, required: true },
      variation: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      totalItemPrice: { type: Number, required: true },
      notes: { type: String, default: "" },
    },
  ],
  totalPrice: { type: Number, required: true },
  orderStatus: { type: String, enum: ["open", "paid", "cancelled"], default: "open" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Order = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
