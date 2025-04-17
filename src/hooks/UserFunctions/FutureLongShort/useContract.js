import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import ContractABI from '../../../abis/futureLongShort.json';

// Use environment variable instead of hardcoded address
const CONTRACT_ADDRESS = import.meta.env.VITE_FUTURE_LONG_SHORT;

export const useContract = () => {
  const [contract, setContract] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [signer, setSigner] = useState(null);

  const initializeContract = async () => {
    console.log("Initializing contract...");
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not found");
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please connect MetaMask.");
      }

      console.log("Connected account:", accounts[0]);

      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setSigner(signer);

      // Create contract instance
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        ContractABI,
        signer
      );

      // Verify contract
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (code === "0x") {
        throw new Error(`No contract found at ${CONTRACT_ADDRESS}`);
      }

      console.log("Contract initialized successfully");
      setContract(contractInstance);
      setIsReady(true);
      setError(null);

    } catch (err) {
      console.error("Contract initialization failed:", err);
      setError(err.message);
      setIsReady(false);
      setContract(null);
    }
  };

  useEffect(() => {
    initializeContract();

    // Add listeners for account and chain changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        console.log("Account changed, reinitializing...");
        initializeContract();
      });

      window.ethereum.on("chainChanged", () => {
        console.log("Network changed, reloading...");
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  return { contract, isReady, error, signer };
};
