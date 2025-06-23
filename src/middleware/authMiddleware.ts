import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies?.token;

  try {
    // Ensure JWT secret is set
    if (!process.env.JWT_SECRET) {
      res.status(500).json({ error: "Server configuration error." });
      return;
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    const user = await User.findOne({
      EmailNormalized: payload.email.toLowerCase(),
      IsDelete: false,
    });

    if (!user) {
      res.status(401).json({ error: "Invalid token – user not found" });
      return;
    }

    req.user = user;
    next();
    
  } catch (err) {
    console.error("JWT validation error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
