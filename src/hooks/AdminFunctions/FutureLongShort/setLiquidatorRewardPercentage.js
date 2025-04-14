import { ethers } from "ethers";

export const setLiquidatorRewardPercentage = async (contract, percentage) => {
  try {
    const tx = await contract.setLiquidatorRewardPercentage(percentage);
    await tx.wait();
    console.log("Liquidator reward percentage updated successfully");
  } catch (error) {
    console.error("Error updating liquidator reward percentage:", error);
  }
};
