import { ethers } from "ethers";

export const setMaxLeverage = async (contract, newMaxLev) => {
  try {
    const tx = await contract.setMaxLeverage(newMaxLev);
    await tx.wait();
    console.log("Max leverage updated successfully");
  } catch (error) {
    console.error("Error setting max leverage:", error);
  }
};