import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import CalculatorContainer from "../Calcultors/CalculatorContainer";
import LeverageModal from "../OrderModels/LeverageModal";
import LSButtons from "../LSButtons/LSButtons";
import useTokenAddresses from "../../hooks/useTokenAddresses";
import ScaledOrderABI from "../../abis/ScaledOrder.json";

// Use a hardcoded address for now to ensure we're using the correct one
const USDT_ADDRESS = "0x7362c1e29584834d501353E684718e47329FCC53";
const SCALED_ORDER_ADDRESS = import.meta.env.VITE_SCALED_ORDER;

const ScaledOrder = () => {
  const [totalMargin, setTotalMargin] = useState("");
  const [startPrice, setStartPrice] = useState("");
  const [endPrice, setEndPrice] = useState("");
  const [numTranches, setNumTranches] = useState(5);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedToken, setSelectedToken] = useState("BTC/USDT");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);

  const [showCalculator, setShowCalculator] = useState(false);

  const [leverage, setLeverage] = useState(20);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  
  const [scaledOrderContract, setScaledOrderContract] = useState(null);
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
          console.log("Initializing scaled order contract at address:", SCALED_ORDER_ADDRESS);

          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);
          console.log("User address:", address);

          // Check if contract exists at the address
          const code = await provider.getCode(SCALED_ORDER_ADDRESS);
          if (code === "0x") {
            throw new Error(
              `No contract deployed at address: ${SCALED_ORDER_ADDRESS}`
            );
          }
          console.log("Contract code found at address");

          const contract = new ethers.Contract(
            SCALED_ORDER_ADDRESS,
            ScaledOrderABI,
            signer
          );

          // Verify the contract has the expected methods
          if (!contract.createScaledOrder) {
            throw new Error("Contract does not have createScaledOrder method");
          }

          console.log("Contract initialized successfully");
          setScaledOrderContract(contract);
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

  // Get the current token address
  const getCurrentTokenAddress = () => {
    return tokenAddresses[selectedToken] || "";
  }

  const handleLong = async () => {
    if (!isReady || !scaledOrderContract || !userAddress) {
      setError("Contract not ready or wallet not connected");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      if (!totalMargin || !startPrice || !endPrice || !numTranches) {
        setError("Please fill in all required fields");
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
      if (isNaN(totalMargin) || parseFloat(totalMargin) <= 0) {
        setError("Please enter a valid margin amount");
        setLoading(false);
        return;
      }

      if (isNaN(startPrice) || parseFloat(startPrice) <= 0) {
        setError("Please enter a valid start price");
        setLoading(false);
        return;
      }

      if (isNaN(endPrice) || parseFloat(endPrice) <= 0) {
        setError("Please enter a valid end price");
        setLoading(false);
        return;
      }

      if (isNaN(numTranches) || parseInt(numTranches) < 2) {
        setError("Please enter at least 2 tranches");
        setLoading(false);
        return;
      }

      // Convert values to appropriate format for contract
      const marginInWei = ethers.parseUnits(totalMargin, 18);
      const startPriceInWei = ethers.parseUnits(startPrice, 18);
      const endPriceInWei = ethers.parseUnits(endPrice, 18);
      
      // Call the createScaledOrder function
      const tx = await scaledOrderContract.createScaledOrder(
        baseToken,
        USDT_ADDRESS,
        0, // PositionType.LONG
        marginInWei,
        BigInt(leverage),
        startPriceInWei,
        endPriceInWei,
        parseInt(numTranches)
      );

      console.log("Long scaled order placed successfully", tx);
      await tx.wait();
      console.log("Transaction confirmed");
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error("Error placing long scaled order:", error);
      setError(
        error.message ||
          "Failed to place long order. Please check your inputs and try again."
      );
      setLoading(false);
    }
  };

  const handleShort = async () => {
    if (!isReady || !scaledOrderContract || !userAddress) {
      setError("Contract not ready or wallet not connected");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      if (!totalMargin || !startPrice || !endPrice || !numTranches) {
        setError("Please fill in all required fields");
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
      if (isNaN(totalMargin) || parseFloat(totalMargin) <= 0) {
        setError("Please enter a valid margin amount");
        setLoading(false);
        return;
      }

      if (isNaN(startPrice) || parseFloat(startPrice) <= 0) {
        setError("Please enter a valid start price");
        setLoading(false);
        return;
      }

      if (isNaN(endPrice) || parseFloat(endPrice) <= 0) {
        setError("Please enter a valid end price");
        setLoading(false);
        return;
      }

      if (isNaN(numTranches) || parseInt(numTranches) < 2) {
        setError("Please enter at least 2 tranches");
        setLoading(false);
        return;
      }

      // Convert values to appropriate format for contract
      const marginInWei = ethers.parseUnits(totalMargin, 18);
      const startPriceInWei = ethers.parseUnits(startPrice, 18);
      const endPriceInWei = ethers.parseUnits(endPrice, 18);
      
      // Call the createScaledOrder function
      const tx = await scaledOrderContract.createScaledOrder(
        baseToken,
        USDT_ADDRESS,
        1, // PositionType.SHORT
        marginInWei,
        BigInt(leverage),
        startPriceInWei,
        endPriceInWei,
        parseInt(numTranches)
      );

      console.log("Short scaled order placed successfully", tx);
      await tx.wait();
      console.log("Transaction confirmed");
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error("Error placing short scaled order:", error);
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

        {/* Leverage Button */}
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

      {/* Leverage Modal */}
      <LeverageModal
        show={showLeverageModal}
        onClose={() => setShowLeverageModal(false)}
        onConfirm={(val) => setLeverage(val)}
        currentLeverage={leverage}
      />

      {/* Total Margin Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md">
        <div>Total Margin</div>
        <input
          className="bg-transparent text-white flex-1 outline-none px-2"
          value={totalMargin}
          onChange={(e) => setTotalMargin(e.target.value)}
          placeholder="0.00"
          type="number"
          step="0.01"
          min="0"
        />
        <span className="text-gray-400">USDT</span>
      </div>

      {/* Start Price Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md">
        <div>Start Price</div>
        <input
          className="bg-transparent text-white flex-1 outline-none px-2"
          value={startPrice}
          onChange={(e) => setStartPrice(e.target.value)}
          placeholder="0.00"
          type="number"
          step="0.01"
          min="0"
        />
        <span className="text-gray-400">USDT</span>
      </div>

      {/* End Price Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md">
        <div>End Price</div>
        <input
          className="bg-transparent text-white flex-1 outline-none px-2"
          value={endPrice}
          onChange={(e) => setEndPrice(e.target.value)}
          placeholder="0.00"
          type="number"
          step="0.01"
          min="0"
        />
        <span className="text-gray-400">USDT</span>
      </div>

      {/* Number of Tranches Input */}
      <div className="flex items-center bg-gray-800 p-2 rounded-md">
        <div>Number of Tranches</div>
        <input
          className="bg-transparent text-white flex-1 outline-none px-2"
          value={numTranches}
          onChange={(e) => setNumTranches(e.target.value)}
          placeholder="5"
          type="number"
          step="1"
          min="2"
          max="50"
        />
      </div>

      <LSButtons
        orderType="scaled"
        onBuy={handleLong}
        onSell={handleShort}
        liqPrice="--"
        cost={totalMargin || "0.00"}
        max="0.00"
        disabled={loading}
        loading={loading}
      />
    </div>
  );
};

export default ScaledOrder;
