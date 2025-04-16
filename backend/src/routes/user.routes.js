import express from "express";
import { login, getProfile } from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Login route - public
router.post("/login", login);

// Get user profile - protected
router.get("/profile", authenticateToken, getProfile);

export default router;
