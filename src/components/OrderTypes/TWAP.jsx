import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import LSButtons from "../LSButtons/LSButtons";
import CalculatorContainer from "../Calcultors/CalculatorContainer";
import LeverageModal from "../OrderModels/LeverageModal";
import { placeTWAPOrder } from "../../hooks/UserFunctions/TWAP/placeTWAPOrder";
import { ethers } from "ethers";

const TWAP = () => {
  const [margin, setMargin] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [userBalance, setUserBalance] = useState("0");
  const [batchSize, setBatchSize] = useState(4); // Default batch size
  const [interval, setInterval] = useState(600); // Default interval in seconds (10 minutes)
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [closeStartTime, setCloseStartTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const { user } = useSelector((state) => state.user);

  // Fetch user balance when component mounts
  useEffect(() => {
    fetchUserBalance();
  }, []);

  // Fetch user balance
  const fetchUserBalance = async () => {
    try {
      if (!window.ethereum) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      // For demo purposes, we're using a mock balance
      // In a real app, you would fetch this from a contract
      const balance = await provider.getBalance(userAddress);
      const formattedBalance = ethers.formatEther(balance);
      setUserBalance(formattedBalance);
    } catch (error) {
      console.error("Error fetching user balance:", error);
    }
  };

  // Update the percentage slider and margin calculation
  const handlePercentageChange = useCallback((newPercentage) => {
    setPercentage(newPercentage);
    const calculatedMargin = (parseFloat(userBalance) * newPercentage) / 100;
    setMargin(calculatedMargin.toFixed(2));
  }, [userBalance]);

  // Calculate closeStartTime whenever hours or minutes change
  useEffect(() => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const additionalSeconds = (hours * 3600) + (minutes * 60);
    const minimumCloseStart = currentTimestamp + (batchSize * interval);
    const newCloseStartTime = currentTimestamp + additionalSeconds;
    
    // Ensure closeStartTime is valid
    if (additionalSeconds > 0 && newCloseStartTime > minimumCloseStart) {
      setCloseStartTime(newCloseStartTime);
      setError("");
    } else if (additionalSeconds > 0) {
      setError(`Close start time must be at least ${batchSize * interval} seconds after now`);
    }
  }, [hours, minutes, batchSize, interval]);

  const setQuickTime = (h) => {
    setHours(h);
    setMinutes(0);
  };

  const [selectedToken, setSelectedToken] = useState("USDT");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);

  const [leverage, setLeverage] = useState(20); // ✅ leverage state
  const [showLeverageModal, setShowLeverageModal] = useState(false); // ✅ modal toggle
  const [showCalculator, setShowCalculator] = useState(false);

  const tokenPairs = ["USDT", "BTC", "ETH", "BNB"]; // fetch these dynamically , this is for test purpose

  return (
    <div className="bg-gray-900 p-4 rounded-xl w-80 text-white space-y-4">
      {/* Available Balance */}
      <div className="text-gray-400 text-sm relative w-fit">
        Avbl -{" "}
        <button
          onClick={() => setShowTokenDropdown(!showTokenDropdown)}
          className="text-white font-medium hover:underline"
        >
          {selectedToken}
        </button>
        {showTokenDropdown && (
          <div className="absolute top-6 left-14 bg-gray-800 rounded shadow-lg z-10">
            {tokenPairs.map((token) => (
              <div
                key={token}
                onClick={() => {
                  setSelectedToken(token);
                  setShowTokenDropdown(false);
                }}
                className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer"
              >
                {token}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calculator Button */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setShowCalculator(true)}
          className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-black font-semibold"
        >
          Calculator
        </button>

        {/* ✅ Leverage Button */}
        <button
          onClick={() => setShowLeverageModal(true)}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm text-white"
        >
          Leverage: {leverage}x
        </button>
      </div>

      {showCalculator && (
        <CalculatorContainer onClose={() => setShowCalculator(false)} />
      )}

      {/* ✅ Leverage Modal */}
      <LeverageModal
        show={showLeverageModal}
        onClose={() => setShowLeverageModal(false)}
        onConfirm={(val) => setLeverage(val)}
        currentLeverage={leverage}
      />

      {/* Margin Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md">
        <div>Margin</div>
        <input
          type="number"
          className="bg-transparent text-white flex-1 outline-none"
          value={margin}
          onChange={(e) => {
            setMargin(e.target.value);
            // Calculate and set percentage based on input margin
            if (userBalance && parseFloat(userBalance) > 0) {
              const newPercentage = (parseFloat(e.target.value) / parseFloat(userBalance)) * 100;
              setPercentage(Math.min(100, Math.max(0, newPercentage)));
            }
          }}
        />
        <span className="text-gray-400">{selectedToken}</span>
      </div>

      {/* Available Balance Display */}
      <div className="text-sm text-gray-400 pl-2">
        Available: {parseFloat(userBalance).toFixed(2)} {selectedToken}
      </div>

      {/* Size Percentage Slider */}
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max="100"
          value={percentage}
          onChange={(e) => handlePercentageChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Batch Size Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md mb-2">
        <div className="mr-2">Batch Size</div>
        <input
          type="number"
          className="bg-transparent text-white flex-1 outline-none"
          value={batchSize}
          onChange={(e) => setBatchSize(parseInt(e.target.value) || 1)}
          min="1"
        />
      </div>

      {/* Interval Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md mb-2">
        <div className="mr-2">Interval (sec)</div>
        <input
          type="number"
          className="bg-transparent text-white flex-1 outline-none"
          value={interval}
          onChange={(e) => setInterval(parseInt(e.target.value) || 60)}
          min="60"
        />
      </div>

      {/* Close Start Time Inputs */}
      <div className="flex space-x-2">
        <div>Close After</div>
        <input
          type="number"
          className="bg-gray-800 p-2 rounded-md text-white w-1/2"
          value={hours}
          onChange={(e) => setHours(parseInt(e.target.value) || 0)}
          placeholder="Hours"
          min="0"
        />
        <input
          type="number"
          className="bg-gray-800 p-2 rounded-md text-white w-1/2"
          value={minutes}
          onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
          placeholder="Minutes"
          min="0"
        />
      </div>

      {/* Quick Timer Buttons */}
      <div className="flex justify-between">
        {[1, 6, 12, 24].map((time) => (
          <button
            key={time}
            className="bg-gray-700 px-3 py-1 rounded"
            onClick={() => setQuickTime(time)}
          >
            {time}h
          </button>
        ))}
      </div>
      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-400 p-2 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/30 border border-green-500 text-green-400 p-2 rounded mb-4">
          {success}
        </div>
      )}

      {/* Estimated Execution Time */}
      {closeStartTime > 0 && (
        <div className="text-gray-400 text-sm mb-4">
          <p>Execution will start: {new Date(closeStartTime * 1000).toLocaleString()}</p>
          <p>Total batches: {batchSize}</p>
          <p>Interval between batches: {interval} seconds</p>
        </div>
      )}

      <LSButtons
        orderType="twap"
        onBuy={async () => {
          if (!user) {
            setError("Please connect your wallet");
            return;
          }
          
          try {
            setLoading(true);
            setError("");
            setSuccess("");
            
            // Get token addresses from your token mapping or contract
            // For demo, using placeholder addresses
            const baseToken = "0xAbd4293F3440A1EEFBbF2838B87C41F0620011E1"; // ETH
            const quoteToken = "0x7362c1e29584834d501353E684718e47329FCC53"; // USDT
            
            await placeTWAPOrder({
              baseToken,
              quoteToken,
              margin: margin.toString(),
              leverage,
              tradeType: 0, // Long
              batchSize,
              interval,
              closeStartTime
            });
            
            setSuccess("TWAP Buy order placed successfully!");
          } catch (err) {
            setError(err.message || "Failed to place TWAP order");
          } finally {
            setLoading(false);
          }
        }}
        onSell={async () => {
          if (!user) {
            setError("Please connect your wallet");
            return;
          }
          
          try {
            setLoading(true);
            setError("");
            setSuccess("");
            
            // Get token addresses from your token mapping or contract
            // For demo, using placeholder addresses
            const baseToken = "0xAbd4293F3440A1EEFBbF2838B87C41F0620011E1"; // ETH
            const quoteToken = "0x7362c1e29584834d501353E684718e47329FCC53"; // USDT
            
            await placeTWAPOrder({
              baseToken,
              quoteToken,
              margin: margin.toString(),
              leverage,
              tradeType: 1, // Short
              batchSize,
              interval,
              closeStartTime
            });
            
            setSuccess("TWAP Sell order placed successfully!");
          } catch (err) {
            setError(err.message || "Failed to place TWAP order");
          } finally {
            setLoading(false);
          }
        }}
        liqPrice="--"
        cost={margin}
        max="0.00"
        disabled={loading || !closeStartTime || error}
        buttonText={loading ? "Processing..." : undefined}
      />
    </div>
  );
};

export default TWAP;
