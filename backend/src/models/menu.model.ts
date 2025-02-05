import mongoose, { Schema, Document } from "mongoose";

interface IModifier {
  name: string;
  price: number;
}

interface IVariation {
  type: string;
  price: number;
  quantity: number;
}

interface IMenuItem {
  name: string;
  variations: IVariation[];
  isAvailable: boolean;
  modifiers?: IModifier[];
}

interface IMenu extends Document {
  superCategory: string;
  subCategory: string;
  items: IMenuItem[];
  createdAt: Date;
  updatedAt: Date;
}

const MenuSchema = new Schema<IMenu>({
  superCategory: { type: String, required: true },
  subCategory: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      variations: [
        {
          type: { type: String, required: true },
          price: { type: Number, required: true },
          quantity: { type: Number, required: false, default: 0 },
        },
      ],
      isAvailable: { type: Boolean, default: true },
      modifiers: [
        {
          name: { type: String, required: true },
          price: { type: Number, required: true },
        },
      ],
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add Indexes
MenuSchema.index({ superCategory: 1, subCategory: 1 }); // Compound index for categories
MenuSchema.index({ "items.name": 1 }); // Index for item names

const Menu = mongoose.model<IMenu>("Menu", MenuSchema);

export default Menu;
