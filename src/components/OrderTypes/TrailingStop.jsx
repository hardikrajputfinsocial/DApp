import React, { useState, useEffect, useCallback } from "react";
import { ReduceOnlyToggle } from "../TradeOptions/index";
import LSButtons from "../LSButtons/LSButtons";
import CalculatorContainer from "../Calcultors/CalculatorContainer";
import LeverageModal from "../OrderModels/LeverageModal";
import useTokenAddresses from "../../hooks/useTokenAddresses";
import { ethers } from "ethers";
import TrailingFuturesABI from "../../abis/traillingFutures.json";

const TrailingStop = () => {
  const [StopLimit, setStopLimit] = useState(0);
  const [TargetPrice, setTargetPrice] = useState("");
  const [stopType, setStopType] = useState("Mark");
  const [percentage, setPercentage] = useState(0);
  const [margin, setMargin] = useState("");
  const [userBalance, setUserBalance] = useState("0");
  //const [reduceOnly, _setReduceOnly] = useState(false);
  const [selectedToken, setSelectedToken] = useState("BTC/USDT");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [leverage, setLeverage] = useState(20);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [trailingFutures, setTrailingFutures] = useState(null);
  const [userAddress, setUserAddress] = useState(null);

  const { tokenAddresses, loading: addressesLoading } = useTokenAddresses();

  const USDT_ADDRESS = "0x7362c1e29584834d501353E684718e47329FCC53";
  const TRAILING_FUTURES_ADDRESS = import.meta.env.VITE_TRAILLING_FUTURES;

  // Initialize contract and get user address
  useEffect(() => {
    const initContract = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);

          const contract = new ethers.Contract(
            TRAILING_FUTURES_ADDRESS,
            TrailingFuturesABI,
            signer
          );
          setTrailingFutures(contract);
          setIsReady(true);
          
          // Fetch user balance
          fetchUserBalance();
        } catch (err) {
          console.error("Error initializing contract:", err);
          setError("Failed to initialize contract");
        }
      }
    };
    initContract();
  }, []);
  
  // Refetch balance when token changes
  useEffect(() => {
    if (isReady) {
      fetchUserBalance();
    }
  }, [selectedToken, isReady]);
  
  // Fetch user balance
  const fetchUserBalance = async () => {
    try {
      if (!window.ethereum) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      // Import the necessary contract and ABI
      const FUTURE_LONG_SHORT_ADDRESS = import.meta.env.VITE_FUTURE_LONG_SHORT;
      const futureLongShortABI = await import("../../abis/futureLongShort.json");
      
      const futureLongShortContract = new ethers.Contract(
        FUTURE_LONG_SHORT_ADDRESS,
        futureLongShortABI.default || futureLongShortABI,
        signer
      );
      
      // Use USDT address for quote token
      const balance = await futureLongShortContract.getUserWalletBalance(
        userAddress,
        USDT_ADDRESS
      );
      
      const formattedBalance = ethers.formatEther(balance);
      setUserBalance(formattedBalance);
    } catch (error) {
      console.error("Error fetching user balance:", error);
    }
  };

  const tokenPairs = [
    "BTC/USDT",
    "ETH/USDT",
    "BNB/USDT",
    "SOL/USDT",
    "FIN/USDT",
  ];

  // Get the current token address
  const getCurrentTokenAddress = () => {
    return tokenAddresses[selectedToken] || "";
  };

  // Get the token symbol from the pair
  const getTokenSymbol = () => {
    return selectedToken.split("/")[0];
  };

  const handleStopLimitChange = (value) => {
    setStopLimit(value);
  };
  
  // Update the percentage slider and margin calculation
  const handlePercentageChange = useCallback((newPercentage) => {
    setPercentage(newPercentage);
    const calculatedMargin = (parseFloat(userBalance) * newPercentage) / 100;
    setMargin(calculatedMargin.toFixed(2));
  }, [userBalance]);

  // Handle buy order (Long position)
  const handleBuyOrder = async () => {
    if (!isReady || !trailingFutures || !userAddress) {
      setError("Contract not ready or wallet not connected");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const baseToken = getCurrentTokenAddress();
      const quoteToken = USDT_ADDRESS;

      // Convert margin and target price to wei (assuming 18 decimals)
      const marginInWei = ethers.parseUnits(margin, 18);
      const targetPriceInWei = ethers.parseUnits(TargetPrice, 18);

      // Call the placeOrder function from your contract
      const tx = await trailingFutures.placeOrder(
        userAddress, // user address
        baseToken, // base token address
        quoteToken, // quote token address (USDT)
        marginInWei, // margin amount in wei
        BigInt(leverage), // leverage
        0, // positionType (0 for Long/Buy)
        targetPriceInWei, // target price in wei
        BigInt(StopLimit) // tslPercent
      );

      console.log("Buy Trailing Stop Order placed:", tx);
      // Wait for transaction to be mined
      await tx.wait();
      console.log("Transaction confirmed");
    } catch (err) {
      console.error("Error placing buy order:", err);
      setError(err.message || "Failed to place buy order");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sell order (Short position)
  const handleSellOrder = async () => {
    if (!isReady || !trailingFutures || !userAddress) {
      setError("Contract not ready or wallet not connected");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const baseToken = getCurrentTokenAddress();
      const quoteToken = USDT_ADDRESS;

      // Convert margin and target price to wei (assuming 18 decimals)
      const marginInWei = ethers.parseUnits(margin, 18);
      const targetPriceInWei = ethers.parseUnits(TargetPrice, 18);

      // Call the placeOrder function from your contract
      const tx = await trailingFutures.placeOrder(
        userAddress, // user address
        baseToken, // base token address
        quoteToken, // quote token address (USDT)
        marginInWei, // margin amount in wei
        BigInt(leverage), // leverage
        1, // positionType (1 for Short/Sell)
        targetPriceInWei, // target price in wei
        BigInt(StopLimit) // tslPercent
      );

      console.log("Sell Trailing Stop Order placed:", tx);
      // Wait for transaction to be mined
      await tx.wait();
      console.log("Transaction confirmed");
    } catch (err) {
      console.error("Error placing sell order:", err);
      setError(err.message || "Failed to place sell order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl w-80 text-white space-y-4">
      {/* Token Pair */}
      <div className="text-gray-400 text-sm relative w-fit">
        Pair -{" "}
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

      {/* Token Address Display */}
      <div className="text-sm text-gray-400 break-all">
        Token Address:{" "}
        {addressesLoading ? "Loading..." : getCurrentTokenAddress()}
      </div>
      
      {/* Available Balance Display */}
      <div className="text-sm text-gray-400 pl-2 mb-2">
        Available: {parseFloat(userBalance).toFixed(2)} USDT
      </div>

      {/* Error Display */}
      {error && <div className="text-red-500 text-sm">Error: {error}</div>}

      {/* Calculator Button */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setShowCalculator(true)}
          className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-black font-semibold"
        >
          Calculator
        </button>
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

      <LeverageModal
        show={showLeverageModal}
        onClose={() => setShowLeverageModal(false)}
        onConfirm={(val) => setLeverage(val)}
        currentLeverage={leverage}
      />

      {/* Margin Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md space-x-2">
        <span className="text-gray-400">Margin</span>
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
          placeholder="Enter margin amount"
        />
        <span className="text-gray-400">USDT</span>
      </div>
      
      {/* Size Percentage Slider */}
      <div className="space-y-2 mb-2">
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

      {/* StopLimit Rate Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md space-x-2">
        <span className="text-gray-400">Stop Limit</span>
        <input
          type="number"
          className="bg-transparent text-white flex-1 outline-none"
          value={StopLimit}
          onChange={(e) => handleStopLimitChange(Number(e.target.value))}
        />
        <span className="text-gray-400">%</span>
        <button
          className="bg-gray-700 px-2 py-1 rounded"
          onClick={() => handleStopLimitChange(1)}
        >
          1%
        </button>
        <button
          className="bg-gray-700 px-2 py-1 rounded"
          onClick={() => handleStopLimitChange(2)}
        >
          2%
        </button>
      </div>

      {/* Target Price Input with Dropdown */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md space-x-2">
        <span className="text-gray-400">Target Price</span>
        <input
          type="number"
          className="bg-transparent text-white flex-1 outline-none"
          value={TargetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
        />
        <select
          className="bg-gray-700 text-white px-3 py-1 rounded"
          value={stopType}
          onChange={(e) => setStopType(e.target.value)}
        >
          <option value="Mark">Mark</option>
          <option value="Last">Last</option>
        </select>
      </div>

      {/* Size Input (Displays Percentage) */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md space-x-2">
        <span className="text-gray-400">Size</span>
        <input
          className="bg-transparent text-white flex-1 outline-none"
          value={percentage}
          onChange={(e) => setPercentage(Number(e.target.value))}
        />
        <span className="text-gray-400">{getTokenSymbol()}</span>
      </div>

      {/* Size Percentage Slider */}
      <input
        type="range"
        min="0"
        max="100"
        value={percentage}
        onChange={(e) => setPercentage(Number(e.target.value))}
        className="w-full"
      />
      {/* <ReduceOnlyToggle reduceOnly={reduceOnly} setReduceOnly={setReduceOnly} /> */}
      <LSButtons
        orderType="trailing-stop"
        onBuy={handleBuyOrder}
        onSell={handleSellOrder}
        liqPrice="--"
        cost={margin || "0.00"}
        max={userBalance}
        disabled={isLoading || !isReady || !userAddress || !margin}
      />
    </div>
  );
};

export default TrailingStop;
