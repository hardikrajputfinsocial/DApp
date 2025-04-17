import { ethers } from "ethers";
import StopLimitABI from "../../../abis/stopLimit.json";

// Get the stop limit contract address from environment variables
const STOP_LIMIT_ADDRESS = import.meta.env.VITE_STOP_LIMIT;

/**
 * Get all pending stop limit orders for a specific user
 * @param {string} userAddress - The user's Ethereum address
 * @returns {Promise<Array>} - Array of pending stop limit orders
 */
export const getPendingStopLimitOrders = async (userAddress) => {
  if (!userAddress) {
    throw new Error("User address is required");
  }

  try {
    // Initialize provider and signer
    if (!window.ethereum) {
      throw new Error("MetaMask not installed");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Initialize contract
    const stopLimitContract = new ethers.Contract(
      STOP_LIMIT_ADDRESS,
      StopLimitABI,
      signer
    );

    // Call the contract function
    const pendingOrders = await stopLimitContract.getPendingStopLimitOrders(
      userAddress
    );

    // Process the result for easier consumption by frontend
    const formattedOrders = pendingOrders.map((order) => ({
      positionId: Number(order.positionId),
      user: order.user,
      baseToken: order.baseToken,
      quoteToken: order.quoteToken,
      margin: ethers.formatEther(order.margin),
      leverage: Number(order.leverage),
      stopPrice: ethers.formatEther(order.stopPrice),
      limitPrice: ethers.formatEther(order.limitPrice),
      positionType: Number(order.positionType), // 0 for Long, 1 for Short
      triggered: order.triggered,
      stopLoss: ethers.formatEther(order.SL),
      takeProfit: ethers.formatEther(order.TP),
      timestamp: new Date().toLocaleString(), // Current time as these are pending orders
      orderType: 'stop-limit' // Add this to differentiate from regular limit orders
    }));
    
    return formattedOrders;
  } catch (error) {
    console.error("Error getting pending stop limit orders:", error);
    throw new Error(`Failed to get pending stop limit orders: ${error.message}`);
  }
};

export default getPendingStopLimitOrders;
