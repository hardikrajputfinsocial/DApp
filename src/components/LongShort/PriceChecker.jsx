import React, { useState } from "react";
import { getCurrentPrice } from "../../hooks/FutureLongShort/getPriceService"; // Adjust path if needed

const PriceChecker = () => {
  const [baseToken, setBaseToken] = useState("");
  const [quoteToken, setQuoteToken] = useState("");
  const [price, setPrice] = useState(null);

  const handleCheckPrice = async () => {
    try {
      const fetchedPrice = await getCurrentPrice(baseToken, quoteToken);
      setPrice(fetchedPrice);
    } catch (error) {
      alert("Error fetching price.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Token Price Checker</h2>
      <input
        type="text"
        placeholder="Base token address"
        value={baseToken}
        onChange={(e) => setBaseToken(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />
      <input
        type="text"
        placeholder="Quote token address"
        value={quoteToken}
        onChange={(e) => setQuoteToken(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />
      <button onClick={handleCheckPrice} style={{ padding: "10px 20px" }}>
        Get Price
      </button>

      {price !== null && (
        <div style={{ marginTop: "15px" }}>
          <strong>Price:</strong> {price}
        </div>
      )}
    </div>
  );
};

export default PriceChecker;
