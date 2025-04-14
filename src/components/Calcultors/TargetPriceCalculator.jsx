// components/Calculators/TargetPriceCalculator.jsx
import React, { useState } from "react";

const TargetPriceCalculator = () => {
  const [entryPrice, setEntryPrice] = useState("");
  const [roi, setRoi] = useState("");
  const [leverage, setLeverage] = useState(20);
  const [position, setPosition] = useState("Long");
  const [targetPrice, setTargetPrice] = useState("--");

  const calculateTargetPrice = () => {
    const ep = parseFloat(entryPrice);
    const r = parseFloat(roi);

    if (isNaN(ep) || isNaN(r) || leverage <= 0) return;

    let tp;
    if (position === "Long") {
      tp = ep * (1 + (r / 100) / leverage);
    } else {
      tp = ep * (1 - (r / 100) / leverage);
    }

    setTargetPrice(tp.toFixed(2));
  };

  const leverageOptions = [1, 25, 50, 75, 100, 125];

  return (
    <div className="flex gap-4 text-white">
      {/* Left Side */}
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

        {/* Leverage Buttons */}
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

        {/* Leverage Options */}
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
            <label className="text-sm">ROI</label>
            <input
              type="number"
              value={roi}
              onChange={(e) => setRoi(e.target.value)}
              placeholder="%"
              className="bg-transparent text-right outline-none w-28"
            />
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateTargetPrice}
          className="w-full mt-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 rounded-md"
        >
          Calculate
        </button>

        {/* Footer Note */}
        <div className="text-xs text-gray-500 mt-2">
          * See what the potential risk and reward will be in monetary terms on any given trade. Use our Futures Calculator to establish your potential profit/loss on a future trade. Read <span className="text-yellow-400 cursor-pointer">tips</span> on how to use.
        </div>
      </div>

      {/* Right Section - Results */}
      <div className="w-1/2 bg-gray-800 p-4 rounded-md">
        <h3 className="text-md font-semibold mb-4">Results</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex justify-between border-b border-gray-600 pb-1">
            <span>Target Price</span>
            <span>{targetPrice} USDT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetPriceCalculator;
