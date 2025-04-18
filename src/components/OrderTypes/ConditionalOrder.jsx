import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import LSButtons from "../LSButtons/LSButtons";

import CalculatorContainer from "../Calcultors/CalculatorContainer";
import LeverageModal from "../OrderModels/LeverageModal";
import useTokenAddresses from "../../hooks/useTokenAddresses";

const ConditionalOrder = () => {
  const [stopPrice, setStopPrice] = useState("");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [stopType, setStopType] = useState("Mark");
  const [totalMargin, setTotalMargin] = useState("");
  const [userBalance, setUserBalance] = useState("0");

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
      const contract = new ethers.Contract(
        tokenAddresses.usdt,
        ERC20_ABI,
        signer
      );
      const balance = await contract.balanceOf(userAddress);
      const formattedBalance = ethers.formatUnits(balance, 6);
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
    <div className="bg-gray-900 p-4 rounded-xl w-96 text-white space-y-4">
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

      {/* Stop Price Input with Dropdown */}

      <div className="flex items-center bg-gray-800 p-2 rounded-md">
        <div>Stop Price</div>
        <input
          type="number"
          className="bg-transparent text-white flex-1 outline-none"
          value={stopPrice}
          onChange={(e) => setStopPrice(e.target.value)}
        />
        <select
          className="bg-gray-700 text-white px-3 py-1 rounded ml-2"
          value={stopType}
          onChange={(e) => setStopType(e.target.value)}
        >
          <option value="Mark">Mark</option>
          <option value="Last">Last</option>
        </select>
      </div>

      {/* Price Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md">
        <div>Price</div>
        <input
          type="number"
          className="bg-transparent text-white flex-1 outline-none"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <span className="text-gray-400">USDT</span>
        <select
          className="bg-gray-700 text-white px-3 py-1 rounded ml-2"
          value={stopType}
          onChange={(e) => setStopType(e.target.value)}
        >
          <option value="Limit">Limit</option>
          <option value="Market">Market</option>
          <option value="Market">BBO</option>
        </select>
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
      {/* Reduce-Only Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={reduceOnly}
          onChange={() => setReduceOnly(!reduceOnly)}
        />
        <span>Reduce-Only</span>
      </div>

      <LSButtons
        orderType="conditional"
        onBuy={() => {
          console.log("Buy Conditional Order", {
            type: "conditional",
            stopPrice,
            price,
            value: totalMargin,
            reduceOnly,
          });
        }}
        onSell={() => {
          console.log("Sell Conditional Order", {
            type: "conditional",
            stopPrice,
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

export default ConditionalOrder;
