import { ethers } from "ethers";
import contractABI from "../../abis/futureLongShort.json";

console.log("ENV Vars:", import.meta.env);

const contractAddress = import.meta.env.VITE_FUTURE_LONG_SHORT
console.log("Contract Address:", contractAddress);

export async function withdrawBalance(tokenAddress, amount) {
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        const parsedAmount = ethers.parseUnits(amount, 18);

        const tx = await contract.withdrawBalance(tokenAddress, parsedAmount);
        await tx.wait();

        console.log("Withdraw successful!");
    } catch (error) {
        console.error("Withdraw failed:", error);
    }
}