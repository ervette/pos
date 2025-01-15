import mongoose, { Schema, Document } from "mongoose";

// Interface for individual items in an order
interface IOrderItem {
  itemId: mongoose.Types.ObjectId; // Reference to the Menu schema
  name: string;                   // Item name (e.g., "Pinot Grigio")
  variation: string;              // Variation type (e.g., "Bottle", "250ml")
  price: number;                  // Price of the variation
  quantity: number;               // Quantity ordered
  notes?: string;                 // Special instructions or notes
}

// Interface for the Order document
interface IOrder extends Document {
  tableNumber?: number;           // Table number (optional for takeout orders)
  items: IOrderItem[];            // List of ordered items
  totalPrice: number;             // Total order price
  orderStatus: "open" | "completed" | "cancelled"; // Status of the order
  createdAt: Date;                // Timestamp for order creation
  updatedAt: Date;                // Timestamp for last update
}

// Schema for individual items in an order
const OrderItemSchema = new Schema<IOrderItem>({
  itemId: { type: Schema.Types.ObjectId, ref: "Menu", required: true },
  name: { type: String, required: true },
  variation: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  notes: { type: String },
});

// Schema for the entire order
const OrderSchema = new Schema<IOrder>(
  {
    tableNumber: { type: Number }, // Optional for takeout
    items: [OrderItemSchema], // Array of order items
    totalPrice: { type: Number, required: true, min: 0 }, // Ensure non-negative total
    orderStatus: {
      type: String,
      enum: ["open", "completed", "cancelled"], // Enum for valid statuses
      default: "open",
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create and export the Order model
const Order = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
