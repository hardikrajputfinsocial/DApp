import { ethers } from "ethers";

export const addSupportedPair = async (contract, baseToken, quoteToken, oracleAddress) => {
  try {
    const tx = await contract.addSupportedPair(baseToken, quoteToken, oracleAddress);
    await tx.wait();
    console.log("Supported pair added successfully");
  } catch (error) {
    console.error("Error adding supported pair:", error);
  }
};