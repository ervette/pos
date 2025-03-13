import mongoose from "mongoose"
import dotenv from "dotenv"
import express from "express"
import cors from "cors"

// const Config = require("./models/config.model");
// const Menu = require("./models/menu.model");
// const Order = require("./models/order.model");

import path from "path"
import { Request, Response } from "express"
import analyticsRoutes from "./routes/analytics.routes"
import menuRoutes from "./routes/menu.routes"
import orderRoutes from "./routes/order.routes"
import configRoutes from "./routes/config.routes"
import syncRoutes from "./routes/sync.routes"
import authRoutes from "./routes/auth.routes"

dotenv.config({ path: path.resolve(__dirname, "../.env") })

const app = express()

// Middleware
app.use(express.json())
app.use(cors())

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/pos")
  .then(() => console.log("MongoDB Connected"))
  .catch((err: Error) =>
    console.error("Database Connection Failed:", err.message)
  )

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("API is running...")
})

app.get("/api", (req: Request, res: Response) => {
  res.json({ message: "Hello world!" })
})

app.use("/api/analytics", analyticsRoutes)
app.use("/api/menu", menuRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/config", configRoutes)
app.use("/api/sync", syncRoutes)
app.use("/api/auth", authRoutes)

const PORT = process.env.PORT || 5050
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app._router.stack.forEach((middleware: any) => {
  if (middleware.route) {
    console.log(
      `🛠 Route Registered: ${Object.keys(middleware.route.methods).map((m) =>
        m.toUpperCase()
      )} ${middleware.route.path}`
    )
  }
})
