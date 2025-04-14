import { useState, useEffect } from "react";

const useTokenAddresses = () => {
  const [tokenAddresses, setTokenAddresses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hardcoded token addresses
    // Replace these with your actual token addresses
    const addresses = {
      "BTC/USDT": "0xF56038e8AC0d882d7F24dd32411a10BA1a037614",
      "ETH/USDT": "0xAbd4293F3440A1EEFBbF2838B87C41F0620011E1",
      "BNB/USDT": "0x1Ca98845bc078f58576D623A68b0EB96A228C722",
      "SOL/USDT": "0x897904bA20478Fb2fB7cF8DA0c8a13dab1a6b23D",
      "FIN/USDT": "0x6EEAD95C1195E1120b9D0dA6b3e78b127B355884",
    };

    // Simulate loading delay
    setTimeout(() => {
      setTokenAddresses(addresses);
      setLoading(false);
    }, 500);
  }, []);

  return { tokenAddresses, loading };
};

export default useTokenAddresses;
