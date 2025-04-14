import { useState } from "react";
import { ethers } from "ethers";
import CONTRACT_ABI from "../constants/contractABI.json";
import { CONTRACT_ADDRESS } from "../constants/address";

export const useExecuteTranches = () => {
    const [executing, setExecuting] = useState(false);
    const [error, setError] = useState(null);
    const [txHash, setTxHash] = useState(null);
    const [completed, setCompleted] = useState(false);

    const executeTranches = async (_orderId) => {
        setExecuting(true);
        setError(null);
        setTxHash(null);
        setCompleted(false);

        try {
            if (!window.ethereum) throw new Error("MetaMask not found");

            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const tx = await contract.executeTranches(_orderId);
            console.log("Transaction sent:", tx.hash);
            setTxHash(tx.hash);

            const receipt = await tx.wait();
            console.log("Execution confirmed in block:", receipt.blockNumber);

            setCompleted(true);
        } catch (err) {
            console.error("Error executing tranches:", err);
            setError(err?.message || "Execution failed");
        } finally {
            setExecuting(false);
        }
    };

    return { executeTranches, executeTranchesLoading: executing, executeTranchesError: error, txHash, completed };
};

