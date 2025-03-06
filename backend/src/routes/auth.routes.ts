import express from "express"
import { login } from "../controllers/auth.controller"

const router = express.Router()

// Ensure `loginUser` is correctly structured as an Express handler
router.post("/login", async (req, res, next) => {
  try {
    await login(req, res)
  } catch (error) {
    next(error) // Pass error to Express error handler
  }
})

export default router
