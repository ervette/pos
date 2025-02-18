import { Request, Response } from "express"
import Config from "../models/config.model"
import bcrypt from "bcryptjs"

export const createConfig = async (req: Request, res: Response) => {
  try {
    const { users, ...rest } = req.body
    if (!Array.isArray(users)) {
      return res
        .status(400)
        .json({ message: "Invalid 'users' format. Must be an array." })
    }

    const hashedUsers = users.map(
      (user: { username: string; password: string }) => ({
        username: user.username,
        password: bcrypt.hashSync(user.password, 10),
      })
    )

    const config = await Config.findOneAndUpdate(
      {},
      { ...rest, users: hashedUsers },
      { new: true, upsert: true, runValidators: true }
    )

    res
      .status(201)
      .json({ message: "Configuration created/updated successfully", config })
  } catch (error) {
    console.error("Error creating config:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

// Get configuration
export const getConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await Config.findOne()
    if (!config) {
      res.status(404).json({ error: "Configuration not found" })
      return
    }
    res.json(config)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })
    } else {
      res.status(500).json({ error: "An unknown error occurred" })
    }
  }
}

// Update a specific parameter
export const updateParameter = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { key, value } = req.body

  try {
    const config = await Config.findOneAndUpdate(
      {},
      { $set: { [key]: value } },
      { new: true }
    )

    if (!config) {
      res.status(404).json({ error: "Configuration not found" })
      return
    }

    res.json(config)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })
    } else {
      res.status(500).json({ error: "An unknown error occurred" })
    }
  }
}
