import React, { useState } from "react";
import Limit from "./Limit";
import MarketOrder from "./MarketOrder";
import StopLimitOrder from "./StopLimitOrder";
import StopMarket from "./StopMarket";
import TrailingStop from "./TrailingStop";
import PostOnly from "./PostOnly";
import TWAP from "./TWAP";
import ScaledOrder from "./ScaledOrder";
import ConditionalOrder from "./ConditionalOrder";

const OrderType = () => {
  const [selectedOrder, setSelectedOrder] = useState("Limit");
  const [showAdvancedDropdown, setShowAdvancedDropdown] = useState(false);

  const basicOrders = ["Limit", "Market"];
  const advancedOrders = [
    "Stop Limit",
    "Stop Market",
    "Trailing Stop",
    "Conditional",
    "Post Only",
    "TWAP",
    "Scaled Order",
  ];

  const renderOrderComponent = () => {
    switch (selectedOrder) {
      case "Limit":
        return <Limit />;
      case "Market":
        return <MarketOrder />;
      case "Stop Limit":
        return <div className="text-white p-4"><StopLimitOrder /></div>;
      case "Stop Market":
        return <div className="text-white p-4"><StopMarket /></div>;
      case "Trailing Stop":
        return <div className="text-white p-4"><TrailingStop /></div>;
      case "Conditional":
        return <div className="text-white p-4"><ConditionalOrder /></div>;
      case "Post Only":
        return <div className="text-white p-4"><PostOnly /></div>;
      case "TWAP":
        return <div className="text-white p-4"><TWAP /></div>;
      case "Scaled Order":
        return <div className="text-white p-4"><ScaledOrder /></div>;
      default:
        return <Limit />;
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl w-96 text-white space-y-4">
      {/* Tabs + Dropdown */}
      <div className="flex space-x-4 text-gray-400 border-b border-gray-700 pb-2 relative">
        {/* Basic Order Tabs */}
        {basicOrders.map((orderType) => (
          <button
            key={orderType}
            onClick={() => {
              setSelectedOrder(orderType);
              setShowAdvancedDropdown(false);
            }}
            className={`px-2 py-1 text-sm ${
              selectedOrder === orderType ? "text-yellow-400 border-b-2 border-yellow-400" : ""
            }`}
          >
            {orderType}
          </button>
        ))}

        {/* Advanced Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowAdvancedDropdown(!showAdvancedDropdown)}
            className={`px-2 py-1 text-sm flex items-center ${
              advancedOrders.includes(selectedOrder)
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : ""
            }`}
          >
            {selectedOrder && advancedOrders.includes(selectedOrder)
              ? selectedOrder
              : "Stop Limit"}{" "}
            <span className="ml-1">▾</span>
          </button>

          {/* Dropdown Menu */}
          {showAdvancedDropdown && (
            <div className="absolute left-0 mt-2 bg-gray-800 border border-gray-700 rounded shadow-lg z-10 w-44">
              {advancedOrders.map((orderType) => (
                <div
                  key={orderType}
                  onClick={() => {
                    setSelectedOrder(orderType);
                    setShowAdvancedDropdown(false);
                  }}
                  className={`px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer ${
                    selectedOrder === orderType ? "text-yellow-400" : "text-white"
                  }`}
                >
                  {orderType}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Render the selected order component */}
      {renderOrderComponent()}
    </div>
  );
};

export default OrderType;
