import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import futureLongShortABI from "../../abis/futureLongShort.json";

const FUTURE_LONG_SHORT_ADDRESS = import.meta.env.VITE_FUTURE_LONG_SHORT;

const SLTPToggle = ({
  isTPSLEnabled,
  setIsTPSLEnabled,
  takeProfit,
  setTakeProfit,
  stopLoss,
  setStopLoss,
  baseToken,
  quoteToken,
}) => {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [tpPriceType, setTpPriceType] = useState("Mark");
  const [slPriceType, setSlPriceType] = useState("Mark");
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentPrice = async () => {
    if (!baseToken || !quoteToken) return;

    try {
      setIsLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(
        FUTURE_LONG_SHORT_ADDRESS,
        futureLongShortABI,
        signer
      );

      const price = await contract.getCurrentPrice(baseToken, quoteToken);
      const formattedPrice = ethers.formatEther(price);
      setCurrentPrice(formattedPrice);
      
      // If Mark is selected, update the fields
      if (tpPriceType === "Mark" && isTPSLEnabled) {
        setTakeProfit(formattedPrice);
      }
      if (slPriceType === "Mark" && isTPSLEnabled) {
        setStopLoss(formattedPrice);
      }
    } catch (error) {
      console.error("Error fetching current price:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch price when tokens change or price type changes
  useEffect(() => {
    getCurrentPrice();
    
    // Set up interval to update price every 10 seconds
    const interval = setInterval(getCurrentPrice, 10000);
    
    return () => clearInterval(interval);
  }, [baseToken, quoteToken, tpPriceType, slPriceType]);

  const handlePriceTypeChange = (type, field) => {
    if (field === 'tp') {
      setTpPriceType(type);
      if (type === 'Mark' && currentPrice) {
        setTakeProfit(currentPrice);
      }
    } else {
      setSlPriceType(type);
      if (type === 'Mark' && currentPrice) {
        setStopLoss(currentPrice);
      }
    }
  };

  return (
    <div className="space-y-2">
      {/* TP/SL Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isTPSLEnabled}
          onChange={() => setIsTPSLEnabled(!isTPSLEnabled)}
        />
        <span>TP/SL</span>
      </div>

      {isTPSLEnabled && (
        <div className="space-y-2">
          <div className="flex items-center bg-gray-800 p-2 rounded-md">
            <input
              className="bg-transparent text-white flex-1 outline-none"
              placeholder="Take Profit"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
            />
            <select 
              className="bg-gray-700 text-white p-1 rounded"
              value={tpPriceType}
              onChange={(e) => handlePriceTypeChange(e.target.value, 'tp')}
            >
              <option value="Mark">Mark</option>
              <option value="Last">Last</option>
            </select>
          </div>
          <div className="flex items-center bg-gray-800 p-2 rounded-md">
            <input
              className="bg-transparent text-white flex-1 outline-none"
              placeholder="Stop Loss"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
            />
            <select 
              className="bg-gray-700 text-white p-1 rounded"
              value={slPriceType}
              onChange={(e) => handlePriceTypeChange(e.target.value, 'sl')}
            >
              <option value="Mark">Mark</option>
              <option value="Last">Last</option>
            </select>
          </div>
          {isLoading && (
            <div className="text-xs text-gray-400">Fetching current price...</div>
          )}
          {currentPrice && (
            <div className="text-xs text-gray-400">
              Current Price: {parseFloat(currentPrice).toFixed(2)} USDT
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SLTPToggle;
