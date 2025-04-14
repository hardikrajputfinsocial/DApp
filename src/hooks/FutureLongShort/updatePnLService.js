import { ethers } from "ethers";
import contractABI from "../../abis/futureLongShort.json";


const contractAddress = import.meta.env.VITE_FUTURE_LONG_SHORT

export async function updatePnL(positionId) {
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        const tx = await contract.updatePnL(positionId);
        await tx.wait();

        console.log("PnL updated successfully for position ID:", positionId);
        return true;
    } catch (error) {
        console.error("Failed to update PnL:", error);
        return false;
    }
}