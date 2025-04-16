import React from "react";

const MarketStat = ({ label, value, change }) => {
  const changeColor =
    change === null
      ? "text-gray-400"
      : change >= 0
      ? "text-green-500"
      : "text-red-500";

  return (
    <div className="px-4 py-2">
      <div className="text-gray-400 text-xs">{label}</div>
      <div className="text-white font-medium">{value}</div>
      {change !== null && (
        <div className={`text-xs ${changeColor}`}>
          {change >= 0 ? "+" : ""}
          {change}%
        </div>
      )}
    </div>
  );
};

const MarketInfo = ({ currentPrice, openPrice, volume, openInterest }) => {
  // Calculate 24h change
  const priceChange = openPrice
    ? (((currentPrice - openPrice) / openPrice) * 100).toFixed(2)
    : 0;

  return (
    <div className="bg-gray-800 rounded-md p-2">
      <div className="text-gray-400 text-sm mb-2 px-2">Market Overview</div>
      <div className="flex flex-wrap justify-between border-t border-gray-700">
        <MarketStat
          label="Current Price"
          value={`$${currentPrice.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          change={priceChange}
        />
        <MarketStat
          label="24h Volume"
          value={`$${volume.toLocaleString("en-US", {
            maximumFractionDigits: 0,
          })}`}
          change={null}
        />
        <MarketStat
          label="Open Interest"
          value={`$${openInterest.toLocaleString("en-US", {
            maximumFractionDigits: 0,
          })}`}
          change={null}
        />
      </div>
    </div>
  );
};

export default MarketInfo;
