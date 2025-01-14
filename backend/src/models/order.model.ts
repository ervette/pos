import mongoose, { Schema, Document } from "mongoose";

interface IOrderItem {
  itemId: mongoose.Types.ObjectId; // Reference to the Menu schema
  name: string;                   // Item name (e.g., "Pinot Grigio")
  variation: string;              // Variation type (e.g., "Bottle", "250ml")
  price: number;                  // Price of the variation
  quantity: number;               // Quantity ordered
  notes?: string;                 // Special instructions or notes
}

interface IOrder extends Document {
  tableNumber?: number;           // Table number (optional for takeout orders)
  items: IOrderItem[];            // List of ordered items
  totalPrice: number;             // Total order price
  orderStatus: "open" | "completed" | "cancelled"; // Status of the order
  createdAt: Date;                // Timestamp for order creation
  updatedAt: Date;                // Timestamp for last update
}

const OrderItemSchema = new Schema<IOrderItem>({
  itemId: { type: Schema.Types.ObjectId, ref: "Menu", required: true },
  name: { type: String, required: true },
  variation: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  notes: { type: String },
});

const OrderSchema = new Schema<IOrder>(
  {
    tableNumber: { type: Number }, // Optional for takeout
    items: [OrderItemSchema],
    totalPrice: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ["open", "completed", "cancelled"],
      default: "open",
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

const Order = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
