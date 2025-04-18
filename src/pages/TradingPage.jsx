import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import OrderType from "../components/OrderTypes/OrderType";
import SpotLimitOrder from "../components/OrderTypes/SpotLimitOrder";
import ConnectWallet from "../components/wallet/ConnectWallet";
import UserFunctionsPanel from "../components/UserFunctions/UserFunctionsPanel";
import AdminFunctionsPanel from "../components/AdminFunctionsPanel";
import TradingViewChart from "../components/Charts/TradingViewChart";
import PositionsTable from "../components/PositionsTable";

const TradingPage = () => {
  const [activeTab, setActiveTab] = useState("futures");
  const [tradingType, setTradingType] = useState("futures"); // futures, spot, margin
  const { user } = useSelector((state) => state.user);
  const [selectedPair, setSelectedPair] = useState("ETH/USD");
  const [marketStats, setMarketStats] = useState({
    volume: "12.4M",
    openInterest: "24.7M",
    change: "+2.45%",
    isPositive: true,
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Token pairs data with proper TradingView symbols
  const tokenPairs = [
    {
      id: "ETH/USD",
      tvSymbol: "BINANCE:ETHUSDT",
      color: "#10B981",
      basePrice: 2800,
    },
    {
      id: "BTC/USD",
      tvSymbol: "BINANCE:BTCUSDT",
      color: "#F59E0B",
      basePrice: 42000,
    },
    {
      id: "SOL/USD",
      tvSymbol: "BINANCE:SOLUSDT",
      color: "#8B5CF6",
      basePrice: 135,
    },
    {
      id: "AVAX/USD",
      tvSymbol: "BINANCE:AVAXUSDT",
      color: "#EF4444",
      basePrice: 32,
    },
    {
      id: "LINK/USD",
      tvSymbol: "BINANCE:LINKUSDT",
      color: "#3B82F6",
      basePrice: 18,
    },
  ];

  // Get the current token pair details
  const getCurrentTokenPair = () => {
    return tokenPairs.find((pair) => pair.id === selectedPair) || tokenPairs[0];
  };

  // Update market stats when token pair changes
  useEffect(() => {
    const currentPair = getCurrentTokenPair();

    // In a real app, you would fetch real market data here
    // This is just mock data
    const mockChange = (Math.random() * 10 - 5).toFixed(2);
    const isPositive = parseFloat(mockChange) >= 0;

    setMarketStats({
      volume:
        currentPair.id === "BTC/USD"
          ? "28.7M"
          : currentPair.id === "ETH/USD"
          ? "12.4M"
          : currentPair.id === "SOL/USD"
          ? "8.3M"
          : "4.2M",
      openInterest:
        currentPair.id === "BTC/USD"
          ? "56.2M"
          : currentPair.id === "ETH/USD"
          ? "24.7M"
          : currentPair.id === "SOL/USD"
          ? "14.5M"
          : "7.1M",
      change: `${isPositive ? "+" : ""}${mockChange}%`,
      isPositive,
    });
  }, [selectedPair]);

  // Check if user is admin
  const isAdmin = user && user.role === "admin";

  // Get the current token's TradingView symbol
  const getCurrentTradingViewSymbol = () => {
    const currentPair = getCurrentTokenPair();
    return currentPair.tvSymbol;
  };

  // Handle trading type changes
  const handleTradingTypeChange = (type) => {
    setTradingType(type);
  };

  // Render the appropriate order type component based on trading type
  const renderOrderType = () => {
    switch (tradingType) {
      case "spot":
        return <SpotLimitOrder />;
      case "margin":
        return <div>Margin Trading Coming Soon</div>;
      default:
        return <OrderType />;
    }
  };

  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-6">Trading Dashboard</h1>

      {/* Trading Type Navigation */}
      <div className="flex mb-6 border-b border-gray-700">
        <button
          className={`py-2 px-4 ${
            tradingType === "futures"
              ? "text-yellow-400 border-b-2 border-yellow-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => handleTradingTypeChange("futures")}
        >
          Futures
        </button>
        <button
          className={`py-2 px-4 ${
            tradingType === "spot"
              ? "text-yellow-400 border-b-2 border-yellow-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => handleTradingTypeChange("spot")}
        >
          Spot
        </button>
        <button
          className={`py-2 px-4 ${
            tradingType === "margin"
              ? "text-yellow-400 border-b-2 border-yellow-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => handleTradingTypeChange("margin")}
        >
          Margin
        </button>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex mb-6 border-b border-gray-700">
        <button
          className={`py-2 px-4 ${
            activeTab === "futures"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("futures")}
        >
          Futures Trading
        </button>
        <button
          className={`py-2 px-4 ${
            activeTab === "history"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("history")}
        >
          Trading History
        </button>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Order Entry */}
        <div className="space-y-4">
          {renderOrderType()}
          <UserFunctionsPanel />
          <div className="mt-4">
            <ConnectWallet />
          </div>
          {isAdmin && (
            <div className="mt-4">
              <AdminFunctionsPanel />
            </div>
          )}
        </div>

        {/* Middle Column - Charts */}
        <div className="md:col-span-2">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <h3 className="text-lg font-medium mr-4">Live Price Chart</h3>
                <select
                  value={selectedPair}
                  onChange={(e) => setSelectedPair(e.target.value)}
                  className="bg-gray-700 text-white px-2 py-1 rounded"
                >
                  {tokenPairs.map((pair) => (
                    <option key={pair.id} value={pair.id}>
                      {pair.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <span className="text-sm mr-2">
                  {selectedPair.split("/")[0]}
                </span>
                <div
                  className={`px-2 py-1 rounded text-sm ${
                    marketStats.isPositive
                      ? "bg-green-900/30 text-green-400"
                      : "bg-red-900/30 text-red-400"
                  }`}
                >
                  {marketStats.change}
                </div>
              </div>
            </div>

            {/* TradingView Chart */}
            <TradingViewChart
              symbol={getCurrentTradingViewSymbol()}
              height={400}
            />
          </div>

          {/* Market Information */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400">24h Volume</p>
              <p className="text-xl font-bold">${marketStats.volume}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400">Open Interest</p>
              <p className="text-xl font-bold">${marketStats.openInterest}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400">24h Change</p>
              <p
                className={`text-xl font-bold ${
                  marketStats.isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {marketStats.change}
              </p>
            </div>
          </div>

          {/* Positions Table */}
          <div className="mt-6">
            <PositionsTable />
          </div>

          {/* Order Book / Recent Trades */}
          <div className="mt-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">
                {activeTab === "futures" ? "Order Book" : "Trading History"}
              </h3>

              {activeTab === "futures" ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 text-gray-400 text-sm">
                    <span>Price</span>
                    <span>Amount</span>
                    <span>Total</span>
                  </div>
                  <div className="h-40 overflow-y-auto space-y-1">
                    {/* Sample order book entries - now based on selected pair */}
                    {getCurrentTokenPair().basePrice > 1000 ? (
                      <>
                        <div className="grid grid-cols-3 text-red-400">
                          <span>
                            $
                            {(getCurrentTokenPair().basePrice * 1.01).toFixed(
                              2
                            )}
                          </span>
                          <span>0.75</span>
                          <span>
                            $
                            {(
                              getCurrentTokenPair().basePrice *
                              1.01 *
                              0.75
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 text-green-400">
                          <span>
                            $
                            {(getCurrentTokenPair().basePrice * 0.99).toFixed(
                              2
                            )}
                          </span>
                          <span>1.25</span>
                          <span>
                            $
                            {(
                              getCurrentTokenPair().basePrice *
                              0.99 *
                              1.25
                            ).toFixed(2)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 text-red-400">
                          <span>
                            $
                            {(getCurrentTokenPair().basePrice * 1.01).toFixed(
                              2
                            )}
                          </span>
                          <span>12.5</span>
                          <span>
                            $
                            {(
                              getCurrentTokenPair().basePrice *
                              1.01 *
                              12.5
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 text-green-400">
                          <span>
                            $
                            {(getCurrentTokenPair().basePrice * 0.99).toFixed(
                              2
                            )}
                          </span>
                          <span>8.75</span>
                          <span>
                            $
                            {(
                              getCurrentTokenPair().basePrice *
                              0.99 *
                              8.75
                            ).toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 text-gray-400 text-sm">
                    <span>Time</span>
                    <span>Type</span>
                    <span>Price</span>
                    <span>Amount</span>
                  </div>
                  <div className="h-40 overflow-y-auto space-y-1">
                    {/* Sample history entries */}
                    <div className="grid grid-cols-4">
                      <span>14:32:21</span>
                      <span className="text-green-400">Buy</span>
                      <span>
                        ${(getCurrentTokenPair().basePrice * 1.005).toFixed(2)}
                      </span>
                      <span>
                        {getCurrentTokenPair().basePrice > 1000 ? "0.5" : "5.0"}
                      </span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span>14:30:05</span>
                      <span className="text-red-400">Sell</span>
                      <span>
                        ${(getCurrentTokenPair().basePrice * 0.995).toFixed(2)}
                      </span>
                      <span>
                        {getCurrentTokenPair().basePrice > 1000
                          ? "0.75"
                          : "7.5"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPage;
