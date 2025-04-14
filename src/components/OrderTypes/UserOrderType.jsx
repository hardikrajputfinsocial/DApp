import React, { useState } from "react";
import Header from "./Header";
import Limit from "./OrderTypes/Limit"; // Assuming it's in OrderTypes folder
// import Market from "./OrderTypes/Market"; // example other types

const UserOrderType = () => {
  const [orderType, setOrderType] = useState("Limit");
  const [marginMode, setMarginMode] = useState("Cross");
  const [selectedLeverage, setSelectedLeverage] = useState(20);

  const renderOrderComponent = () => {
    switch (orderType) {
      case "Limit":
        return (
          <Limit
            leverage={selectedLeverage}
            marginMode={marginMode}
          />
        );
      // case "Market":
      //   return <Market leverage={selectedLeverage} marginMode={marginMode} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header handles leverage + margin */}
      <Header
        leverage={selectedLeverage}
        setLeverage={setSelectedLeverage}
        marginMode={marginMode}
        setMarginMode={setMarginMode}
      />

      {/* Order Type Selection */}
      <div className="flex space-x-2">
        {["Limit", "Market"].map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`px-4 py-2 rounded ${
              orderType === type ? "bg-yellow-600 text-black" : "bg-gray-700 text-white"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Render Order Type UI */}
      {renderOrderComponent()}
    </div>
  );
};

export default UserOrderType;
