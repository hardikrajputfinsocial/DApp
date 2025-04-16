import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 p-2 rounded shadow-lg">
        <p className="text-white font-medium">{`$${Number(
          payload[0].value
        ).toFixed(2)}`}</p>
        <p className="text-xs text-gray-400">
          {new Date(label).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const LivePriceChart = ({
  initialData = [],
  strikePrice,
  refreshInterval = 5000,
  lineColor = "#10B981",
}) => {
  const [data, setData] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [displayRange, setDisplayRange] = useState(20); // Number of data points to show

  // Set initial data when props change
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setData(initialData);
    }
  }, [initialData]);

  // Simulate real-time data updates
  useEffect(() => {
    if (!isLive || data.length === 0) return;

    const interval = setInterval(() => {
      setData((prevData) => {
        if (prevData.length === 0) return prevData;

        try {
          // Generate new data point based on the last point
          const lastPoint = prevData[prevData.length - 1];
          const lastPrice = lastPoint.price;

          // Random price movement with slight volatility (5% max change)
          const change = (Math.random() - 0.5) * 0.05 * lastPrice;
          const newPrice = Math.max(0.1, lastPrice + change);

          const newPoint = {
            timestamp: Date.now(),
            price: newPrice,
          };

          return [...prevData, newPoint].slice(-displayRange);
        } catch (error) {
          console.error("Error updating chart data:", error);
          return prevData;
        }
      });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isLive, refreshInterval, displayRange, data]);

  // Calculate price range for Y-axis
  const prices = data.map((item) => item.price);
  const minPrice = data.length ? Math.min(...prices) * 0.99 : 0;
  const maxPrice = data.length ? Math.max(...prices) * 1.01 : 100;

  return (
    <div className="bg-gray-800 rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-white font-medium">Live Price Chart</div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <span className="text-xs text-gray-400 mr-2">Data points:</span>
            <select
              value={displayRange}
              onChange={(e) => setDisplayRange(Number(e.target.value))}
              className="bg-gray-700 text-white text-xs rounded px-2 py-1"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <button
            className={`px-3 py-1 text-xs rounded ${
              isLive
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? "Live" : "Paused"}
          </button>
        </div>
      </div>

      <div className="h-64">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(tick) => {
                  try {
                    const date = new Date(tick);
                    return date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    });
                  } catch (error) {
                    console.error("Error formatting date:", error);
                    return "";
                  }
                }}
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                tickFormatter={(tick) => `$${tick.toFixed(2)}`}
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke={lineColor}
                dot={false}
                strokeWidth={2}
                isAnimationActive={!isLive}
              />
              {strikePrice && (
                <ReferenceLine
                  y={strikePrice}
                  stroke="#EF4444"
                  strokeDasharray="3 3"
                  label={{
                    value: `Strike: $${strikePrice}`,
                    fill: "#EF4444",
                    fontSize: 10,
                    position: "right",
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">No data available</p>
          </div>
        )}
      </div>

      {isLive && data.length > 0 && (
        <div className="flex justify-end mt-2">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            <span className="text-xs text-gray-400">
              Updating every {refreshInterval / 1000}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivePriceChart;
