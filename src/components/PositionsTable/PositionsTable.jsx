// Changes by @Man-Finsocial

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { getPendingLimitOrders } from "../../hooks/UserFunctions/LimitOrder/getPendingLimitOrders";
import { getPendingStopLimitOrders } from "../../hooks/UserFunctions/StopLimit/getPendingStopLimitOrders";
const PositionsTable = () => {
  const [placedOrders, setPlacedOrders] = useState([]);
  const [openPositions, setOpenPositions] = useState([]);
  const [closedPositions, setClosedPositions] = useState([]);

  const [loadingPlaced, setLoadingPlaced] = useState(true);
  const [loadingOpen, setLoadingOpen] = useState(true);
  const [loadingClosed, setLoadingClosed] = useState(true);

  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("placed");

  const { user } = useSelector((state) => state.user);

  // Token address mapping
  const tokenAddressToName = {
    // Add your actual token addresses here - these are examples
    "0x7362c1e29584834d501353E684718e47329FCC53": "USDT",
    "0xAbd4293F3440A1EEFBbF2838B87C41F0620011E1": "ETH",
    "0xF56038e8AC0d882d7F24dd32411a10BA1a037614": "BTC",
    "0x897904bA20478Fb2fB7cF8DA0c8a13dab1a6b23D": "SOL",
    "0x1Ca98845bc078f58576D623A68b0EB96A228C722": "BNB",
    "0x6EEAD95C1195E1120b9D0dA6b3e78b127B355884": "FIN",
    // ... add more token mappings as needed
  };

  // Helper function to get token name from address
  const getTokenName = (address) => {
    if (!address) return "UNKNOWN";
    return tokenAddressToName[address] || address.slice(0, 6) + "...";
  };

  // Memoize fetch functions with useCallback
  const fetchPlacedOrders = useCallback(async () => {
    if (!user || !user.address) {
      setLoadingPlaced(false);
      return;
    }

    try {
      setLoadingPlaced(true);
      setError(null);

      // Fetch both types of orders
      const [limitOrders, stopLimitOrders] = await Promise.all([
        getPendingLimitOrders(user.address),
        getPendingStopLimitOrders(user.address)
      ]);

      // Format limit orders
      const formattedLimitOrders = limitOrders.map((order) => ({
        ...order,
        status: "placed",
        type: order.positionType === 0 ? "Long" : "Short",
        pair: `${getTokenName(order.baseToken)}/${getTokenName(order.quoteToken)}`,
        orderType: 'limit'
      }));

      // Format stop limit orders
      const formattedStopLimitOrders = stopLimitOrders.map((order) => ({
        ...order,
        status: "placed",
        type: order.positionType === 0 ? "Long" : "Short",
        pair: `${getTokenName(order.baseToken)}/${getTokenName(order.quoteToken)}`,
        orderType: 'stop-limit'
      }));

      // Combine both types of orders
      setPlacedOrders([...formattedLimitOrders, ...formattedStopLimitOrders]);
      setLoadingPlaced(false);
    } catch (err) {
      console.error("Error fetching placed orders:", err);
      setError(`Failed to load placed orders: ${err.message}`);
      setLoadingPlaced(false);
    }
  }, [user]);

  const fetchOpenPositions = useCallback(async () => {
    if (!user || !user.address) {
      setLoadingOpen(false);
      return;
    }

    try {
      setLoadingOpen(true);
      setError(null);

      // In a real app, you would fetch open positions from your contract
      // For example: const openPositions = await getOpenPositions(user.address);

      // For now, we'll use mock data
      const mockOpenPositions = [
        {
          id: 1001,
          status: "open",
          type: "Long",
          pair: "ETH/USDT",
          price: "2950.50",
          size: "0.5",
          margin: "500",
          leverage: "3",
          pnl: "+125.75",
          timestamp: new Date().toLocaleString(),
        },
        {
          id: 1002,
          status: "open",
          type: "Short",
          pair: "BTC/USDT",
          price: "42100.25",
          size: "0.05",
          margin: "800",
          leverage: "5",
          pnl: "-45.20",
          timestamp: new Date(Date.now() - 3600000).toLocaleString(),
        },
      ];

      setOpenPositions(mockOpenPositions);
      setLoadingOpen(false);
    } catch (err) {
      console.error("Error fetching open positions:", err);
      setError(`Failed to load open positions: ${err.message}`);
      setLoadingOpen(false);
    }
  }, [user]);

  const fetchClosedPositions = useCallback(async () => {
    if (!user || !user.address) {
      setLoadingClosed(false);
      return;
    }

    try {
      setLoadingClosed(true);
      setError(null);

      // In a real app, you would fetch closed positions from your contract
      // For example: const closedPositions = await getClosedPositions(user.address);

      // For now, we'll use mock data
      const mockClosedPositions = [
        {
          id: 999,
          status: "closed",
          type: "Long",
          pair: "SOL/USDT",
          price: "135.25",
          size: "5",
          margin: "300",
          leverage: "2",
          pnl: "+78.50",
          closedAt: "42150.75",
          timestamp: new Date(Date.now() - 86400000).toLocaleString(),
        },
        {
          id: 998,
          status: "closed",
          type: "Short",
          pair: "LINK/USDT",
          price: "17.80",
          size: "25",
          margin: "200",
          leverage: "4",
          pnl: "-32.40",
          closedAt: "17.92",
          timestamp: new Date(Date.now() - 172800000).toLocaleString(),
        },
      ];

      setClosedPositions(mockClosedPositions);
      setLoadingClosed(false);
    } catch (err) {
      console.error("Error fetching closed positions:", err);
      setError(`Failed to load closed positions: ${err.message}`);
      setLoadingClosed(false);
    }
  }, [user]);

  // Fetch all position types when component mounts
  useEffect(() => {
    if (user && user.address) {
      fetchPlacedOrders();
      fetchOpenPositions();
      fetchClosedPositions();
    } else {
      setLoadingPlaced(false);
      setLoadingOpen(false);
      setLoadingClosed(false);
    }
  }, [user, fetchPlacedOrders, fetchOpenPositions, fetchClosedPositions]);

  // Function to get PNL color
  const getPnlColor = (pnl) => {
    if (!pnl) return "text-gray-400";
    return pnl.startsWith("+") ? "text-green-400" : "text-red-400";
  };

  // Tabs for different position types
  const tabs = [
    { id: "placed", label: "Placed Orders", count: placedOrders.length },
    { id: "open", label: "Open Positions", count: openPositions.length },
    { id: "closed", label: "Closed Positions", count: closedPositions.length },
  ];

  // Get the current positions based on active tab
  const getCurrentPositions = () => {
    switch (activeTab) {
      case "placed":
        return placedOrders;
      case "open":
        return openPositions;
      case "closed":
        return closedPositions;
      default:
        return [];
    }
  };

  // Check if currently loading
  const isLoading = () => {
    if (activeTab === "placed") return loadingPlaced;
    if (activeTab === "open") return loadingOpen;
    if (activeTab === "closed") return loadingClosed;
    return false;
  };

  // Function to fetch data for the current tab
  const fetchCurrentTabData = () => {
    if (activeTab === "placed") fetchPlacedOrders();
    if (activeTab === "open") fetchOpenPositions();
    if (activeTab === "closed") fetchClosedPositions();
  };

  if (!user) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Your Positions</h3>
        <p className="text-gray-400">Connect wallet to view positions</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Your Positions</h3>
        <button
          onClick={fetchCurrentTabData}
          disabled={isLoading()}
          className={`px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white ${
            isLoading() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading()
            ? "Loading..."
            : `Refresh ${tabs.find((tab) => tab.id === activeTab)?.label}`}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`py-2 px-4 relative ${
              activeTab === tab.id
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => {
              setActiveTab(tab.id);
              // Load data if not already loaded
              if (
                tab.id === "open" &&
                openPositions.length === 0 &&
                !loadingOpen
              ) {
                fetchOpenPositions();
              } else if (
                tab.id === "closed" &&
                closedPositions.length === 0 &&
                !loadingClosed
              ) {
                fetchClosedPositions();
              }
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 bg-gray-700 text-xs px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-400 p-2 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading() ? (
        <p className="text-gray-400">Loading {activeTab} positions...</p>
      ) : getCurrentPositions().length === 0 ? (
        <p className="text-gray-400">No {activeTab} positions found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-700">
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Pair</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Margin</th>
                <th className="text-right py-2">Leverage</th>
                <th className="text-right py-2">PNL</th>
                {activeTab === "closed" && (
                  <th className="text-right py-2">Closed At</th>
                )}
                <th className="text-right py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentPositions().map((position, index) => (
                <tr
                  key={position.id || position.orderId || index}
                  className="border-b border-gray-700 hover:bg-gray-700/30"
                >
                  <td className="py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        position.type === "Long"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-red-900/30 text-red-400"
                      }`}
                    >
                      {position.type}
                    </span>
                  </td>
                  <td className="py-2">{position.pair}</td>
                  <td className="text-right py-2">
                    ${position.price || position.limitPrice || "0.00"}
                  </td>
                  <td className="text-right py-2">${position.margin}</td>
                  <td className="text-right py-2">{position.leverage}x</td>
                  <td
                    className={`text-right py-2 ${getPnlColor(position.pnl)}`}
                  >
                    {position.pnl || "-"}
                  </td>
                  {activeTab === "closed" && (
                    <td className="text-right py-2">
                      ${position.closedAt || "-"}
                    </td>
                  )}
                  <td className="text-right py-2 text-xs">
                    {position.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PositionsTable;