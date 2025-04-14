
import { ethers } from "ethers";
import contractABI from "../../abis/futureLongShort.json";


const contractAddress = import.meta.env.VITE_FUTURE_LONG_SHORT
export async function getCurrentPrice(baseToken, quoteToken) {
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);

        const price = await contract.getCurrentPrice(baseToken, quoteToken);
        return ethers.formatUnits(price, 18); // normalize to human-readable format
    } catch (error) {
        console.error("Failed to fetch price:", error);
        return null;
    }
}