import React, { useState, useEffect } from "react";
import PriceChart from "../components/Charts/PriceChart";
import VolumeChart from "../components/Charts/VolumeChart";
import MarketInfo from "../components/Charts/MarketInfo";
import LivePriceChart from "../components/Charts/LivePriceChart";

const ChartDemo = () => {
  // Sample data for demonstration
  const [priceData, setPriceData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [marketStats, setMarketStats] = useState({
    currentPrice: 2850.75,
    openPrice: 2800.25,
    volume: 4250000,
    openInterest: 1800000,
  });
  const [strikePrice, setStrikePrice] = useState(2900);

  // Generate sample historical data on component mount
  useEffect(() => {
    // Generate sample price data
    const generatePriceData = () => {
      const data = [];
      const now = new Date();
      let price = 2800;

      // Generate 48 hours of hourly data
      for (let i = 0; i < 48; i++) {
        const timestamp = new Date(now);
        timestamp.setHours(now.getHours() - (48 - i));

        // Add some random price movement
        price = price + (Math.random() - 0.45) * 30;

        data.push({
          timestamp: timestamp.getTime(),
          price,
        });
      }

      setPriceData(data);

      // Set the last 20 points as initial data for the live chart
      setLiveInitialData(data.slice(-20));
    };

    // Generate sample volume data
    const generateVolumeData = () => {
      const data = [];
      const now = new Date();

      for (let i = 0; i < 24; i++) {
        const time = new Date(now);
        time.setHours(now.getHours() - (24 - i));

        data.push({
          time: time.toLocaleTimeString([], { hour: "2-digit" }),
          volume: Math.floor(Math.random() * 500000) + 100000,
        });
      }

      setVolumeData(data);
    };

    generatePriceData();
    generateVolumeData();
  }, []);

  // For live chart
  const [liveInitialData, setLiveInitialData] = useState([]);

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Future Markets Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <MarketInfo
              currentPrice={marketStats.currentPrice}
              openPrice={marketStats.openPrice}
              volume={marketStats.volume}
              openInterest={marketStats.openInterest}
            />
          </div>
          <div>
            <div className="bg-gray-800 rounded-md p-4">
              <div className="text-gray-400 text-sm mb-2">Strike Price</div>
              <div className="flex items-center">
                <input
                  type="range"
                  min="2500"
                  max="3200"
                  step="50"
                  value={strikePrice}
                  onChange={(e) => setStrikePrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-3 text-white font-medium">
                  ${strikePrice}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <PriceChart data={priceData} strikePrice={strikePrice} />
          </div>
          <div>
            <LivePriceChart
              initialData={liveInitialData}
              strikePrice={strikePrice}
              refreshInterval={3000}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-gray-800 rounded-md p-4 h-64">
            <VolumeChart data={volumeData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartDemo;
