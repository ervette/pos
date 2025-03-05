import express from "express"
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder
} from "../controllers/order.controller"

const router = express.Router()

const asyncHandler =
  (
    fn: (
      req: express.Request,
      res: express.Response
    ) => Promise<express.Response | void>
  ) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    fn(req, res).catch(next)
  }

// CRUD endpoints for orders
router.post("/", asyncHandler(createOrder)) // Create
router.get("/", asyncHandler(getOrders)) // Read (all)
router.get("/:id", asyncHandler(getOrderById)) // Read (specific order)
router.put("/:id", asyncHandler(updateOrder)) // Update
router.delete("/:id", asyncHandler(deleteOrder)) // Delete

export default router
