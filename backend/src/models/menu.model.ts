import mongoose, { Schema, Document } from "mongoose";

interface IModifier {
  name: string;
  price: number;
}

interface IVariation {
  type: string;       // e.g., "Bottle", "250ml"
  price: number;      // Price for the variation
  quantity: number;   // Inventory count for this variation
}

interface IMenuItem {
  name: string;         // Item name, e.g., "Pinot Grigio"
  variations: IVariation[]; // List of variations with price and quantity
  isAvailable: boolean; // Availability of the item
  modifiers?: IModifier[]; // Optional modifiers like "Extra Cheese"
}

interface IMenu extends Document {
  superCategory: string;  // e.g., "Food", "Drinks"
  subCategory: string;    // e.g., "Food/Main", "Drink/Wine"
  items: IMenuItem[];     // List of menu items
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
          quantity: { type: Number, required: true, default: 0 }, // Add inventory tracking
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

const Menu = mongoose.model<IMenu>("Menu", MenuSchema);

export default Menu;
