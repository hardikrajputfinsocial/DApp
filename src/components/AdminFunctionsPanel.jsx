import { useState } from "react";
import { useContract } from "../hooks/UserFunctions/FutureLongShort/useContract";
import executeAdminFunction from "../hooks/UserFunctions/FutureLongShort/executeAdminFunction";

const AdminFunctionsPanel = () => {
  const { contract, isReady } = useContract();
  const [newThreshold, setNewThreshold] = useState(0);
  const [newMaxLeverage, setNewMaxLeverage] = useState(0);
  const [baseToken, setBaseToken] = useState("");
  const [quoteToken, setQuoteToken] = useState("");
  const [newFeeRate, setNewFeeRate] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isReady) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg text-white">
        <p className="text-center">Loading admin functions...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Admin Functions</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white"
        >
          {isExpanded ? "▲ Hide" : "▼ Show"}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm text-gray-400">
              Liquidation Threshold
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="New Threshold"
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                className="bg-gray-700 p-2 rounded flex-grow"
              />
              <button
                onClick={() =>
                  executeAdminFunction(contract, "setLiquidationThreshold", [
                    newThreshold,
                  ])
                }
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded"
              >
                Update
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-400">Max Leverage</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="New Max Leverage"
                value={newMaxLeverage}
                onChange={(e) => setNewMaxLeverage(e.target.value)}
                className="bg-gray-700 p-2 rounded flex-grow"
              />
              <button
                onClick={() =>
                  executeAdminFunction(contract, "setMaxLeverage", [
                    newMaxLeverage,
                  ])
                }
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded"
              >
                Update
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-400">Trading Pair</label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Base Token Address"
                value={baseToken}
                onChange={(e) => setBaseToken(e.target.value)}
                className="bg-gray-700 p-2 rounded w-full"
              />
              <input
                type="text"
                placeholder="Quote Token Address"
                value={quoteToken}
                onChange={(e) => setQuoteToken(e.target.value)}
                className="bg-gray-700 p-2 rounded w-full"
              />
              <button
                onClick={() =>
                  executeFunction(contract, "removeSupportedPair", [
                    baseToken,
                    quoteToken,
                  ])
                }
                className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded w-full"
              >
                Remove Trading Pair
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-400">
              Platform Fee Rate
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="New Fee Rate"
                value={newFeeRate}
                onChange={(e) => setNewFeeRate(e.target.value)}
                className="bg-gray-700 p-2 rounded flex-grow"
              />
              <button
                onClick={() =>
                  executeAdminFunction(contract, "updatePlatformFeeRate", [
                    newFeeRate,
                  ])
                }
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFunctionsPanel;
