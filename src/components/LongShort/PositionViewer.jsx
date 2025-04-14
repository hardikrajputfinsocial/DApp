import React, { useState } from "react";
import { getPosition } from "../../hooks/FutureLongShort/getPositionService";
import { ethers } from "ethers";
import contractABI from "../../abis/futureLongShort.json";

const PositionViewer = () => {
  const [positionId, setPositionId] = useState("");
  const [position, setPosition] = useState(null);
  const [error, setError] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  const contractAddress = import.meta.env.VITE_FUTURE_LONG_SHORT;

  const handleFetch = async () => {
    setError("");
    const data = await getPosition(positionId);
    if (!data) {
      setError("Could not fetch position. Make sure ID is valid.");
    } else {
      setPosition(data);
    }
  };

  const handleClosePosition = async () => {
    if (!position || !window.ethereum) {
      setError("Please connect your wallet and ensure position is loaded");
      return;
    }

    try {
      setIsClosing(true);
      setError("");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      console.log("Closing position:", positionId);
      const tx = await contract.closePosition(BigInt(positionId));
      console.log("Close position transaction:", tx);

      // Wait for transaction to be mined
      await tx.wait();
      console.log("Position closed successfully");

      // Refresh position data
      await handleFetch();
    } catch (err) {
      console.error("Error closing position:", err);
      setError(err.message || "Failed to close position");
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Get Position Details</h2>
      <input
        type="number"
        placeholder="Enter Position ID"
        value={positionId}
        onChange={(e) => setPositionId(e.target.value)}
        style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
      />
      <button onClick={handleFetch} style={{ padding: "10px 15px" }}>
        Fetch Position
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {position && (
        <div style={{ marginTop: "20px", lineHeight: "1.6" }}>
          <h3>Position #{position.positionId}</h3>
          <p>
            <strong>Trader:</strong> {position.trader}
          </p>
          <p>
            <strong>Base Token:</strong> {position.baseToken}
          </p>
          <p>
            <strong>Quote Token:</strong> {position.quoteToken}
          </p>
          <p>
            <strong>Position Type:</strong> {position.positionType}
          </p>
          <p>
            <strong>Position Size:</strong> {position.positionSize}
          </p>
          <p>
            <strong>Margin:</strong> {position.margin}
          </p>
          <p>
            <strong>Leverage:</strong> {position.leverage}x
          </p>
          <p>
            <strong>Entry Price:</strong> {position.entryPrice}
          </p>
          <p>
            <strong>Liquidation Price:</strong> {position.liquidationPrice}
          </p>
          <p>
            <strong>PnL:</strong> {position.pnl}
          </p>
          <p>
            <strong>Is Open:</strong> {position.isOpen ? "Yes" : "No"}
          </p>
          <p>
            <strong>Opened On:</strong> {position.openTimestamp}
          </p>

          {position.isOpen && (
            <button
              onClick={handleClosePosition}
              disabled={isClosing}
              style={{
                padding: "10px 20px",
                backgroundColor: "#ff4444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isClosing ? "not-allowed" : "pointer",
                marginTop: "20px",
              }}
            >
              {isClosing ? "Closing Position..." : "Close Position"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PositionViewer;
