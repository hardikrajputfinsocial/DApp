import React, { useEffect, useState } from "react";

const MarginModeModal = ({
  tokenName,
  quantity,
  defaultMode = "cross",
  showModal,
  onClose,
  onConfirm,
}) => {
  const [selectedMode, setSelectedMode] = useState(defaultMode);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => setFadeIn(true), 10);
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 transition-opacity duration-300 ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="bg-[#1e1e1e] text-white rounded-xl p-6 w-[400px] shadow-lg transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Margin Mode</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            &times;
          </button>
        </div>

        {/* Token info */}
        <div className="text-sm text-gray-400 mb-2">
          {tokenName}
          <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded ml-2">
            Qty: {quantity || "1.0"}
          </span>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {["cross", "isolated"].map((mode) => (
            <button
              key={mode}
              className={`py-2 rounded border font-semibold transition-colors duration-200 ${
                selectedMode === mode
                  ? "border-yellow-500 bg-yellow-500 text-black"
                  : "border-gray-600 bg-[#2a2a2a] text-white"
              }`}
              onClick={() => setSelectedMode(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="text-xs text-gray-400 leading-relaxed space-y-2 mb-4">
          <p>
            * Switching the margin mode will only apply it to the selected
            contract.
          </p>
          <p>
            * <strong>Cross Margin Mode:</strong> Shares balance across
            positions. Liquidation may affect all positions using that asset.
          </p>
          <p>
            * <strong>Isolated Margin Mode:</strong> Limits margin per position.
            Liquidation only affects that isolated position.
          </p>
        </div>

        {/* Confirm Button */}
        <button
          onClick={() => {
            onConfirm(selectedMode);
            setFadeIn(false);
          }}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default MarginModeModal;
