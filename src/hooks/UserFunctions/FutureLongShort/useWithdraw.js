import { useContract } from './useContract';

export const useWithdraw = () => {
  const contract = useContract();

  const withdrawBalance = async (_token, _amount) => {
    try {
      if (!contract) throw new Error("Contract not loaded");
      const tx = await contract.withdrawBalance(_token, _amount);
      await tx.wait();
      console.log('✅ Withdrawal successful');
    } catch (error) {
      console.error("❌ Withdrawal error:", error);
    }
  };

  return { withdrawBalance };
};
