// components/Calculators/PnLCalculator.jsx
import React, { useState } from "react";

const PnLCalculator = () => {
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [leverage, setLeverage] = useState(20);
  const [position, setPosition] = useState("Long");

  const [initialMargin, setInitialMargin] = useState("--");
  const [pnl, setPnl] = useState("--");
  const [roi, setRoi] = useState("--");

  const handleCalculate = () => {
    const ep = parseFloat(entryPrice);
    const xp = parseFloat(exitPrice);
    const qty = parseFloat(quantity);

    if (isNaN(ep) || isNaN(xp) || isNaN(qty)) return;

    const direction = position === "Long" ? 1 : -1;
    const margin = (ep * qty) / leverage;
    const profit = (xp - ep) * qty * direction;
    const returnOnInvestment = (profit / margin) * 100;

    setInitialMargin(margin.toFixed(2));
    setPnl(profit.toFixed(2));
    setRoi(returnOnInvestment.toFixed(2));
  };

  const leverageOptions = [1, 25, 50, 75, 100, 125];

  return (
    <div className="flex gap-4 text-white">
      {/* Left Section */}
      <div className="w-1/2 space-y-3">
        {/* Position Switch */}
        <div className="flex gap-2 bg-gray-800 rounded-md p-1">
          <button
            className={`w-1/2 py-1 rounded-md ${
              position === "Long"
                ? "bg-green-500 text-black"
                : "text-white"
            }`}
            onClick={() => setPosition("Long")}
          >
            Long
          </button>
          <button
            className={`w-1/2 py-1 rounded-md ${
              position === "Short"
                ? "bg-red-500 text-white"
                : "text-white"
            }`}
            onClick={() => setPosition("Short")}
          >
            Short
          </button>
        </div>

        {/* Leverage Controls */}
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

        {/* Leverage Slider */}
        <div className="flex items-center justify-between text-xs text-gray-400">
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
            <label className="text-sm">Exit Price</label>
            <input
              type="number"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
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
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          className="w-full mt-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 rounded-md"
        >
          Calculate
        </button>

        {/* Footer Note */}
        <div className="text-xs text-gray-500 mt-2">
          * See what the potential risk and reward will be in monetary terms. Use our Futures Calculator to establish your potential profit/loss on a trade. Read <span className="text-yellow-400 cursor-pointer">tips</span> on how to use.
        </div>
      </div>

      {/* Right Section - Results */}
      <div className="w-1/2 bg-gray-800 p-4 rounded-md">
        <h3 className="text-md font-semibold mb-4">Results</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex justify-between border-b border-gray-600 pb-1">
            <span>Initial Margin</span>
            <span>{initialMargin} USDT</span>
          </div>
          <div className="flex justify-between border-b border-gray-600 pb-1">
            <span>PnL</span>
            <span>{pnl} USDT</span>
          </div>
          <div className="flex justify-between border-b border-gray-600 pb-1">
            <span>ROI</span>
            <span>{roi} %</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PnLCalculator;
