import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Replace with environment variable

interface DecodedUser extends JwtPayload {
    userId: string;
    role?: string;
}

// Basic Authentication Middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser; // Explicitly type decoded token
        (req as Request & { user: DecodedUser }).user = decoded; // Attach user info to request
        next();
    } catch (error) {
        res.status(401).json({
            message: "Unauthorized",
            error: process.env.NODE_ENV === "production" ? undefined : error,
        });
    }
};

// Role-Based Authentication Middleware
export const authenticateWithRole = (role: string) => (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser; // Explicitly type decoded token
        if (decoded.role !== role) {
            return res.status(403).json({ message: "Forbidden: Insufficient role" });
        }
        (req as Request & { user: DecodedUser }).user = decoded; // Attach user info to request
        next();
    } catch (error) {
        res.status(401).json({
            message: "Unauthorized",
            error: process.env.NODE_ENV === "production" ? undefined : error,
        });
    }
};
