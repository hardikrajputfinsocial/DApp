import { ethers } from "ethers";
import contractABI from "../../abis/futureLongShort.json";


const contractAddress = import.meta.env.VITE_FUTURE_LONG_SHORT

export async function depositBalance(userAddress, tokenAddress, amount) {
    try {
        // Connect to Ethereum provider (MetaMask)
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Create contract instance
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Convert amount to smallest unit (like wei for ETH tokens)
        const parsedAmount = ethers.parseUnits(amount, 18); // change 18 if token uses different decimals

        // Create ERC20 token contract instance
        const erc20 = new ethers.Contract(tokenAddress, [
            "function approve(address spender, uint256 amount) external returns (bool)",
        ], signer);

        // Approve the contract to spend tokens
        const txApprove = await erc20.approve(contractAddress, parsedAmount);
        await txApprove.wait();

        // Call the depositBalance function
        const tx = await contract.depositBalance(userAddress, tokenAddress, parsedAmount);
        await tx.wait();

        console.log("Deposit successful!");
    } catch (error) {
        console.error("Deposit failed:", error);
    }
}