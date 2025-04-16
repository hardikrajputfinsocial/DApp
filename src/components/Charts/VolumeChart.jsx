import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const VolumeChart = ({ data }) => {
  return (
    <div className="h-full">
      <div className="text-gray-400 text-sm mb-2">Volume</div>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <XAxis
            dataKey="time"
            tick={{ fill: "#9ca3af" }}
            axisLine={{ stroke: "#4b5563" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#9ca3af" }}
            axisLine={{ stroke: "#4b5563" }}
            tickLine={false}
            tickFormatter={(value) => value.toFixed(0)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              color: "#f9fafb",
            }}
            formatter={(value) => [value, "Volume"]}
          />
          <Bar dataKey="volume" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VolumeChart;
