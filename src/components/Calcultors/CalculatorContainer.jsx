// components/Calculators/CalculatorContainer.jsx
import React, { useState } from "react";
import PnLCalculator from "./PnLCalculator";
// import other calculators when ready
import TargetPriceCalculator from "./TargetPriceCalculator";
import LiquidationPriceCalculator from "./LiquidationPriceCalculator";
import MaxOpenCalculator from "./MaxOpenCalculator";
// import OpenPriceCalculator from "./OpenPriceCalculator";

const CalculatorContainer = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("pnl");

  return (
    <div className="absolute top-0 left-full ml-4 w-96 bg-gray-900 p-4 rounded-xl shadow-lg z-50">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-white">Calculator</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-lg"
        >
          ✕
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveTab("pnl")}
          className={`px-3 py-1 rounded-md text-sm ${
            activeTab === "pnl"
              ? "bg-yellow-600 text-black"
              : "bg-gray-800 text-white"
          }`}
        >
          PnL
        </button>
        <button
          onClick={() => setActiveTab("target")}
          className={`px-3 py-1 rounded-md text-sm ${
            activeTab === "target"
              ? "bg-yellow-600 text-black"
              : "bg-gray-800 text-white"
          }`}
        >
          Target Price
        </button>

        <button
          onClick={() => setActiveTab("liquidation")}
          className={`px-3 py-1 rounded-md text-sm ${
            activeTab === "liquidation"
              ? "bg-yellow-600 text-black"
              : "bg-gray-800 text-white"
          }`}
        >
          Liquidation Price
        </button>

        <button
          onClick={() => setActiveTab("maxopen")}
          className={`px-3 py-1 rounded-md text-sm ${
            activeTab === "maxopen"
              ? "bg-yellow-600 text-black"
              : "bg-gray-800 text-white"
          }`}
        >
          Max Open
        </button>

        <button
          onClick={() => setActiveTab("openprice")}
          className={`px-3 py-1 rounded-md text-sm ${
            activeTab === "openprice"
              ? "bg-yellow-600 text-black"
              : "bg-gray-800 text-white"
          }`}
        >
          Open Price
        </button>
        {/* Add more buttons for other calculators */}
      </div>

      {/* Render selected calculator */}
      <div>
        {activeTab === "pnl" && <PnLCalculator />}
        {activeTab === "target" && <TargetPriceCalculator />}
        {activeTab === "liquidation" && <LiquidationPriceCalculator />}

        {activeTab === "maxopen" && <MaxOpenCalculator />}
        {activeTab === "openprice" && <OpenPriceCalculator />}

        {/* Add conditional rendering for other calculators */}
      </div>
    </div>
  );
};

export default CalculatorContainer;
