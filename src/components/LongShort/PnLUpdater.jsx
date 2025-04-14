import React, { useState } from "react";
import { updatePnL } from "../../hooks/FutureLongShort/updatePnLService"; // Adjust path if needed

const PnLUpdater = () => {
  const [positionId, setPositionId] = useState("");
  const [status, setStatus] = useState("");

  const handleUpdate = async () => {
    if (!positionId) return alert("Please enter a valid position ID.");
    setStatus("Updating...");

    const success = await updatePnL(positionId);
    setStatus(success ? "PnL updated successfully!" : "Failed to update PnL.");
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Update Position PnL</h2>
      <input
        type="number"
        placeholder="Enter Position ID"
        value={positionId}
        onChange={(e) => setPositionId(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />
      <button onClick={handleUpdate} style={{ padding: "10px 20px" }}>
        Update PnL
      </button>
      {status && <p style={{ marginTop: "15px" }}>{status}</p>}
    </div>
  );
};

export default PnLUpdater;
