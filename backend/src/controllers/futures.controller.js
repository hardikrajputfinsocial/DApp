import { logger } from "../utils/logger.js";
// Comment out the real service for now to isolate the issue
// import { FuturesService } from "../services/futures.service.js";
// const futuresService = new FuturesService();

// Temporary mock data
const mockFutures = [
  {
    id: "0",
    name: "Mock Future 1",
    description: "This is a mock future for testing",
    creator: "0x1234567890123456789012345678901234567890",
    expiryDate: Date.now() / 1000 + 86400, // Tomorrow
    strikePrice: "1.5",
    isFulfilled: false,
  },
  {
    id: "1",
    name: "Mock Future 2",
    description: "Another mock future for testing",
    creator: "0x1234567890123456789012345678901234567890",
    expiryDate: Date.now() / 1000 + 172800, // Day after tomorrow
    strikePrice: "2.5",
    isFulfilled: true,
  },
];

export const getAllFutures = async (req, res, next) => {
  try {
    console.log("Getting all futures (mock)...");
    // Return mock data instead of calling the service
    res.status(200).json({
      success: true,
      data: mockFutures,
    });
  } catch (error) {
    console.error("Error in getAllFutures controller:", error);
    logger.error("Error in getAllFutures controller:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch futures",
      error: error.message || "Unknown error",
      stack: process.env.NODE_ENV === "production" ? null : error.stack,
    });
  }
};

export const getFutureById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Return mock data instead of calling the service
    const future = mockFutures.find((f) => f.id === id);

    if (!future) {
      return res.status(404).json({
        success: false,
        message: `No future found with id ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: future,
    });
  } catch (error) {
    logger.error(
      `Error in getFutureById controller for id ${req.params.id}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch future",
      error: error.message,
    });
  }
};

// Simplified versions of other methods that just return success message
export const createFuture = async (req, res, next) => {
  res.status(201).json({
    success: true,
    message: "Mock create - not implemented yet",
    data: { ...req.body, id: "999" },
  });
};

export const updateFuture = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "Mock update - not implemented yet",
    data: { ...req.body, id: req.params.id },
  });
};

export const fulfillFuture = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "Mock fulfill - not implemented yet",
    data: { id: req.params.id, isFulfilled: true },
  });
};
