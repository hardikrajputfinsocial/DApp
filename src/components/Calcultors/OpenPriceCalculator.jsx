// components/Calculators/OpenPriceCalculator.jsx
import React, { useState } from "react";
import { Trash2, Plus } from "lucide-react";

const OpenPriceCalculator = () => {
  const [positions, setPositions] = useState([
    { entryPrice: "", quantity: "" },
  ]);
  const [positionType, setPositionType] = useState("Long");
  const [avgPrice, setAvgPrice] = useState("--");

  const updatePosition = (index, field, value) => {
    const updated = [...positions];
    updated[index][field] = value;
    setPositions(updated);
  };

  const addPosition = () => {
    setPositions([...positions, { entryPrice: "", quantity: "" }]);
  };

  const removePosition = (index) => {
    const updated = positions.filter((_, i) => i !== index);
    setPositions(updated);
  };

  const calculateAvgPrice = () => {
    let totalCost = 0;
    let totalQty = 0;

    for (let pos of positions) {
      const price = parseFloat(pos.entryPrice);
      const qty = parseFloat(pos.quantity);
      if (!isNaN(price) && !isNaN(qty) && qty > 0 && price > 0) {
        totalCost += price * qty;
        totalQty += qty;
      }
    }

    const avg = totalQty > 0 ? totalCost / totalQty : "--";
    setAvgPrice(avg === "--" ? "--" : avg.toFixed(2));
  };

  return (
    <div className="flex gap-4 text-white">
      {/* Left Inputs */}
      <div className="w-1/2 space-y-3">
        {/* Position Toggle */}
        <div className="flex gap-2 bg-gray-800 rounded-md p-1">
          <button
            className={`w-1/2 py-1 rounded-md ${
              positionType === "Long" ? "bg-green-500 text-black" : "text-white"
            }`}
            onClick={() => setPositionType("Long")}
          >
            Long
          </button>
          <button
            className={`w-1/2 py-1 rounded-md ${
              positionType === "Short" ? "bg-red-500 text-white" : "text-white"
            }`}
            onClick={() => setPositionType("Short")}
          >
            Short
          </button>
        </div>

        {/* Position Rows */}
        <div className="space-y-2">
          {positions.map((pos, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-800 p-2 rounded-md"
            >
              <input
                type="number"
                placeholder="Entry Price (USDT)"
                value={pos.entryPrice}
                onChange={(e) =>
                  updatePosition(index, "entryPrice", e.target.value)
                }
                className="w-1/2 text-right bg-transparent outline-none"
              />
              <input
                type="number"
                placeholder="Quantity (BTC)"
                value={pos.quantity}
                onChange={(e) =>
                  updatePosition(index, "quantity", e.target.value)
                }
                className="w-1/2 text-right bg-transparent outline-none"
              />
              {positions.length > 1 && (
                <button onClick={() => removePosition(index)}>
                  <Trash2 size={16} className="text-gray-400" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Position Button */}
        <button
          onClick={addPosition}
          className="flex items-center text-yellow-400 text-sm mt-1"
        >
          <Plus size={16} className="mr-1" />
          Add Position
        </button>

        {/* Calculate Button */}
        <button
          onClick={calculateAvgPrice}
          className="w-full mt-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 rounded-md"
        >
          Calculate
        </button>

        {/* Info Note */}
        <div className="text-xs text-gray-500 mt-2">
          * See what the potential risk and reward will be in monetary terms.
        </div>
      </div>

      {/* Right - Results */}
      <div className="w-1/2 bg-gray-800 p-4 rounded-md">
        <h3 className="text-md font-semibold mb-4">Results</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex justify-between border-b border-gray-600 pb-1">
            <span>Avg Price</span>
            <span>{avgPrice} USDT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenPriceCalculator;
