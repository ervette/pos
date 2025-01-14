import mongoose, { Schema, Document } from "mongoose";

interface ITable {
  tableNumber: number;
  capacity: number;
  status: "available" | "occupied";
}

interface IUser {
  username: string;
  password: string;
  role: "admin" | "manager" | "staff";
}

interface IConfig extends Document {
  currency: "USD" | "GBP" | "EUR";
  tableArrangement: { tables: ITable[] };
  users: IUser[];
  appParameters: {
    printerConnection: string;
    taxRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConfigSchema = new Schema<IConfig>({
  currency: { type: String, enum: ["USD", "GBP", "EUR"], default: "GBP" },
  tableArrangement: {
    tables: [
      {
        tableNumber: { type: Number, required: true },
        capacity: { type: Number, required: true },
        status: { type: String, enum: ["available", "occupied"], default: "available" },
      },
    ],
  },
  users: [
    {
      username: { type: String, required: true },
      password: { type: String, required: true },
      role: { type: String, enum: ["admin", "manager", "staff"], required: true },
    },
  ],
  appParameters: {
    printerConnection: { type: String, required: true },
    taxRate: { type: Number, default: 0.2 },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Config = mongoose.model<IConfig>("Config", ConfigSchema);

export default Config;
