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
    Email = Email?.trim().toLowerCase();
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
      Email,
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
      Email,
      Password: hashedPassword,
      CreateName: "SYSTEM",
    });

    await user.save();

    const { Password: _, ...userData } = user.toObject();

    res.status(201).json({ message: "User registered.", user: userData });
  } catch (error) {
    res.status(500).json({ error: "Registration failed." });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    let { Email, Password } = req.body;

    Email = Email?.trim().toLowerCase();
    Password = Password?.trim();

    // Validate required fields
    if (!Email || !Password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    // Find user by email
    const user = await User.findOne({
      Email,
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

    // Set secure, HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // use HTTPS in production
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    const { Password: _, ...userData } = user.toObject();

    res.status(200).json({
      message: "Login successful.",
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed." });
  }
};

export const logoutUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out." });
  } catch (error) {
    res.status(500).json({ error: "Logout failed." });
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
    res.status(500).json({ error: "Failed to retrieve user profile." });
  }
};

export const updateUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    let { FirstName, LastName, Email } = req.body;

    // Trim fields
    FirstName = FirstName?.trim();
    LastName = LastName?.trim();
    Email = Email?.trim().toLowerCase();

    if (!userId) {
      res.status(401).json({ error: "Unauthorized access." });
      return;
    }

    // Validate required fields
    if (!FirstName || !LastName || !Email) {
      res.status(400).json({ error: "All fields are required." });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(Email)) {
      res.status(400).json({ error: "Invalid email format." });
      return;
    }

    // Check if email is already in use by another user
    const existingUser = await User.findOne({
      Email,
      IsDelete: false,
      _id: { $ne: userId },
    });

    if (existingUser) {
      res.status(400).json({ error: "Email already in use." });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        FirstName,
        LastName,
        Email,
        UpdateName: req.user?.Email || "SYSTEM",
      },
      { new: true }
    ).select("-Password");

    if (!updatedUser) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.status(200).json({ message: "Profile updated.", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile." });
  }
};
