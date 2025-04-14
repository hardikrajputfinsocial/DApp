import React, { useState, useEffect } from "react";
import { SLTPToggle, ReduceOnlyToggle } from "../TradeOptions/index";
import CalculatorContainer from "../Calcultors/CalculatorContainer";
import LSButtons from "../LSButtons/LSButtons";
import LeverageModal from "../OrderModels/LeverageModal";
import { ethers } from "ethers";
import LimitOrderABI from "../../abis/LimitOrder.json";
import useTokenAddresses from "../../hooks/useTokenAddresses";

// Use a hardcoded address for now to ensure we're using the correct one
const USDT_ADDRESS = "0x7362c1e29584834d501353E684718e47329FCC53";
const LIMIT_ORDER_ADDRESS = import.meta.env.VITE_LIMIT_ORDER;

const Limit = () => {
  const [price, setPrice] = useState("");
  const [margin, setMargin] = useState("");
  const [isTPSLEnabled, setIsTPSLEnabled] = useState(false);
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [reduceOnly, setReduceOnly] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedToken, setSelectedToken] = useState("BTC/USDT");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [leverage, setLeverage] = useState(20);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [limitOrderContract, setLimitOrderContract] = useState(null);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const [contractAddress, setContractAddress] = useState("");

  const { tokenAddresses } = useTokenAddresses();

  // Initialize contract and get user address
  useEffect(() => {
    const initContract = async () => {
      if (window.ethereum) {
        try {
          console.log("Initializing contract at address:", LIMIT_ORDER_ADDRESS);
          setContractAddress(LIMIT_ORDER_ADDRESS);

          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);
          console.log("User address:", address);

          // Check if contract exists at the address
          const code = await provider.getCode(LIMIT_ORDER_ADDRESS);
          if (code === "0x") {
            throw new Error(
              `No contract deployed at address: ${LIMIT_ORDER_ADDRESS}`
            );
          }
          console.log("Contract code found at address");

          const contract = new ethers.Contract(
            LIMIT_ORDER_ADDRESS,
            LimitOrderABI,
            signer
          );

          // Verify the contract has the expected methods
          if (!contract.placeLimitOrder) {
            throw new Error("Contract does not have placeLimitOrder method");
          }

          console.log("Contract initialized successfully");
          setLimitOrderContract(contract);
          setIsReady(true);
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

  const handleLong = async () => {
    if (!isReady || !limitOrderContract || !userAddress) {
      setError("Contract not ready or wallet not connected");
      return;
    }

    try {
      setError(null);

      if (!price || !margin) {
        setError("Please enter both price and margin");
        return;
      }

      const baseToken = getCurrentTokenAddress();
      if (!baseToken) {
        setError("Invalid token pair selected");
        return;
      }

      // Validate numeric inputs
      if (
        isNaN(price) ||
        isNaN(margin) ||
        parseFloat(price) <= 0 ||
        parseFloat(margin) <= 0
      ) {
        setError("Please enter valid numbers for price and margin");
        return;
      }

      // Validate take profit and stop loss if enabled
      if (isTPSLEnabled) {
        if (takeProfit && (isNaN(takeProfit) || parseFloat(takeProfit) <= 0)) {
          setError("Please enter a valid take profit price");
          return;
        }
        if (stopLoss && (isNaN(stopLoss) || parseFloat(stopLoss) <= 0)) {
          setError("Please enter a valid stop loss price");
          return;
        }
      }

      console.log("Placing long order with params:", {
        baseToken,
        USDT_ADDRESS,
        price,
        margin,
        leverage,
        takeProfit,
        stopLoss,
      });

      const priceInWei = ethers.parseEther(price);
      const marginInWei = ethers.parseEther(margin);
      const tpInWei = isTPSLEnabled
        ? ethers.parseEther(takeProfit || "0")
        : ethers.parseEther("0");
      const slInWei = isTPSLEnabled
        ? ethers.parseEther(stopLoss || "0")
        : ethers.parseEther("0");

      // Log the exact parameters being sent to the contract
      const params = {
        baseToken,
        USDT_ADDRESS,
        priceInWei: priceInWei.toString(),
        positionType: 0,
        marginInWei: marginInWei.toString(),
        leverage,
        slInWei: slInWei.toString(),
        tpInWei: tpInWei.toString(),
      };
      console.log("Contract call parameters:", params);

      // Send the transaction with a higher gas limit
      const tx = await limitOrderContract.placeLimitOrder(
        baseToken,
        USDT_ADDRESS,
        priceInWei,
        0, // PositionType.LONG
        marginInWei,
        leverage,
        slInWei,
        tpInWei
      );
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Long limit order placed successfully");
      setError(null);
    } catch (error) {
      console.error("Error placing long limit order:", error);
      setError(
        error.message ||
          "Failed to place long order. Please check your inputs and try again."
      );
    }
  };

  const handleShort = async () => {
    if (!isReady || !limitOrderContract || !userAddress) {
      setError("Contract not ready or wallet not connected");
      return;
    }

    try {
      setError(null);

      if (!price || !margin) {
        setError("Please enter both price and margin");
        return;
      }

      const baseToken = getCurrentTokenAddress();
      if (!baseToken) {
        setError("Invalid token pair selected");
        return;
      }

      // Validate numeric inputs
      if (
        isNaN(price) ||
        isNaN(margin) ||
        parseFloat(price) <= 0 ||
        parseFloat(margin) <= 0
      ) {
        setError("Please enter valid numbers for price and margin");
        return;
      }

      // Validate take profit and stop loss if enabled
      if (isTPSLEnabled) {
        if (takeProfit && (isNaN(takeProfit) || parseFloat(takeProfit) <= 0)) {
          setError("Please enter a valid take profit price");
          return;
        }
        if (stopLoss && (isNaN(stopLoss) || parseFloat(stopLoss) <= 0)) {
          setError("Please enter a valid stop loss price");
          return;
        }
      }

      console.log("Placing short order with params:", {
        baseToken,
        USDT_ADDRESS,
        price,
        margin,
        leverage,
        takeProfit,
        stopLoss,
      });

      const priceInWei = ethers.parseEther(price);
      const marginInWei = ethers.parseEther(margin);
      const tpInWei = isTPSLEnabled
        ? ethers.parseEther(takeProfit || "0")
        : ethers.parseEther("0");
      const slInWei = isTPSLEnabled
        ? ethers.parseEther(stopLoss || "0")
        : ethers.parseEther("0");

      // Log the exact parameters being sent to the contract
      const params = {
        baseToken,
        USDT_ADDRESS,
        priceInWei: priceInWei.toString(),
        positionType: 1,
        marginInWei: marginInWei.toString(),
        leverage,
        slInWei: slInWei.toString(),
        tpInWei: tpInWei.toString(),
      };
      console.log("Contract call parameters:", params);

      // Send the transaction with a higher gas limit
      const tx = await limitOrderContract.placeLimitOrder(
        baseToken,
        USDT_ADDRESS,
        priceInWei,
        1, // PositionType.SHORT
        marginInWei,
        leverage,
        slInWei,
        tpInWei
      );
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Short limit order placed successfully");
      setError(null);
    } catch (error) {
      console.error("Error placing short limit order:", error);
      setError(
        error.message ||
          "Failed to place short order. Please check your inputs and try again."
      );
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl w-80 text-white space-y-4">
      {error && (
        <div className="bg-red-500 text-white p-2 rounded text-sm">{error}</div>
      )}

      {/* Contract Address Display */}
      <div className="text-sm text-gray-400 break-all">
        Contract Address: {contractAddress}
      </div>

      {/* Token Selection */}
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
        Token Address: {getCurrentTokenAddress()}
      </div>

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

      {/* Price Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md">
        <input
          placeholder="Price"
          className="bg-transparent text-white flex-1 outline-none"
          value={price}
          type="text"
          onChange={(e) => setPrice(e.target.value)}
        />
        <span className="text-gray-400">USDT</span>
      </div>

      {/* Margin Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md">
        <input
          className="bg-transparent text-white flex-1 outline-none"
          value={margin}
          onChange={(e) => setMargin(e.target.value)}
          placeholder="Enter margin"
        />
        <span className="text-gray-400">USDT</span>
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
        orderType="limit"
        onBuy={handleLong}
        onSell={handleShort}
        liqPrice="--"
        cost="0.00"
        max="0.00"
        disabled={!isReady || !userAddress || !margin}
      />

      <LeverageModal
        show={showLeverageModal}
        onClose={() => setShowLeverageModal(false)}
        onConfirm={(val) => setLeverage(val)}
        currentLeverage={leverage}
      />
    </div>
  );
};

export default Limit;
