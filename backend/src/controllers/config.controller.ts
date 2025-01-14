import { Request, Response } from "express";
import Config from "../models/config.model";

// Create or update configuration
export const upsertConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await Config.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true, // Create if not found
    });
    res.status(201).json(config);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Get configuration
export const getConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await Config.findOne();
    if (!config) {
      res.status(404).json({ error: "Configuration not found" });
      return;
    }
    res.json(config);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Update a specific parameter
export const updateParameter = async (req: Request, res: Response): Promise<void> => {
  const { key, value } = req.body;

  try {
    const config = await Config.findOneAndUpdate(
      {},
      { $set: { [key]: value } },
      { new: true }
    );

    if (!config) {
      res.status(404).json({ error: "Configuration not found" });
      return;
    }

    res.json(config);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};