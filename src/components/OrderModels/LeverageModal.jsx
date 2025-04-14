import React, { useState } from "react";

const LeverageModal = ({ show, onClose, onConfirm, currentLeverage }) => {
  const [leverage, setLeverage] = useState(currentLeverage || 20);

  if (!show) return null;

  const leverageOptions = [1, 10, 20, 30, 40, 50];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-96 text-white relative">
        <button
          className="absolute top-2 right-3 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Adjust Leverage</h2>

        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setLeverage((prev) => Math.max(1, prev - 1))}
            className="bg-gray-700 px-3 py-1 rounded"
          >
            -
          </button>
          <span className="text-xl font-bold">{leverage}x</span>
          <button
            onClick={() => setLeverage((prev) => Math.min(50, prev + 1))}
            className="bg-gray-700 px-3 py-1 rounded"
          >
            +
          </button>
        </div>

        <div className="flex justify-between items-center space-x-2 mb-4">
          {leverageOptions.map((option) => (
            <button
              key={option}
              onClick={() => setLeverage(option)}
              className={`flex-1 py-1 rounded ${
                leverage === option
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {option}x
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-400 mb-2">
          * Maximum position at current leverage: 10 BTC
        </p>
        <p className="text-xs text-red-400 mb-4">
          * Selecting higher leverage such as 10x increases your liquidation
          risk. Always manage your risk levels. See our{" "}
          <a href="#" className="underline text-blue-400">
            help article
          </a>{" "}
          for more info.
        </p>

        <div className="flex justify-between text-sm text-blue-400 mb-4">
          <a href="#" className="hover:underline">
            Check on Leverage & Margin table
          </a>
          <a href="#" className="hover:underline">
            Position Limit Enlarge
          </a>
        </div>

        <button
          onClick={() => {
            onConfirm(leverage);
            onClose();
          }}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 rounded"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default LeverageModal;
