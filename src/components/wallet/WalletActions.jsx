import React, { useState } from "react";
import { useContract } from "../../hooks/newls/useContract";
import { useDeposit } from "../../hooks/newls/useDeposit";
import { useWithdraw } from "../../hooks/newls/useWithdraw";
import { useDeductBalance } from "../../hooks/newls/useDeductBalance";
import { useGetWalletBalance } from "../../hooks/newls/useGetWalletBalance";

const WalletActions = () => {
  const { contract, isReady } = useContract();

  const { depositBalance } = useDeposit();
  const { withdrawBalance } = useWithdraw();
  const { deductBalance } = useDeductBalance();
  const { getWalletBalance } = useGetWalletBalance();

  const [userAddress, setUserAddress] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(null);

  const handleDeposit = () => {
    if (!isReady) return alert("Contract is not ready yet.");
    depositBalance(userAddress, tokenAddress, amount);
  };

  const handleWithdraw = () => {
    if (!isReady) return alert("Contract is not ready yet.");
    withdrawBalance(tokenAddress, amount);
  };

  const handleDeduct = () => {
    if (!isReady) return alert("Contract is not ready yet.");
    deductBalance(userAddress, tokenAddress, amount);
  };

  const handleCheckBalance = async () => {
    if (!isReady) return alert("Contract is not ready yet.");
    const bal = await getWalletBalance(userAddress, tokenAddress);
    setBalance(bal.toString());
  };

  if (!isReady) {
    return (
      <div className="text-center p-10 text-gray-600 text-lg">
        Loading contract...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-xl space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Wallet Actions</h2>

      <input
        type="text"
        placeholder="User Address"
        value={userAddress}
        onChange={(e) => setUserAddress(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Token Address"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Amount (in Wei)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <div className="flex flex-wrap gap-4 justify-center mt-4">
        <button
          onClick={handleDeposit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Deposit
        </button>
        <button
          onClick={handleWithdraw}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Withdraw
        </button>
        <button
          onClick={handleDeduct}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Deduct
        </button>
        <button
          onClick={handleCheckBalance}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Check Balance
        </button>
      </div>

      {balance !== null && (
        <div className="mt-4 text-center">
          <span className="font-semibold">Wallet Balance: </span>
          <span>{balance}</span>
        </div>
      )}
    </div>
  );
};

export default WalletActions;
