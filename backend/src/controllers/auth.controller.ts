import Config from "../models/config.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        // Fetch the config document
        const config = await Config.findOne();
        if (!config) {
            return res.status(500).json({ message: "Config not found" });
        }

        // Find the user in the config.users array
        const user = config.users.find((user) => user.username === username);
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate a JWT token
        const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
