import React, { useState, useEffect, useCallback } from "react";
import { SLTPToggle, ReduceOnlyToggle } from "../TradeOptions/index";
import CalculatorContainer from "../Calcultors/CalculatorContainer";
import LSButtons from "../LSButtons/LSButtons";
import LeverageModal from "../OrderModels/LeverageModal";
import { ethers } from "ethers";
import MarketOrderABI from "../../abis/market.json";
import useTokenAddresses from "../../hooks/useTokenAddresses";
import { placeMarketOrder } from "../../hooks/UserFunctions/MarketOrder/placeMarketOrder";

// Use a hardcoded address for now to ensure we're using the correct one
const USDT_ADDRESS = "0x7362c1e29584834d501353E684718e47329FCC53";
const MARKET_ORDER_ADDRESS = import.meta.env.VITE_MARKET_ORDER;

const MarketOrder = () => {
  const [margin, setMargin] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [userBalance, setUserBalance] = useState("0");
  const [isTPSLEnabled, setIsTPSLEnabled] = useState(false);
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [reduceOnly, setReduceOnly] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedToken, setSelectedToken] = useState("BTC/USDT");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);

  const [showCalculator, setShowCalculator] = useState(false);

  const [leverage, setLeverage] = useState(20);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  
  const [marketOrderContract, setMarketOrderContract] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [userAddress, setUserAddress] = useState(null);

  const { tokenAddresses } = useTokenAddresses();

  const tokenPairs = [
    "BTC/USDT",
    "ETH/USDT",
    "BNB/USDT",
    "SOL/USDT",
    "FIN/USDT",
  ];

  // Initialize contract and get user address
  useEffect(() => {
    const initContract = async () => {
      if (window.ethereum) {
        try {
          console.log("Initializing market contract at address:", MARKET_ORDER_ADDRESS);

          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);
          console.log("User address:", address);

          // Check if contract exists at the address
          const code = await provider.getCode(MARKET_ORDER_ADDRESS);
          if (code === "0x") {
            throw new Error(
              `No contract deployed at address: ${MARKET_ORDER_ADDRESS}`
            );
          }
          console.log("Contract code found at address");

          const contract = new ethers.Contract(
            MARKET_ORDER_ADDRESS,
            MarketOrderABI,
            signer
          );

          // Verify the contract has the expected methods
          if (!contract.placeMarketOrder) {
            throw new Error("Contract does not have placeMarketOrder method");
          }

          console.log("Contract initialized successfully");
          setMarketOrderContract(contract);
          setIsReady(true);
          
          // Fetch user balance
          fetchUserBalance();
        } catch (err) {
          console.error("Error initializing contract:", err);
          setError(`Failed to initialize contract: ${err.message}`);
        }
      } else {
        setError("MetaMask not found. Please install MetaMask.");
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

  // Get the current token address
  const getCurrentTokenAddress = () => {
    return tokenAddresses[selectedToken] || "";
  };
  
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
  
  // Update the percentage slider and margin calculation
  const handlePercentageChange = useCallback((newPercentage) => {
    setPercentage(newPercentage);
    const calculatedMargin = (parseFloat(userBalance) * newPercentage) / 100;
    setMargin(calculatedMargin.toFixed(2));
  }, [userBalance]);

  const handleLong = async () => {
    if (!isReady || !marketOrderContract || !userAddress) {
      setError("Contract not ready or wallet not connected");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      if (!margin) {
        setError("Please enter margin amount");
        setLoading(false);
        return;
      }

      const baseToken = getCurrentTokenAddress();
      if (!baseToken) {
        setError("Invalid token pair selected");
        setLoading(false);
        return;
      }

      // Validate numeric inputs
      if (isNaN(margin) || parseFloat(margin) <= 0) {
        setError("Please enter a valid margin amount");
        setLoading(false);
        return;
      }

      // Validate take profit and stop loss if enabled
      if (isTPSLEnabled) {
        if (takeProfit && (isNaN(takeProfit) || parseFloat(takeProfit) <= 0)) {
          setError("Please enter a valid take profit price");
          setLoading(false);
          return;
        }
        if (stopLoss && (isNaN(stopLoss) || parseFloat(stopLoss) <= 0)) {
          setError("Please enter a valid stop loss price");
          setLoading(false);
          return;
        }
      }

      const receipt = await placeMarketOrder(
        baseToken,
        USDT_ADDRESS,
        0, // PositionType.LONG
        margin,
        leverage,
        isTPSLEnabled ? stopLoss : "0",
        isTPSLEnabled ? takeProfit : "0"
      );

      console.log("Long market order placed successfully", receipt);
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error("Error placing long market order:", error);
      setError(
        error.message ||
          "Failed to place long order. Please check your inputs and try again."
      );
      setLoading(false);
    }
  };

  const handleShort = async () => {
    if (!isReady || !marketOrderContract || !userAddress) {
      setError("Contract not ready or wallet not connected");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      if (!margin) {
        setError("Please enter margin amount");
        setLoading(false);
        return;
      }

      const baseToken = getCurrentTokenAddress();
      if (!baseToken) {
        setError("Invalid token pair selected");
        setLoading(false);
        return;
      }

      // Validate numeric inputs
      if (isNaN(margin) || parseFloat(margin) <= 0) {
        setError("Please enter a valid margin amount");
        setLoading(false);
        return;
      }

      // Validate take profit and stop loss if enabled
      if (isTPSLEnabled) {
        if (takeProfit && (isNaN(takeProfit) || parseFloat(takeProfit) <= 0)) {
          setError("Please enter a valid take profit price");
          setLoading(false);
          return;
        }
        if (stopLoss && (isNaN(stopLoss) || parseFloat(stopLoss) <= 0)) {
          setError("Please enter a valid stop loss price");
          setLoading(false);
          return;
        }
      }

      const receipt = await placeMarketOrder(
        baseToken,
        USDT_ADDRESS,
        1, // PositionType.SHORT
        margin,
        leverage,
        isTPSLEnabled ? stopLoss : "0",
        isTPSLEnabled ? takeProfit : "0"
      );

      console.log("Short market order placed successfully", receipt);
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error("Error placing short market order:", error);
      setError(
        error.message ||
          "Failed to place short order. Please check your inputs and try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl w-96 text-white space-y-4">
      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-400 p-2 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="text-gray-400 text-sm relative w-fit">
        Token Pair -{" "}
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
          className="bg-transparent text-white flex-1 outline-none px-2"
          value={margin}
          onChange={(e) => {
            setMargin(e.target.value);
            // Calculate and set percentage based on input margin
            if (userBalance && parseFloat(userBalance) > 0) {
              const newPercentage = (parseFloat(e.target.value) / parseFloat(userBalance)) * 100;
              setPercentage(Math.min(100, Math.max(0, newPercentage)));
            }
          }}
          placeholder="0.00"
          type="number"
          step="0.01"
          min="0"
        />
        <span className="text-gray-400">USDT</span>
      </div>
      
      {/* Available Balance Display */}
      <div className="text-sm text-gray-400 pl-2">
        Available: {parseFloat(userBalance).toFixed(2)} USDT
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

      <SLTPToggle
        isTPSLEnabled={isTPSLEnabled}
        setIsTPSLEnabled={(value) => {
          setIsTPSLEnabled(value);
          if (value) setReduceOnly(false);
        }}
        takeProfit={takeProfit}
        setTakeProfit={setTakeProfit}
        stopLoss={stopLoss}
        setStopLoss={setStopLoss}
        disabled={reduceOnly}
      />
      <ReduceOnlyToggle
        reduceOnly={reduceOnly}
        setReduceOnly={(value) => {
          setReduceOnly(value);
          if (value) setIsTPSLEnabled(false);
        }}
        disabled={isTPSLEnabled}
      />

      <LSButtons
        orderType="market"
        onBuy={handleLong}
        onSell={handleShort}
        liqPrice="--"
        cost={margin || "0.00"}
        max="0.00"
        disabled={loading}
        loading={loading}
      />
    </div>
  );
};

export default MarketOrder;
