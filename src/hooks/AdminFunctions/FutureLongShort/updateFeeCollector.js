import { ethers } from "ethers";

export const updateFeeCollector = async (contract, newFeeCollector) => {
  try {
    const tx = await contract.updateFeeCollector(newFeeCollector);
    await tx.wait();
    console.log("Fee collector updated successfully");
  } catch (error) {
    console.error("Error updating fee collector:", error);
  }
};