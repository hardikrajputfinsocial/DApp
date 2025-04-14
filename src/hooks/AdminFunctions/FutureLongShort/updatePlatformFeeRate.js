import { ethers } from "ethers";

export const updatePlatformFeeRate = async (contract, newFeeRate) => {
  try {
    const tx = await contract.updatePlatformFeeRate(newFeeRate);
    await tx.wait();
    console.log("Platform fee rate updated successfully");
  } catch (error) {
    console.error("Error updating platform fee rate:", error);
  }
};
