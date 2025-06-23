// src/controllers/userController.ts
import { Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import { isValidPassword } from "../utils/validators";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/authMiddleware";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let { FirstName, LastName, Email, Password } = req.body;

    FirstName = FirstName?.trim();
    LastName = LastName?.trim();
    Email = Email?.trim();
    Password = Password?.trim();

    // Validate required fields
    if (!FirstName || !LastName || !Email || !Password) {
      res.status(400).json({ error: "All fields are required." });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(Email)) {
      res.status(400).json({ error: "Invalid email format." });
      return;
    }

    // Check if Already in Use
    const existingUser = await User.findOne({
      EmailNormalized: Email.toLowerCase(),
      IsDelete: false,
    });

    if (existingUser) {
      res.status(400).json({ error: "Email already in use." });
      return;
    }

    if (!isValidPassword(Password)) {
      res.status(400).json({
        error:
          "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
      });
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    const user = new User({
      FirstName,
      LastName,
      Email: Email,
      Password: hashedPassword,
      EmailNormalized: Email.toLowerCase(),
      CreateName: "SYSTEM",
    });

    await user.save();

    const { Password: _, ...userData } = user.toObject();

    res.status(201).json({ message: "User registered.", user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed." });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    let { Email, Password } = req.body;

    Email = Email?.trim();
    Password = Password?.trim();

    // Validate required fields
    if (!Email || !Password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    // Find user by email
    const user = await User.findOne({
      EmailNormalized: Email.toLowerCase(),
      IsDelete: false,
    });

    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(Password, user.Password);

    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    // Create token payload
    const tokenPayload = {
      id: user._id,
      email: user.Email,
      name: `${user.FirstName} ${user.LastName}`,
    };

    // Ensure JWT secret is set
    if (!process.env.JWT_SECRET) {
      res.status(500).json({ error: "Server configuration error." });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expiration time
    });

    const { Password: _, ...userData } = user.toObject();

    res.status(200).json({
      message: "Login successful.",
      token,
      expiresIn: Date.now() + 3300000,
      user: userData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed." });
  }
};

export const getUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized access." });
      return;
    }

    const user = await User.findById(userId).select("-Password");

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve user profile." });
  }
};
