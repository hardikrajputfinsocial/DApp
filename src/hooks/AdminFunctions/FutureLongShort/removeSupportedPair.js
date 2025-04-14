import { ethers } from "ethers";

export const removeSupportedPair = async (contract, baseToken, quoteToken) => {
  try {
    const tx = await contract.removeSupportedPair(baseToken, quoteToken);
    await tx.wait();
    console.log("Supported pair removed successfully");
  } catch (error) {
    console.error("Error removing supported pair:", error);
  }
};