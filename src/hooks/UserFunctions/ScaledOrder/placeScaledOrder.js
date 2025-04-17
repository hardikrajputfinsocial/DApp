import { ethers } from "ethers";
import ScaledOrderABI from "../../../abis/ScaledOrder.json";

// Use environment variable for contract address
const SCALED_ORDER_ADDRESS = import.meta.env.VITE_SACLED_ORDER;

/**
 * Places a scaled order using the Scaled Order contract
 * @param {string} baseToken - The base token address
 * @param {string} quoteToken - The quote token address
 * @param {number} positionType - 0 for Long, 1 for Short
 * @param {string} totalMargin - The total margin amount as a string
 * @param {number} leverage - The leverage multiplier
 * @param {string} startPrice - The start price as a string
 * @param {string} endPrice - The end price as a string
 * @param {number} numTranches - The number of tranches to create
 * @returns {Promise<Object>} - Transaction receipt
 */
export const placeScaledOrder = async (
  baseToken,
  quoteToken,
  positionType,
  totalMargin,
  leverage,
  startPrice,
  endPrice,
  numTranches
) => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not found. Please install MetaMask.");
    }

    // Validate inputs
    if (!baseToken || !quoteToken) {
      throw new Error("Invalid token addresses");
    }

    if (isNaN(totalMargin) || parseFloat(totalMargin) <= 0) {
      throw new Error("Invalid margin amount");
    }

    if (isNaN(leverage) || leverage <= 0) {
      throw new Error("Invalid leverage value");
    }

    if (isNaN(startPrice) || parseFloat(startPrice) <= 0) {
      throw new Error("Invalid start price");
    }

    if (isNaN(endPrice) || parseFloat(endPrice) <= 0) {
      throw new Error("Invalid end price");
    }

    if (isNaN(numTranches) || numTranches <= 0 || !Number.isInteger(numTranches)) {
      throw new Error("Number of tranches must be a positive integer");
    }

    // Initialize provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Initialize contract
    const scaledOrderContract = new ethers.Contract(
      SCALED_ORDER_ADDRESS,
      ScaledOrderABI,
      signer
    );

    // Convert values to Wei
    const totalMarginInWei = ethers.parseEther(totalMargin);
    const startPriceInWei = ethers.parseEther(startPrice);
    const endPriceInWei = ethers.parseEther(endPrice);

    // Log the parameters for debugging
    console.log("Placing scaled order with params:", {
      baseToken,
      quoteToken,
      positionType,
      totalMarginInWei: totalMarginInWei.toString(),
      leverage,
      startPriceInWei: startPriceInWei.toString(),
      endPriceInWei: endPriceInWei.toString(),
      numTranches
    });

    // Call the contract function
    const tx = await scaledOrderContract.createScaledOrder(
      baseToken,
      quoteToken,
      positionType, // 0 for Long, 1 for Short
      totalMarginInWei,
      leverage,
      startPriceInWei,
      endPriceInWei,
      numTranches
    );

    console.log("Transaction sent:", tx.hash);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("Scaled order placed successfully");
    
    return receipt;
  } catch (error) {
    console.error("Error placing scaled order:", error);
    throw error;
  }
};

export default placeScaledOrder;