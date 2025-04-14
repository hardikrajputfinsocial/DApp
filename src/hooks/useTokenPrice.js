import { useState, useEffect } from "react";

const useTokenPrice = (tokenPair) => {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call to get token price
        // This is a mock implementation
        const mockPrices = {
          "BTC/USDT": 65000,
          "ETH/USDT": 3500,
          "BNB/USDT": 400,
          "SOL/USDT": 100,
          "FIN/USDT": 1.5,
        };

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setPrice(mockPrices[tokenPair]);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, [tokenPair]);

  return { price, loading, error };
};

export default useTokenPrice;
