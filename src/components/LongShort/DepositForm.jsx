import React, { useState } from "react";
import { depositBalance } from "../../hooks/FutureLongShort/useDepositBalance"; 

const DepositForm = () => {
  const [tokenAddress, setTokenAddress] = useState("");
  const [amount, setAmount] = useState("");

  const handleDeposit = async () => {
    try {
      // Get user address from MetaMask
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const userAddress = accounts[0];

      // Call the deposit function
      await depositBalance(userAddress, tokenAddress, amount);

      alert("Deposit successful!");
    } catch (error) {
      console.error("Deposit error:", error);
      alert("Deposit failed!");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Deposit Tokens</h2>
      <input
        type="text"
        placeholder="Token address"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />
      <input
        type="text"
        placeholder="Amount (e.g. 1.5)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />
      <button onClick={handleDeposit} style={{ padding: "10px 20px" }}>
        Deposit
      </button>
    </div>
  );
};

export default DepositForm;
