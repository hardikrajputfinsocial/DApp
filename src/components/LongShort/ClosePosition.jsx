import React, { useState } from "react";
import { closePosition } from "../../hooks/FutureLongShort/closePositionService";

const ClosePosition = () => {
  const [positionId, setPositionId] = useState("");
  const [status, setStatus] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = async () => {
    if (!positionId) {
      setStatus("Please enter a valid Position ID.");
      return;
    }

    if (!window.ethereum) {
      setStatus("Please connect your wallet first.");
      return;
    }

    try {
      setIsClosing(true);
      setStatus("Processing...");

      const result = await closePosition(positionId);
      setStatus(result.message);
    } catch (error) {
      console.error("Error closing position:", error);
      setStatus(`Error: ${error.message || "Failed to close position"}`);
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Close Position</h2>
      <input
        type="number"
        placeholder="Enter Position ID"
        value={positionId}
        onChange={(e) => setPositionId(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />
      <button
        onClick={handleClose}
        disabled={isClosing}
        style={{
          padding: "10px 20px",
          backgroundColor: isClosing ? "#cccccc" : "#ff4444",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isClosing ? "not-allowed" : "pointer",
        }}
      >
        {isClosing ? "Closing Position..." : "Close Position"}
      </button>
      {status && (
        <p
          style={{
            marginTop: "15px",
            color: status.includes("successfully") ? "green" : "red",
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
};

export default ClosePosition;
