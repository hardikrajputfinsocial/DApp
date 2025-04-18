import { ethers } from "ethers";
import TWAPABI from "../../../abis/TWAP.json";

// Use environment variable for contract address
const TWAP_ADDRESS = import.meta.env.VITE_TWAP;

/**
 * Fetches all TWAP orders for a specific user
 * @param {string} userAddress - The user's wallet address
 * @returns {Promise<Array>} - Array of formatted TWAP orders
 */
export const getTWAPOrders = async (userAddress) => {
  try {
    if (!userAddress) {
      throw new Error("User address is required");
    }

    // Initialize provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Initialize contract with read-only provider
    const twapContract = new ethers.Contract(
      TWAP_ADDRESS,
      TWAPABI,
      provider
    );

    // Fetch orders from contract
    const orders = await twapContract.getOrders(userAddress);

    // Format the orders for frontend use
    const formattedOrders = orders.map((order, i) => ({
      index: i,
      orderId: i, // Using index as orderId for consistency with other order types
      config: {
        user: order.config.user,
        baseToken: order.config.baseToken,
        quoteToken: order.config.quoteToken,
        margin: ethers.formatEther(order.config.margin),
        leverage: Number(order.config.leverage),
        tradeType: Number(order.config.tradeType)
      },
      schedule: {
        batchSize: Number(order.schedule.batchSize),
        interval: Number(order.schedule.interval),
        closeStartTime: Number(order.schedule.closeStartTime),
        lastExecutionTime: Number(order.schedule.lastExecutionTime)
      },
      state: {
        isActive: order.state.isActive,
        isOpen: order.state.isOpen,
        positionIds: order.state.positionIds.map(id => Number(id)),
        batchesOpened: Number(order.state.batchesOpened),
        batchesClosed: Number(order.state.batchesClosed)
      },
      // Add fields to match the format expected by PositionsTable
      status: "placed",
      type: order.config.tradeType === 0 ? "Long" : "Short",
      pair: `${order.config.baseToken}/${order.config.quoteToken}`, // This will be formatted by getTokenName in PositionsTable
      orderType: 'twap'
    }));

    console.log("📦 TWAP Orders:", formattedOrders);
    return formattedOrders;

  } catch (err) {
    console.error("❌ Error fetching TWAP orders:", err.message || err);
    return [];
  }
};

export default getTWAPOrders;