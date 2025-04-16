import React, { useState } from "react";
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

const PriceChart = ({ data, strikePrice }) => {
  const [timeFrame, setTimeFrame] = useState("1D");

  // Calculate price range for Y-axis
  const prices = data.map((item) => item.price);
  const minPrice = Math.min(...prices) * 0.99;
  const maxPrice = Math.max(...prices) * 1.01;

  const timeFrameOptions = ["1H", "1D", "1W", "1M", "ALL"];

  return (
    <div className="bg-gray-800 rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-white font-medium">Price Chart</div>
        <div className="flex space-x-2">
          {timeFrameOptions.map((option) => (
            <button
              key={option}
              className={`px-3 py-1 text-xs rounded ${
                timeFrame === option
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => setTimeFrame(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
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
                const date = new Date(tick);
                return date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              }}
              stroke="#9CA3AF"
              tick={{ fill: "#9CA3AF", fontSize: 10 }}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tickFormatter={(tick) => `$${tick.toFixed(0)}`}
              stroke="#9CA3AF"
              tick={{ fill: "#9CA3AF", fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3B82F6"
              dot={false}
              strokeWidth={2}
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
      </div>
    </div>
  );
};

export default PriceChart;
