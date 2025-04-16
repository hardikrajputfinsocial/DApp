import { ethers } from "ethers";
import LimitOrderABI from "../../../abis/LimitOrder.json";

// Get the limit order contract address from environment variables
const LIMIT_ORDER_ADDRESS = import.meta.env.VITE_LIMIT_ORDER;

/**
 * Get all pending limit orders for a specific user
 * @param {string} userAddress - The user's Ethereum address
 * @returns {Promise<Array>} - Array of pending limit orders
 */
export const getPendingLimitOrders = async (userAddress) => {
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
    const limitOrderContract = new ethers.Contract(
      LIMIT_ORDER_ADDRESS,
      LimitOrderABI,
      signer
    );

    // Call the contract function
    const pendingOrders = await limitOrderContract.getPendingLimitOrders(
      userAddress
    );

    // Process the result for easier consumption by frontend
    const formattedOrders = pendingOrders.map((order) => ({
      orderId: Number(order.orderId),
      trader: order.trader,
      positionType: Number(order.positionType), // 0 for Long, 1 for Short
      baseToken: order.baseToken,
      quoteToken: order.quoteToken,
      margin: ethers.formatEther(order.margin),
      leverage: Number(order.leverage),
      limitPrice: ethers.formatEther(order.limitPrice),
      stopLoss: ethers.formatEther(order.stopLoss),
      takeProfit: ethers.formatEther(order.takeProfit),
      timestamp: new Date(Number(order.timestamp) * 1000).toLocaleString(),
      isExecutable: order.isExecutable,
    }));

    return formattedOrders;
  } catch (error) {
    console.error("Error getting pending limit orders:", error);
    throw new Error(`Failed to get pending limit orders: ${error.message}`);
  }
};

export default getPendingLimitOrders;
