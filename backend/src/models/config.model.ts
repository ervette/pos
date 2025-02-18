import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

interface IUser {
  username: string;
  password: string;
}

interface IConfiguration extends Document {
  currency: "USD" | "GBP" | "EUR";
  tables: number[];
  printer: {
    ip: string;
    port: number;
    enabled: boolean;
  };
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  orderPrefix: string;
  nextOrderNumber: number;
  serviceChargeRate: number;
  users: IUser[];
}

// Schema definition
const ConfigSchema = new Schema<IConfiguration>({
  currency: { type: String, enum: ["USD", "GBP", "EUR"], default: "USD" },
  tables: { type: [Number], default: [] },
  printer: {
    ip: { type: String, required: true },
    port: { type: Number, required: true },
    enabled: { type: Boolean, default: true },
  },
  theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
  language: { type: String, default: "en" },
  timezone: { type: String, default: "GMT" },
  orderPrefix: { type: String, default: "ORD-" },
  nextOrderNumber: { type: Number, default: 1 },
  serviceChargeRate: { type: Number, default: 0 },

  // ✅ Ensure usernames are stored properly
  users: [
    {
      username: { type: String, required: true },  
      password: { type: String, required: true },
    },
  ],
});


// Hash passwords before saving
ConfigSchema.pre("save", async function (next) {
  if (!this.isModified("users")) return next();
  for (const user of this.users) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

const Config = mongoose.model<IConfiguration>("Config", ConfigSchema);
export default Config;
