import { useContract } from './useContract';

export const useDeductBalance = () => {
  const contract = useContract();

  const deductBalance = async (_user, _token, _amount) => {
    try {
      if (!contract) throw new Error("Contract not loaded");
      const tx = await contract.deductUserBalancesFromWallet(_user, _token, _amount);
      await tx.wait();
      console.log('✅ Deducted balance from user');
    } catch (error) {
      console.error("❌ Deduction error:", error);
    }
  };

  return { deductBalance };
};
