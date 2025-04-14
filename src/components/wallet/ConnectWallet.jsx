import React, { useState } from 'react';
import { ethers } from 'ethers';

const ConnectWallet = () => {
  const [currentAccount, setCurrentAccount] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setCurrentAccount(accounts[0]);
        console.log("Connected account:", accounts[0]);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <div className="bg-yellow-400 py-3 rounded-3xl">
      <button onClick={connectWallet}>
        {currentAccount ? `Connected: ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}` : "Connect Wallet"}
      </button>
    </div>
  );
};

export default ConnectWallet;

