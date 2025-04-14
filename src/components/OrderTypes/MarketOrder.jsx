import React, { useState } from "react";

import { SLTPToggle, ReduceOnlyToggle } from "../TradeOptions/index";
import CalculatorContainer from "../Calcultors/CalculatorContainer";
import LSButtons from "../LSButtons/LSButtons";
import LeverageModal from "../OrderModels/LeverageModal"; // ✅ Add this import

const MarketOrder = () => {
  const [percentage, setPercentage] = useState(0);
  const [isTPSLEnabled, setIsTPSLEnabled] = useState(false);
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [reduceOnly, setReduceOnly] = useState(false);

  const [selectedToken, setSelectedToken] = useState("USDT");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);

  const [showCalculator, setShowCalculator] = useState(false);

  const [leverage, setLeverage] = useState(20); // ✅ leverage state
  const [showLeverageModal, setShowLeverageModal] = useState(false); // ✅ modal toggle

  const tokenPairs = [
    "BTC/USDT",
    "ETH/USDT",
    "BNB/USDT",
    "SOL/USDT",
    "FIN/USDT",
  ];

  return (
    <div className="bg-gray-900 p-4 rounded-xl w-80 text-white space-y-4">
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

      {/* Size Input (Displays Percentage) */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md">
        <div>Size</div>
        <input
          className="bg-transparent text-white flex-1 outline-none"
          value={percentage} // Display percentage in input box
          onChange={(e) => setPercentage(e.target.value)}
        />
        <span className="text-gray-400">%</span> {/* Shows percentage symbol */}
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

export default MarketOrder;
