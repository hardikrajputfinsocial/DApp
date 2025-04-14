import React from "react";

const SLTPToggle = ({
  isTPSLEnabled,
  setIsTPSLEnabled,
  takeProfit,
  setTakeProfit,
  stopLoss,
  setStopLoss,
}) => {
  return (
    <div className="space-y-2">
      {/* TP/SL Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isTPSLEnabled}
          onChange={() => setIsTPSLEnabled(!isTPSLEnabled)}
        />
        <span>TP/SL</span>
      </div>

      {isTPSLEnabled && (
        <div className="space-y-2">
          <div className="flex items-center bg-gray-800 p-2 rounded-md">
            <input
              className="bg-transparent text-white flex-1 outline-none"
              placeholder="Take Profit"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
            />
            <select className="bg-gray-700 text-white p-1 rounded">
              <option>Mark</option>
              <option>Last</option>
            </select>
          </div>
          <div className="flex items-center bg-gray-800 p-2 rounded-md">
            <input
              className="bg-transparent text-white flex-1 outline-none"
              placeholder="Stop Loss"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
            />
            <select className="bg-gray-700 text-white p-1 rounded">
              <option>Mark</option>
              <option>Last</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SLTPToggle;
