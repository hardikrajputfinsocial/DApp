import { ethers } from "ethers";
import TWAPABI from "../../../abis/TWAP.json";

// Use environment variable for contract address
const TWAP_ADDRESS = import.meta.env.VITE_TWAP;

/**
 * Places a TWAP (Time-Weighted Average Price) order
 * @param {Object} params - The parameters for the TWAP order
 * @param {string} params.baseToken - The base token address
 * @param {string} params.quoteToken - The quote token address
 * @param {string} params.margin - The margin amount as a string
 * @param {number} params.leverage - The leverage multiplier
 * @param {number} params.tradeType - 0 for Long, 1 for Short
 * @param {number} params.batchSize - Number of batches to split the order into
 * @param {number} params.interval - Time interval between batches in seconds
 * @param {number} params.closeStartTime - Unix timestamp when closing should start
 * @returns {Promise<Object>} - Transaction receipt
 */
export const placeTWAPOrder = async ({
  baseToken,
  quoteToken,
  margin,
  leverage,
  tradeType,
  batchSize,
  interval,
  closeStartTime
}) => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not found. Please install MetaMask.");
    }

    // Validate inputs
    if (!baseToken || !quoteToken) {
      throw new Error("Invalid token addresses");
    }

    if (isNaN(margin) || parseFloat(margin) <= 0) {
      throw new Error("Invalid margin amount");
    }

    if (isNaN(leverage) || leverage <= 0) {
      throw new Error("Invalid leverage value");
    }

    if (batchSize <= 0 || interval <= 0) {
      throw new Error("❌ Invalid batchSize or interval — both must be > 0.");
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const minimumCloseStart = currentTimestamp + (batchSize * interval);

    if (closeStartTime <= minimumCloseStart) {
      throw new Error(`❌ closeStartTime must be at least ${batchSize * interval} seconds after now. Recommended: > ${minimumCloseStart}`);
    }

    // Initialize provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Initialize contract
    const twapContract = new ethers.Contract(
      TWAP_ADDRESS,
      TWAPABI,
      signer
    );

    // Convert values to Wei
    const marginInWei = ethers.parseEther(margin);

    // Log the parameters for debugging
    console.log("Placing TWAP order with params:", {
      baseToken,
      quoteToken,
      tradeType,
      marginInWei: marginInWei.toString(),
      leverage,
      batchSize,
      interval,
      closeStartTime
    });

    // Call the contract function
    const tx = await twapContract.placeTWAPOrder(
      baseToken,
      quoteToken,
      marginInWei,
      leverage,
      tradeType,
      batchSize,
      interval,
      closeStartTime
    );

    console.log("⏳ TX sent:", tx.hash);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("✅ TWAP Order placed successfully!");
    
    return receipt;
  } catch (error) {
    console.error("❌ Failed to place TWAP Order:", error.message || error);
    throw error;
  }
};

export default placeTWAPOrder;