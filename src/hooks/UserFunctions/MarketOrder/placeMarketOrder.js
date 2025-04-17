import { ethers } from "ethers";
import MarketOrderABI from "../../../abis/market.json";

// Use environment variable for contract address
const MARKET_ORDER_ADDRESS = import.meta.env.VITE_MARKET_ORDER;

/**
 * Places a market order using the Market Order contract
 * @param {string} baseToken - The base token address
 * @param {string} quoteToken - The quote token address
 * @param {number} positionType - 0 for Long, 1 for Short
 * @param {string} margin - The margin amount as a string
 * @param {number} leverage - The leverage multiplier
 * @param {string} stopLoss - The stop loss price as a string (optional)
 * @param {string} takeProfit - The take profit price as a string (optional)
 * @returns {Promise<Object>} - Transaction receipt
 */
export const placeMarketOrder = async (
  baseToken,
  quoteToken,
  positionType,
  margin,
  leverage,
  stopLoss = "0",
  takeProfit = "0"
) => {
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

    // Initialize provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Initialize contract
    const marketOrderContract = new ethers.Contract(
      MARKET_ORDER_ADDRESS,
      MarketOrderABI,
      signer
    );

    // Convert values to Wei
    const marginInWei = ethers.parseEther(margin);
    const slInWei = ethers.parseEther(stopLoss);
    const tpInWei = ethers.parseEther(takeProfit);

    // Log the parameters for debugging
    console.log("Placing market order with params:", {
      baseToken,
      quoteToken,
      positionType,
      marginInWei: marginInWei.toString(),
      leverage,
      slInWei: slInWei.toString(),
      tpInWei: tpInWei.toString(),
    });

    // Call the contract function
    const tx = await marketOrderContract.placeMarketOrder(
      baseToken,
      quoteToken,
      positionType, // 0 for Long, 1 for Short
      marginInWei,
      leverage,
      slInWei,
      tpInWei
    );

    console.log("Transaction sent:", tx.hash);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("Market order placed successfully");
    
    return receipt;
  } catch (error) {
    console.error("Error placing market order:", error);
    throw error;
  }
};