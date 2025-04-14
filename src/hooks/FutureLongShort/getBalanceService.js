import { ethers } from "ethers";
import contractABI from "../../abis/futureLongShort.json";


const contractAddress = import.meta.env.VITE_FUTURE_LONG_SHORT

export async function getUserWalletBalance(userAddress, tokenAddress) {
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);

        const balance = await contract.getUserWalletBalance(userAddress, tokenAddress);
        return ethers.formatUnits(balance, 18); // Convert from smallest unit to readable format
    } catch (error) {
        console.error("Error fetching balance:", error);
        return null;
    }
}