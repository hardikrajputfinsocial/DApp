import { ethers } from "ethers";
import contractABI from "../../abis/futureLongShort.json";

const contractAddress = import.meta.env.VITE_FUTURE_LONG_SHORT;

export async function closePosition(positionId) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const tx = await contract.closePosition(BigInt(positionId));
    console.log("Close position transaction:", tx);

    await tx.wait();
    console.log("Position closed successfully!");
    return { success: true, message: "Position closed successfully!" };
  } catch (error) {
    console.error("Failed to close position:", error);

    if (error.message?.includes("Position already closed")) {
      return {
        success: false,
        message: "This position is already closed.",
      };
    }

    return {
      success: false,
      message: error.message || "Failed to close position. Please try again.",
    };
  }
}
