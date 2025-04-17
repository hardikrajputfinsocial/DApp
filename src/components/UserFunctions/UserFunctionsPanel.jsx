import { useState } from "react";
import { useContract } from "../../hooks/UserFunctions/FutureLongShort/useContract";
import DepositForm from "../LongShort/DepositForm";
import WithdrawForm from "../LongShort/WithdrawForm";
import BalanceChecker from "../LongShort/BalanceChecker";
import PositionViewer from "../LongShort/PositionViewer";
import PriceChecker from "../LongShort/PriceChecker";
import PnLUpdater from "../LongShort/PnLUpdater";
import ClosePosition from "../LongShort/ClosePosition";

const UserFunctionsPanel = () => {
  const { isReady } = useContract();
  console.log("Ready",isReady);
  
  const [activeTab, setActiveTab] = useState("trade");

  if (!isReady) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg text-white">
        <p className="text-center">Loading contract functions...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white">
      <div className="border-b border-gray-700 mb-4">
        <div className="flex">
          <button
            className={`py-2 px-4 ${
              activeTab === "trade"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("trade")}
          >
            Trading
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === "position"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("position")}
          >
            Positions
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === "balance"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("balance")}
          >
            Balance
          </button>
        </div>
      </div>

      {activeTab === "trade" && (
        <div className="space-y-4">
          <PriceChecker />
          <ClosePosition />
        </div>
      )}

      {activeTab === "position" && (
        <div className="space-y-4">
          <PositionViewer />
          <PnLUpdater />
        </div>
      )}

      {activeTab === "balance" && (
        <div className="space-y-4">
          <BalanceChecker />
          <DepositForm />
          <WithdrawForm />
        </div>
      )}
    </div>
  );
};

export default UserFunctionsPanel;
