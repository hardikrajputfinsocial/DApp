import React, { useState } from "react";
import executeAdminFunction from "../hooks/UserFunctions/FutureLongShort/executeAdminFunction";

const AdminFunctions = ({ contract }) => {
  const [newThreshold, setNewThreshold] = useState(0);
  const [newMaxLeverage, setNewMaxLeverage] = useState(0);
  const [newPercentage, setNewPercentage] = useState(0);
  const [baseToken, setBaseToken] = useState("");
  const [quoteToken, setQuoteToken] = useState("");
  const [newFeeRate, setNewFeeRate] = useState(0);

  return (
    <div className="admin-functions bg-blue-500">
      <h2>Admin Functions</h2>

      <div>
        <input
          type="number"
          placeholder="New Liquidation Threshold"
          value={newThreshold}
          onChange={(e) => setNewThreshold(e.target.value)}
        />
        <button
          onClick={() =>
            executeAdminFunction(contract, "setLiquidationThreshold", [
              newThreshold,
            ])
          }
        >
          Update Liquidation Threshold
        </button>
      </div>

      <div>
        <input
          type="number"
          placeholder="New Max Leverage"
          value={newMaxLeverage}
          onChange={(e) => setNewMaxLeverage(e.target.value)}
        />
        <button
          onClick={() =>
            executeAdminFunction(contract, "setMaxLeverage", [newMaxLeverage])
          }
        >
          Update Max Leverage
        </button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Base Token Address"
          value={baseToken}
          onChange={(e) => setBaseToken(e.target.value)}
        />
        <input
          type="text"
          placeholder="Quote Token Address"
          value={quoteToken}
          onChange={(e) => setQuoteToken(e.target.value)}
        />
        <button
          onClick={() =>
            executeAdminFunction(contract, "removeSupportedPair", [
              baseToken,
              quoteToken,
            ])
          }
        >
          Remove Trading Pair
        </button>
      </div>

      <div>
        <input
          type="number"
          placeholder="New Platform Fee Rate"
          value={newFeeRate}
          onChange={(e) => setNewFeeRate(e.target.value)}
        />
        <button
          onClick={() =>
            executeAdminFunction(contract, "updatePlatformFeeRate", [
              newFeeRate,
            ])
          }
        >
          Update Platform Fee Rate
        </button>
      </div>
    </div>
  );
};

export default AdminFunctions;
