import React, { useState } from "react";

import LSButtons from "../LSButtons/LSButtons";

import CalculatorContainer from "../Calcultors/CalculatorContainer";
import LeverageModal from "../OrderModels/LeverageModal"; // ✅ Add this import

const TWAP = () => {
  const [totalSize, setTotalSize] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const setQuickTime = (h) => {
    setHours(h);
    setMinutes(0);
  };

  const [selectedToken, setSelectedToken] = useState("USDT");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);

  const [leverage, setLeverage] = useState(20); // ✅ leverage state
  const [showLeverageModal, setShowLeverageModal] = useState(false); // ✅ modal toggle
  const [showCalculator, setShowCalculator] = useState(false);

  const tokenPairs = ["USDT", "BTC", "ETH", "BNB"]; // fetch these dynamically , this is for test purpose

  return (
    <div className="bg-gray-900 p-4 rounded-xl w-80 text-white space-y-4">
      {/* Available Balance */}
      <div className="text-gray-400 text-sm relative w-fit">
        Avbl -{" "}
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

      {/* Total Size Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md">
        <div>Total Size</div>
        <input
          type="number"
          className="bg-transparent text-white flex-1 outline-none"
          value={totalSize}
          onChange={(e) => setTotalSize(e.target.value)}
        />
        <span className="text-gray-400">MIN ETH</span>
      </div>

      {/* Size Percentage Slider */}
      <input
        type="range"
        min="0"
        max="100"
        value={percentage}
        onChange={(e) => setPercentage(Number(e.target.value))}
        className="w-full"
      />

      {/* Total Time Inputs */}
      <div className="flex space-x-2">
        <div>Total Time</div>
        <input
          type="number"
          className="bg-gray-800 p-2 rounded-md text-white w-1/2"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="Hours"
        />
        <input
          type="number"
          className="bg-gray-800 p-2 rounded-md text-white w-1/2"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="Minutes"
        />
      </div>

      {/* Quick Timer Buttons */}
      <div className="flex justify-between">
        {[1, 6, 12, 24].map((time) => (
          <button
            key={time}
            className="bg-gray-700 px-3 py-1 rounded"
            onClick={() => setQuickTime(time)}
          >
            {time}h
          </button>
        ))}
      </div>
      <LSButtons
        orderType="limit"
        onBuy={() => {
          console.log("Buy Limit Order", {
            type: "limit",
            price,
            value: percentage,
            reduceOnly,
          });
        }}
        onSell={() => {
          console.log("Sell Limit Order", {
            type: "limit",
            price,
            value: percentage,
            reduceOnly,
          });
        }}
        liqPrice="--"
        cost="0.00"
        max="0.00"
      />
    </div>
  );
};

export default TWAP;
