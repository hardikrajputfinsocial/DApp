import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { SLTPToggle, ReduceOnlyToggle } from "../TradeOptions/index";

import CalculatorContainer from "../Calcultors/CalculatorContainer";
import LSButtons from "../LSButtons/LSButtons";
import LeverageModal from "../OrderModels/LeverageModal";
import useTokenAddresses from "../../hooks/useTokenAddresses";

const PostOnly = () => {
  const [price, setPrice] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [totalMargin, setTotalMargin] = useState("");
  const [userBalance, setUserBalance] = useState("0");
  const [isTPSLEnabled, setIsTPSLEnabled] = useState(false);
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [reduceOnly, setReduceOnly] = useState(false);

  const [selectedToken, setSelectedToken] = useState("BTC/USDT");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);

  const [leverage, setLeverage] = useState(20);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const { tokenAddresses } = useTokenAddresses();

  const tokenPairs = [
    "BTC/USDT",
    "ETH/USDT",
    "BNB/USDT",
    "SOL/USDT",
    "FIN/USDT",
  ];
  
  // Fetch user balance
  const fetchUserBalance = async () => {
    try {
      if (!window.ethereum) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      // For demo purposes, we're using a mock balance
      // In a real app, you would fetch this from a contract
      const balance = await provider.getBalance(userAddress);
      const formattedBalance = ethers.formatEther(balance);
      setUserBalance(formattedBalance);
    } catch (error) {
      console.error("Error fetching user balance:", error);
    }
  };
  
  // Initialize and fetch user balance
  useEffect(() => {
    fetchUserBalance();
  }, []);
  
  // Update the percentage slider and margin calculation
  const handlePercentageChange = useCallback((newPercentage) => {
    setPercentage(newPercentage);
    const calculatedMargin = (parseFloat(userBalance) * newPercentage) / 100;
    setTotalMargin(calculatedMargin.toFixed(2));
  }, [userBalance]);

  return (
    <div className="bg-gray-900 p-4 rounded-xl w-80 text-white space-y-4">
      {/* Token Pair */}
      <div className="text-gray-400 text-sm relative w-fit">
        Token Pair -{" "}
        <button
          onClick={() => setShowTokenDropdown(!showTokenDropdown)}
          className="text-white font-medium hover:underline"
        >
          {selectedToken}
        </button>
        {showTokenDropdown && (
          <div className="absolute top-6 left-14 bg-gray-800 rounded shadow-lg z-10">
            {tokenPairs.map((token) => (
              <div
                key={token}
                onClick={() => {
                  setSelectedToken(token);
                  setShowTokenDropdown(false);
                }}
                className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer"
              >
                {token}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calculator Button */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setShowCalculator(true)}
          className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-black font-semibold"
        >
          Calculator
        </button>

        {/* ✅ Leverage Button */}
        <button
          onClick={() => setShowLeverageModal(true)}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm text-white"
        >
          Leverage: {leverage}x
        </button>
      </div>

      {showCalculator && (
        <CalculatorContainer onClose={() => setShowCalculator(false)} />
      )}

      {/* ✅ Leverage Modal */}
      <LeverageModal
        show={showLeverageModal}
        onClose={() => setShowLeverageModal(false)}
        onConfirm={(val) => setLeverage(val)}
        currentLeverage={leverage}
      />

      {/* Price Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md">
        <div>Price</div>
        <input
          className="bg-transparent text-white flex-1 outline-none"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <span className="text-gray-400">USDT</span>
      </div>

      {/* Total Margin Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md">
        <div>Total Margin</div>
        <input
          type="number"
          className="bg-transparent text-white flex-1 outline-none"
          value={totalMargin}
          onChange={(e) => {
            setTotalMargin(e.target.value);
            // Calculate and set percentage based on input margin
            if (userBalance && parseFloat(userBalance) > 0) {
              const newPercentage = (parseFloat(e.target.value) / parseFloat(userBalance)) * 100;
              setPercentage(Math.min(100, Math.max(0, newPercentage)));
            }
          }}
          placeholder="0.00"
          step="0.01"
          min="0"
        />
        <span className="text-gray-400">USDT</span>
      </div>
      
      {/* Available Balance Display */}
      <div className="text-sm text-gray-400 pl-2 mb-2">
        Available: {parseFloat(userBalance).toFixed(2)} USDT
      </div>

      {/* Size Percentage Slider */}
      <div className="space-y-2 mb-2">
        <input
          type="range"
          min="0"
          max="100"
          value={percentage}
          onChange={(e) => handlePercentageChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      <SLTPToggle
        isTPSLEnabled={isTPSLEnabled}
        setIsTPSLEnabled={(value) => {
          setIsTPSLEnabled(value);
          if (value) setReduceOnly(false);
        }}
        takeProfit={takeProfit}
        setTakeProfit={setTakeProfit}
        stopLoss={stopLoss}
        setStopLoss={setStopLoss}
        disabled={reduceOnly}
      />
      <ReduceOnlyToggle
        reduceOnly={reduceOnly}
        setReduceOnly={(value) => {
          setReduceOnly(value);
          if (value) setIsTPSLEnabled(false);
        }}
        disabled={isTPSLEnabled}
      />
      <LSButtons
        orderType="postonly"
        onBuy={() => {
          console.log("Buy Post Only Order", {
            type: "postonly",
            price,
            value: totalMargin,
            reduceOnly,
          });
        }}
        onSell={() => {
          console.log("Sell Post Only Order", {
            type: "postonly",
            price,
            value: totalMargin,
            reduceOnly,
          });
        }}
        liqPrice="--"
        cost={totalMargin || "0.00"}
        max={userBalance}
      />
    </div>
  );
};

export default PostOnly;
