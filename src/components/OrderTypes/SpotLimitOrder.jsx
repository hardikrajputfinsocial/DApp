import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import SpotLimitABI from "../../abis/spot/Limit.json";

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

const SpotLimitOrder = () => {
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [amountIn, setAmountIn] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [error, setError] = useState("");
  const [contract, setContract] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [currentBaseToken, setCurrentBaseToken] = useState(TOKEN_CONFIG["BTC/USDT"].baseToken);
  const [currentQuoteToken, setCurrentQuoteToken] = useState(TOKEN_CONFIG["BTC/USDT"].quoteToken);

  // Initialize contract
  useEffect(() => {
    const initContract = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const spotLimitContract = new ethers.Contract(
            import.meta.env.VITE_SPOT_LIMIT,
            SpotLimitABI,
            signer
          );
          setContract(spotLimitContract);
          
          // Get user address
          const address = await signer.getAddress();
          setUserAddress(address);
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
      setCurrentBaseToken(TOKEN_CONFIG[selectedPair].baseToken);
      setCurrentQuoteToken(TOKEN_CONFIG[selectedPair].quoteToken);
    }
  }, [selectedPair]);

  const placeSpotLimitOrder = async (isBuy) => {
    if (!contract) {
      setError("Contract not initialized");
      return;
    }

    try {
      setError(null);

      if (!amountIn || !targetPrice) {
        setError("Please fill in all fields");
        return;
      }

      // Convert amount and price to Wei
      const amountInWei = ethers.parseEther(amountIn);
      const targetPriceWei = ethers.parseEther(targetPrice);

      // For Buy: TokenA = baseToken (BTC, ETH, etc.), TokenB = USDT
      // For Sell: TokenA = USDT, TokenB = baseToken (BTC, ETH, etc.)
      const tokenA = isBuy ? currentBaseToken.address : currentQuoteToken.address;
      const tokenB = isBuy ? currentQuoteToken.address : currentBaseToken.address;

      // Call the contract function with the correct token order
      const tx = await contract.placeSpotLimitOrder(
        userAddress,
        tokenA,
        tokenB,
        amountInWei,
        targetPriceWei
      );

      await tx.wait();
      console.log(`Spot limit ${isBuy ? 'buy' : 'sell'} order placed successfully`);

      // Clear form
      setAmountIn("");
      setTargetPrice("");
      setError(null);

    } catch (err) {
      console.error("Error placing spot limit order:", err);
      setError(err.message || "Failed to place spot limit order");
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl w-96 text-white space-y-4">
      {error && (
        <div className="bg-red-500/20 text-red-500 p-2 rounded-md">
          {error}
        </div>
      )}

      {/* Token Pair Selection */}
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

      {/* Amount Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md">
        <div className="min-w-[80px]">Amount</div>
        <input
          type="number"
          className="bg-transparent text-white flex-1 outline-none"
          value={amountIn}
          onChange={(e) => setAmountIn(e.target.value)}
          placeholder="Enter amount"
        />
        <span className="text-gray-400">{currentBaseToken.symbol}</span>
      </div>

      {/* Target Price Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md">
        <div className="min-w-[80px]">Price</div>
        <input
          type="number"
          className="bg-transparent text-white flex-1 outline-none"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          placeholder="Enter target price"
        />
        <span className="text-gray-400">{currentQuoteToken.symbol}</span>
      </div>

      {/* Buy/Sell Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => placeSpotLimitOrder(true)}
          className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
          disabled={!contract || !amountIn || !targetPrice}
        >
          Buy {currentBaseToken.symbol}
        </button>
        <button
          onClick={() => placeSpotLimitOrder(false)}
          className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-md"
          disabled={!contract || !amountIn || !targetPrice}
        >
          Sell {currentBaseToken.symbol}
        </button>
      </div>
    </div>
  );
};

export default SpotLimitOrder; 