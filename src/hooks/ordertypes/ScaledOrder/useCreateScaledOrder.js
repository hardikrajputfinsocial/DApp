import { useState } from "react";
import { ethers } from "ethers";
import CONTRACT_ABI from "../constants/contractABI.json"; // Adjust path if needed
import { CONTRACT_ADDRESS } from "../constants/address";   // Adjust path if needed

export const useCreateScaledOrder = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [orderId, setOrderId] = useState(null);

    const createScaledOrder = async (
        positionType,
        totalMargin,
        leverage,
        startPrice,
        endPrice,
        numTranches,
        expiryDuration
    ) => {
        setLoading(true);
        setError(null);
        setOrderId(null);

        try {
            if (!window.ethereum) throw new Error("MetaMask is not installed");

            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const tx = await contract.createScaledOrder(
                positionType,
                totalMargin,
                leverage,
                startPrice,
                endPrice,
                numTranches,
                expiryDuration
            );

            console.log("Transaction sent:", tx.hash);
            const receipt = await tx.wait();
            console.log("Transaction confirmed in block:", receipt.blockNumber);

            // Parse the orderId from emitted event or receipt
            const newOrderId = receipt.logs[0]?.args?.[0]?.toString();
            setOrderId(newOrderId);
            return newOrderId;
        } catch (err) {
            console.error("Error creating scaled order:", err);
            setError(err?.message || "Transaction failed");
        } finally {
            setLoading(false);
        }
    };

    return { createScaledOrder, loading, error, orderId };
};
