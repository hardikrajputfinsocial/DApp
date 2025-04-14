import React, { useState } from "react";

import CalculatorContainer from "../Calcultors/CalculatorContainer";
import LeverageModal from "../OrderModels/LeverageModal"; // ✅ Add this import

const ScaledOrder = () => {
  const [lowerPrice, setLowerPrice] = useState("");
  const [upperPrice, setUpperPrice] = useState("");
  const [size, setSize] = useState("");
  const [orderCount, setOrderCount] = useState(2);
  const [distribution, setDistribution] = useState("flat");
  const [action, setAction] = useState("buy");

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

      {/* Input Fields */}
      <div className="space-y-2">
        <div className="flex items-center bg-gray-800 p-2 rounded-md">
          <div>Lower Price</div>
          <input
            type="number"
            className="bg-transparent text-white flex-1 outline-none"
            value={lowerPrice}
            onChange={(e) => setLowerPrice(e.target.value)}
          />
          <span className="ml-2">USDT</span>
        </div>

        <div className="flex items-center bg-gray-800 p-2 rounded-md">
          <div>Upper Price</div>
          <input
            type="number"
            className="bg-transparent text-white flex-1 outline-none"
            value={upperPrice}
            onChange={(e) => setUpperPrice(e.target.value)}
          />
          <span className="ml-2">USDT</span>
        </div>

        <div className="flex items-center bg-gray-800 p-2 rounded-md">
          <div>Size</div>
          <input
            type="number"
            className="bg-transparent text-white flex-1 outline-none"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />
          <span className="ml-2">ETH</span>
        </div>

        <div className="flex items-center bg-gray-800 p-2 rounded-md">
          <div>Order Count</div>
          <input
            type="number"
            className="bg-transparent text-white flex-1 outline-none"
            value={orderCount}
            min={2}
            max={50}
            onChange={(e) => setOrderCount(e.target.value)}
          />
        </div>
      </div>

      {/* Size Distribution */}
      <div>
        <p className="text-gray-400">Size Distribution</p>
        <div className="flex justify-between mt-2">
          {[
            { label: "Flat", value: "flat" },
            { label: "⬇⬆", value: "downUp" },
            { label: "⬆⬇", value: "upDown" },
            { label: "Random (±5%)", value: "random" },
          ].map((option) => (
            <button
              key={option.value}
              className={`px-2 py-1 rounded ${
                distribution === option.value ? "bg-blue-500" : "bg-gray-700"
              }`}
              onClick={() => setDistribution(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          className={`px-4 py-2 rounded ${
            action === "buy" ? "bg-green-500" : "bg-gray-700"
          }`}
          onClick={() => setAction("buy")}
        >
          Buy
        </button>
        <button
          className={`px-4 py-2 rounded ${
            action === "sell" ? "bg-red-500" : "bg-gray-700"
          }`}
          onClick={() => setAction("sell")}
        >
          Sell
        </button>
      </div>
    </div>
  );
};

export default ScaledOrder;
