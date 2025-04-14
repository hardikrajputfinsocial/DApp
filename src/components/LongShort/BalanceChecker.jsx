import React, { useState } from "react";
import { getUserWalletBalance } from "../../hooks/FutureLongShort/getBalanceService"; // Adjust path as needed

const BalanceChecker = () => {
  const [tokenAddress, setTokenAddress] = useState("");
  const [balance, setBalance] = useState(null);

  const handleCheckBalance = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const userAddress = accounts[0];

      const fetchedBalance = await getUserWalletBalance(
        userAddress,
        tokenAddress
      );
      setBalance(fetchedBalance);
    } catch (error) {
      console.error("Balance check failed:", error);
      alert("Error checking balance.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Check Wallet Balance</h2>
      <input
        type="text"
        placeholder="Token address"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />
      <button onClick={handleCheckBalance} style={{ padding: "10px 20px" }}>
        Check Balance
      </button>

      {balance !== null && (
        <div style={{ marginTop: "15px" }}>
          <strong>Balance:</strong> {balance}
        </div>
      )}
    </div>
  );
};

export default BalanceChecker;
