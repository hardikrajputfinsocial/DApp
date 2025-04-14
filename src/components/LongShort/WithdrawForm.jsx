import React, { useState } from "react";
import { withdrawBalance } from "../../hooks/FutureLongShort/withdrawService"; // Adjust path as needed

const WithdrawForm = () => {
  const [tokenAddress, setTokenAddress] = useState("");
  const [amount, setAmount] = useState("");

  const handleWithdraw = async () => {
    try {
      await withdrawBalance(tokenAddress, amount);
      alert("Withdraw successful!");
    } catch (error) {
      console.error("Withdraw error:", error);
      alert("Withdraw failed!");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Withdraw Tokens</h2>
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
      <button onClick={handleWithdraw} style={{ padding: "10px 20px" }}>
        Withdraw
      </button>
    </div>
  );
};

export default WithdrawForm;
