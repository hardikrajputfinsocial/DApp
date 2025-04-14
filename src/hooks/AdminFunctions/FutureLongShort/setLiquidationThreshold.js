import { ethers } from "ethers";

export const setLiquidationThreshold = async (contract, newLT) => {
  try {
    const tx = await contract.setLiquidationThreshold(newLT);
    await tx.wait();
    console.log("Liquidation threshold updated successfully");
  } catch (error) {
    console.error("Error setting liquidation threshold:", error);
  }
};