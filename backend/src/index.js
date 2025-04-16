import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { logger } from "./utils/logger.js";
import futuresRoutes from "./routes/futures.routes.js";
import userRoutes from "./routes/user.routes.js";

// Load environment variables
dotenv.config();

const app = express();
// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/futures", futuresRoutes);
app.use("/api/users", userRoutes);

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Futures API" });
});

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    // eslint-disable-next-line no-undef
    error: process.env.NODE_ENV === "production" ? null : err.message,
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
