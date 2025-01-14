import mongoose, { Schema, Document } from "mongoose";

interface IArchiveItem {
  name: string;
  quantity: number;
  variation: string;
  price: number;
  modifiers?: { name: string; price: number }[];
}

interface IArchive extends Document {
  tableNumber: number;
  items: IArchiveItem[];
  totalPrice: number;
  paymentMethod: "cash" | "card";
  tips: number;
  discount: number;
  tax: number;
  finalPrice: number;
  closedAt: Date;
}

const ArchiveSchema = new Schema<IArchive>({
  tableNumber: { type: Number, required: true },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      variation: { type: String, required: true },
      price: { type: Number, required: true },
      modifiers: [
        {
          name: { type: String },
          price: { type: Number },
        },
      ],
    },
  ],
  totalPrice: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["cash", "card"], required: true },
  tips: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0.2 },
  finalPrice: { type: Number, required: true },
  closedAt: { type: Date, default: Date.now },
});

const Archive = mongoose.model<IArchive>("Archive", ArchiveSchema);

export default Archive;
