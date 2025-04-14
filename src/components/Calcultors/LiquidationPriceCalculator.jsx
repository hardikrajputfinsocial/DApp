// components/Calculators/LiquidationPriceCalculator.jsx
import React, { useState } from "react";

const LiquidationPriceCalculator = () => {
  const [entryPrice, setEntryPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [balance, setBalance] = useState("");
  const [leverage, setLeverage] = useState(20);
  const [position, setPosition] = useState("Long");
  const [liquidationPrice, setLiquidationPrice] = useState("--");

  const calculateLiquidationPrice = () => {
    const ep = parseFloat(entryPrice);
    const q = parseFloat(quantity);
    const b = parseFloat(balance);

    if (isNaN(ep) || isNaN(q) || isNaN(b) || leverage <= 0) return;

    let liqPrice;

    // Basic formula for isolated margin liquidation price
    const margin = b * leverage;
    const positionValue = ep * q;
    const maintenanceMarginRate = 0.005; // 0.5%

    if (position === "Long") {
      liqPrice = (positionValue - margin + (positionValue * maintenanceMarginRate)) / q;
    } else {
      liqPrice = (positionValue + margin - (positionValue * maintenanceMarginRate)) / q;
    }

    setLiquidationPrice(liqPrice.toFixed(2));
  };

  const leverageOptions = [1, 25, 50, 75, 100, 125];

  return (
    <div className="flex gap-4 text-white">
      {/* Left Inputs */}
      <div className="w-1/2 space-y-3">
        {/* Position Switch */}
        <div className="flex gap-2 bg-gray-800 rounded-md p-1">
          <button
            className={`w-1/2 py-1 rounded-md ${
              position === "Long" ? "bg-green-500 text-black" : "text-white"
            }`}
            onClick={() => setPosition("Long")}
          >
            Long
          </button>
          <button
            className={`w-1/2 py-1 rounded-md ${
              position === "Short" ? "bg-red-500 text-white" : "text-white"
            }`}
            onClick={() => setPosition("Short")}
          >
            Short
          </button>
        </div>

        {/* Leverage Counter */}
        <div className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded-md">
          <button
            className="text-xl"
            onClick={() => setLeverage((prev) => Math.max(1, prev - 1))}
          >
            -
          </button>
          <div className="text-sm font-semibold">{leverage}x</div>
          <button
            className="text-xl"
            onClick={() => setLeverage((prev) => Math.min(125, prev + 1))}
          >
            +
          </button>
        </div>

        {/* Leverage Indicators */}
        <div className="flex justify-between text-xs text-gray-400">
          {leverageOptions.map((value) => (
            <div key={value} className="text-center w-full">
              <div className="h-2 w-2 mx-auto bg-white rounded-full"></div>
              {value}x
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-400">
          Maximum position at current leverage:{" "}
          <span className="text-white font-semibold">100,000,000 USDT</span>
        </div>

        {/* Inputs */}
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-gray-800 p-2 rounded-md">
            <label className="text-sm">Entry Price</label>
            <input
              type="number"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              placeholder="USDT"
              className="bg-transparent text-right outline-none w-28"
            />
          </div>
          <div className="flex justify-between items-center bg-gray-800 p-2 rounded-md">
            <label className="text-sm">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="BTC"
              className="bg-transparent text-right outline-none w-28"
            />
          </div>
          <div className="flex justify-between items-center bg-gray-800 p-2 rounded-md">
            <label className="text-sm">Balance</label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="USDT"
              className="bg-transparent text-right outline-none w-28"
            />
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateLiquidationPrice}
          className="w-full mt-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 rounded-md"
        >
          Calculate
        </button>

        {/* Info Note */}
        <div className="text-xs text-gray-500 mt-2">
          * Your open positions will be taken into consideration when calculating the liquidation price. Unrealized PNL and maintenance margin of your open position will affect the calculation of liquidation price.
        </div>
      </div>

      {/* Right - Results */}
      <div className="w-1/2 bg-gray-800 p-4 rounded-md">
        <h3 className="text-md font-semibold mb-4">Results</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex justify-between border-b border-gray-600 pb-1">
            <span>Liquidation Price</span>
            <span>{liquidationPrice} USDT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidationPriceCalculator;
