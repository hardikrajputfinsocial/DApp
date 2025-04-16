import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

// In a real application, you would use a database
// This is just a simple example for demonstration
const users = [
  {
    id: "1",
    address: "0x1234567890123456789012345678901234567890",
    username: "user1",
    role: "user",
  },
  {
    id: "2",
    address: "0x0987654321098765432109876543210987654321",
    username: "admin1",
    role: "admin",
  },
];

export const login = async (req, res, next) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    // Find user by address (in a real app, you would query a database)
    const user = users.find(
      (u) => u.address.toLowerCase() === address.toLowerCase()
    );

    if (!user) {
      // In a real app, you might want to create a new user here
      // For simplicity, we'll just return an error
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, address: user.address, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          address: user.address,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (error) {
    logger.error("Error in login controller:", error);
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    // req.user is set in authenticateToken middleware
    const userId = req.user.id;

    // Find user by ID (in a real app, you would query a database)
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        address: user.address,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Error in getProfile controller:", error);
    next(error);
  }
};
