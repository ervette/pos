import mongoose, { Schema, Document } from "mongoose";

interface IUser {
  username: string; // Username
  password: string; // Hashed password (for security, store hashed passwords)
}

interface IConfiguration extends Document {
  currency: "USD" | "GBP" | "EUR";    // Currency setting
  tables: number[];                   // List of table numbers
  printer: {
    ip: string;                       // Printer IP address
    port: number;                     // Printer port
    enabled: boolean;                 // Whether printing is enabled
  };
  theme: "light" | "dark" | "system"; // App appearance
  language: string;                   // Language code (ISO 639-1)
  timezone: string;                   // Timezone identifier
  orderPrefix: string;                // Prefix for order IDs
  nextOrderNumber: number;            // Next order ID number
  serviceChargeRate: number;          // Service charge rate (percentage)
  users: IUser[];                     // ✅ Array of users (username & password)
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true }, // Unique username
  password: { type: String, required: true }, // Store as a hashed password
});

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
  users: { type: [UserSchema], default: [] }, // ✅ Add user schema array
});

const Config = mongoose.model<IConfiguration>("Config", ConfigSchema);

export default Config;
