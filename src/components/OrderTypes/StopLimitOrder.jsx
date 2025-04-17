import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { SLTPToggle, ReduceOnlyToggle } from "../TradeOptions/index";
import LSButtons from "../LSButtons/LSButtons";
import CalculatorContainer from "../Calcultors/CalculatorContainer";
import LeverageModal from "../OrderModels/LeverageModal";
import StopLimitABI from "../../abis/stopLimit.json"; // Import the ABI

// Token Configuration
const TOKEN_CONFIG = {
  "BTC/USDT": {
    baseToken: {
      symbol: "BTC",
      address: "0xF56038e8AC0d882d7F24dd32411a10BA1a037614"
    },
    quoteToken: {
      symbol: "USDT",
      address: "0x7362c1e29584834d501353E684718e47329FCC53"
    }
  },
  "ETH/USDT": {
    baseToken: {
      symbol: "ETH",
      address: "0xAbd4293F3440A1EEFBbF2838B87C41F0620011E1"
    },
    quoteToken: {
      symbol: "USDT",
      address: "0x7362c1e29584834d501353E684718e47329FCC53"
    }
  },
  "BNB/USDT": {
    baseToken: {
      symbol: "BNB",
      address: "0x897904bA20478Fb2fB7cF8DA0c8a13dab1a6b23D"
    },
    quoteToken: {
      symbol: "USDT",
      address: "0x7362c1e29584834d501353E684718e47329FCC53"
    }
  },
  "SOL/USDT": {
    baseToken: {
      symbol: "SOL",
      address: "0x1Ca98845bc078f58576D623A68b0EB96A228C722"
    },
    quoteToken: {
      symbol: "USDT",
      address: "0x7362c1e29584834d501353E684718e47329FCC53"
    }
  },
  "FIN/USDT": {
    baseToken: {
      symbol: "FIN",
      address: "0x6EEAD95C1195E1120b9D0dA6b3e78b127B355884"
    },
    quoteToken: {
      symbol: "USDT",
      address: "0x7362c1e29584834d501353E684718e47329FCC53"
    }
  }
};

const STOP_LIMIT_ADDRESS = import.meta.env.VITE_STOP_LIMIT;

const StopLimitOrder = () => {
  // State variables
  const [stopPrice, setStopPrice] = useState("");
  const [limitPrice, setLimitPrice] = useState(""); // Renamed from price
  const [size, setSize] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [stopType, setStopType] = useState("Mark");
  const [isTPSLEnabled, setIsTPSLEnabled] = useState(false);
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [reduceOnly, setReduceOnly] = useState(false);
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [leverage, setLeverage] = useState(20);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [contract, setContract] = useState(null);
  const [error, setError] = useState("");
  const [currentBaseToken, setCurrentBaseToken] = useState(TOKEN_CONFIG["BTC/USDT"].baseToken);
  const [currentQuoteToken, setCurrentQuoteToken] = useState(TOKEN_CONFIG["BTC/USDT"].quoteToken);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const tokenPairs = ["USDT", "BTC", "ETH", "BNB"];

  // Initialize contract
  useEffect(() => {
    const initContract = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const stopLimitContract = new ethers.Contract(
            STOP_LIMIT_ADDRESS,
            StopLimitABI,
            signer
          );
          setContract(stopLimitContract);
        }
      } catch (err) {
        console.error("Contract initialization error:", err);
        setError("Failed to initialize contract");
      }
    };

    initContract();
  }, []);

  // Update token addresses when pair changes
  useEffect(() => {
    if (TOKEN_CONFIG[selectedPair]) {
      const newBaseToken = TOKEN_CONFIG[selectedPair].baseToken;
      const newQuoteToken = TOKEN_CONFIG[selectedPair].quoteToken;
      
      setCurrentBaseToken(newBaseToken);
      setCurrentQuoteToken(newQuoteToken);
      
      // Fetch current price whenever pair changes
      getCurrentTokenPrice(newBaseToken.address, newQuoteToken.address);
    }
  }, [selectedPair, contract]);

  // Add a new useEffect to fetch price initially
  useEffect(() => {
    if (contract && currentBaseToken && currentQuoteToken) {
      getCurrentTokenPrice(currentBaseToken.address, currentQuoteToken.address);
    }
  }, [contract]);

  // Add this useEffect for periodic price updates
  useEffect(() => {
    let interval;
    
    if (contract && currentBaseToken && currentQuoteToken) {
      // Update price every 10 seconds
      interval = setInterval(() => {
        getCurrentTokenPrice(currentBaseToken.address, currentQuoteToken.address);
      }, 10000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [contract, currentBaseToken, currentQuoteToken]);

  // Function to place stop limit order
  const placeStopLimitOrder = async (isLong) => {
    if (!contract) {
      setError("Contract not initialized");
      return;
    }

    try {
      setError(null);

      // Get connected wallet address
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const traderAddress = await signer.getAddress();

      if (!stopPrice || !limitPrice || !size) {
        setError("Please enter stop price, limit price, and size");
        return;
      }

      // Validate numeric inputs
      if (
        isNaN(stopPrice) ||
        isNaN(limitPrice) ||
        isNaN(size) ||
        parseFloat(stopPrice) <= 0 ||
        parseFloat(limitPrice) <= 0 ||
        parseFloat(size) <= 0
      ) {
        setError("Please enter valid numbers for all fields");
        return;
      }

      console.log("Placing stop limit order with params:", {
        trader: traderAddress,
        baseToken: currentBaseToken.address,
        quoteToken: currentQuoteToken.address,
        margin: size,
        leverage,
        stopPrice,
        limitPrice,
        positionType: isLong ? 0 : 1,
        stopLoss: isTPSLEnabled ? stopLoss : "0",
        takeProfit: isTPSLEnabled ? takeProfit : "0"
      });

      // Convert all numeric values to Wei
      const marginInWei = ethers.parseEther(size.toString());
      const leverageInWei = ethers.parseEther(leverage.toString());
      const stopPriceWei = ethers.parseEther(stopPrice.toString());
      const limitPriceWei = ethers.parseEther(limitPrice.toString());
      const slWei = isTPSLEnabled && stopLoss ? 
        ethers.parseEther(stopLoss.toString()) : 
        ethers.parseEther("0");
      const tpWei = isTPSLEnabled && takeProfit ? 
        ethers.parseEther(takeProfit.toString()) : 
        ethers.parseEther("0");
      console.log("Trader Address:", traderAddress);
      console.log("Base Token Address:", currentBaseToken.address);
      console.log("Quote Token Address:", currentQuoteToken.address);
      console.log("Margin:", marginInWei);
      console.log("Leverage:", leverage);
      console.log("Stop Price:", stopPriceWei);
      console.log("Limit Price:", limitPriceWei);
      console.log("Stop Loss:", slWei);
      console.log("Take Profit:", tpWei);
      
      // Call the contract function with exact parameter order
      const tx = await contract.PlaceStopLimitOrder(
        traderAddress,              // _trader: address of connected wallet
        currentBaseToken.address,   // _baseToken: BTC, ETH, etc. address
        currentQuoteToken.address,  // _quoteToken: USDT address
        marginInWei,               // _margin: size in wei
        leverage,             // _leverage: leverage in wei
        stopPriceWei,             // _stopPrice: stop price in wei
        limitPriceWei,            // _limitPrice: limit price in wei
        isLong ? 0 : 1,           // _positionType: 0 for long, 1 for short
        slWei,                    // _sl: stop loss in wei (0 if not enabled)
        tpWei                    // _tp: take profit in wei (0 if not enabled)

      );

      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Stop limit order placed successfully");
      
      // Clear form after successful order
      setStopPrice("");
      setLimitPrice("");
      setSize("");
      if (!isTPSLEnabled) {
        setTakeProfit("");
        setStopLoss("");
      }
      setError(null);

    } catch (err) {
      console.error("Error placing stop limit order:", err);
      setError(err.message || "Failed to place stop limit order");
    }
  };

  const getCurrentTokenPrice = async (baseTokenAddress, quoteTokenAddress) => {
    try {
      setIsLoading(true);
      if (!contract) {
        console.error("Contract not initialized");
        return;
      }

      // Get the provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create instance of FutureLongShort contract
      const futureLongShortAddress = import.meta.env.VITE_FUTURE_LONG_SHORT; // Make sure this is set in your .env
      const futureLongShortABI = ["function getCurrentPrice(address _baseToken, address _quoteToken) view returns (uint256)"]; // Add this to your ABI file
      const futureLongShortContract = new ethers.Contract(
        futureLongShortAddress,
        futureLongShortABI,
        signer
      );

      // Get current price
      const price = await futureLongShortContract.getCurrentPrice(
        baseTokenAddress,
        quoteTokenAddress
      );

      // Convert price from Wei to regular number
      const formattedPrice = ethers.formatEther(price);
      console.log(`Current price for ${baseTokenAddress}/${quoteTokenAddress}: ${formattedPrice}`);
      
      // Update the state
      setCurrentPrice(formattedPrice);
      
      // Set default values for stop and limit price fields
      setStopPrice(formattedPrice);
      setLimitPrice(formattedPrice);

    } catch (error) {
      console.error("Error fetching current price:", error);
      setError("Failed to fetch current price");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl w-96 text-white space-y-4">
      {error && (
        <div className="bg-red-500/20 text-red-500 p-2 rounded-md">
          {error}
        </div>
      )}

      {/* Token Selection with Address Display */}
      <div className="space-y-2">
      <div className="text-gray-400 text-sm relative w-fit">
          Pair -{" "}
        <button
          onClick={() => setShowTokenDropdown(!showTokenDropdown)}
          className="text-white font-medium hover:underline"
        >
            {selectedPair}
        </button>
        {showTokenDropdown && (
          <div className="absolute top-6 left-14 bg-gray-800 rounded shadow-lg z-10">
              {Object.keys(TOKEN_CONFIG).map((pair) => (
              <div
                  key={pair}
                onClick={() => {
                    setSelectedPair(pair);
                  setShowTokenDropdown(false);
                }}
                className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer"
              >
                  {pair}
              </div>
            ))}
          </div>
        )}
      </div>

        {/* Base Token Address Display */}
        <div className="text-sm text-gray-400 break-all">
          Base Token ({currentBaseToken.symbol}): {currentBaseToken.address}
        </div>

        {/* Quote Token Address Display */}
        <div className="text-sm text-gray-400 break-all">
          Quote Token ({currentQuoteToken.symbol}): {currentQuoteToken.address}
        </div>
      </div>

      {/* Calculator and Leverage Buttons */}
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

      {/* Stop Price Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md">
        <div className="min-w-[80px]">Stop Price</div>
        <input
          type="number"
          className="bg-transparent text-white flex-1 outline-none"
          value={stopPrice}
          onChange={(e) => setStopPrice(e.target.value)}
          placeholder={isLoading ? "Loading..." : "Enter stop price"}
          disabled={isLoading}
        />
        <select
          className="bg-gray-700 text-white px-3 py-1 rounded ml-2"
          value={stopType}
          onChange={(e) => setStopType(e.target.value)}
        >
          <option value="Mark">Mark</option>
          <option value="Last">Last</option>
        </select>
        {isLoading && (
          <div className="ml-2 text-yellow-500">Loading...</div>
        )}
      </div>

      {/* Limit Price Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md">
        <div className="min-w-[80px]">Limit Price</div>
        <input
          type="number"
          className="bg-transparent text-white flex-1 outline-none"
          value={limitPrice}
          onChange={(e) => setLimitPrice(e.target.value)}
          placeholder={isLoading ? "Loading..." : "Enter limit price"}
          disabled={isLoading}
        />
        <span className="text-gray-400">USDT</span>
        <button 
          className="bg-gray-700 px-3 py-1 ml-2"
          onClick={() => {
            if (currentPrice) {
              setLimitPrice(currentPrice);
            }
          }}
        >
          Current
        </button>
      </div>

      {/* Size Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md">
        <div className="min-w-[80px]">Size</div>
        <input
          type="number"
          className="bg-transparent text-white flex-1 outline-none"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="Enter size"
        />
        <span className="text-gray-400">USDT</span>
      </div>

      {/* Size Percentage Slider */}
      <input
        type="range"
        min="0"
        max="100"
        value={percentage}
        onChange={(e) => {
          const newPercentage = Number(e.target.value);
          setPercentage(newPercentage);
          // Calculate size based on percentage and available balance
          // Add your calculation logic here
        }}
        className="w-full"
      />

      <SLTPToggle
        isTPSLEnabled={isTPSLEnabled}
        setIsTPSLEnabled={setIsTPSLEnabled}
        takeProfit={takeProfit}
        setTakeProfit={(value) => {
          // Ensure we store "0" if empty
          setTakeProfit(value || "0");
        }}
        stopLoss={stopLoss}
        setStopLoss={(value) => {
          // Ensure we store "0" if empty
          setStopLoss(value || "0");
        }}
        disabled={reduceOnly}
      />

      <ReduceOnlyToggle
        reduceOnly={reduceOnly}
        setReduceOnly={setReduceOnly}
        disabled={isTPSLEnabled}
      />

      <LSButtons
        orderType="stop-limit"
        onBuy={() => placeStopLimitOrder(true)}
        onSell={() => placeStopLimitOrder(false)}
        liqPrice="--"
        cost={size || "0.00"}
        max="0.00"
        disabled={!contract || !size || !stopPrice || !limitPrice}
      />

      {showCalculator && (
        <CalculatorContainer onClose={() => setShowCalculator(false)} />
      )}

      <LeverageModal
        show={showLeverageModal}
        onClose={() => setShowLeverageModal(false)}
        onConfirm={setLeverage}
        currentLeverage={leverage}
      />
    </div>
  );
};

export default StopLimitOrder;
