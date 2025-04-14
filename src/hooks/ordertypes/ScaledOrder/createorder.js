import { useState } from "react";
import { ethers } from "ethers";
import CONTRACT_ABI from "../constants/contractABI.json"; // adjust the path if needed
import { CONTRACT_ADDRESS } from "../constants/address";   // adjust the path if needed

export const useCreateOrder = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [orderId, setOrderId] = useState(null);

    const createOrder = async (
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

            const newOrderId = receipt.logs[0]?.args?.[0]?.toString();
            setOrderId(newOrderId);
            return newOrderId;
        } catch (err) {
            console.error("Error creating order:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { createOrder, loading, error, orderId };
};
