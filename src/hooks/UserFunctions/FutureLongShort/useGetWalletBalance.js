import { useContract } from './useContract';

export const useGetWalletBalance = () => {
  const contract = useContract();

  const getWalletBalance = async (_user, _token) => {
    try {
      if (!contract) throw new Error("Contract not loaded");
      const balance = await contract.getUserWalletBalance(_user, _token);
      return balance;
    } catch (error) {
      console.error("❌ Get balance error:", error);
      return 0;
    }
  };

  return { getWalletBalance };
};
