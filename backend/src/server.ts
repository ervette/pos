const mongoose = require("mongoose");
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const Config = require("./models/config.model");
const Menu = require("./models/menu.model");
const Order = require("./models/order.model");

import path from "path";
import { Request, Response } from "express";
import analyticsRoutes from "./routes/analytics.routes"
import menuRoutes from "./routes/menu.routes"


dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log(process.env.MONGO_URI);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/pos", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err: Error) => console.error("Database Connection Failed:", err.message));


// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("API is running...");
});

app.get("/api", (req: Request, res: Response) => {
    res.json({message: "Hello world!"});
})

app.use("/api/analytics", analyticsRoutes);
app.use("api/menu", menuRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
