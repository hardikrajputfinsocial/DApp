import express from "express";
import {
  getAllFutures,
  getFutureById,
  createFuture,
  updateFuture,
  fulfillFuture,
} from "../controllers/futures.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get all futures - public route
router.get("/", getAllFutures);

// Get a specific future by ID - public route
router.get("/:id", getFutureById);

// Create a new future - protected route
router.post("/", authenticateToken, createFuture);

// Update a future - protected route
router.put("/:id", authenticateToken, updateFuture);

// Fulfill a future - protected route
router.patch("/:id/fulfill", authenticateToken, fulfillFuture);

export default router;
