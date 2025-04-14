import { useContract } from './useContract';

export const useDeposit = () => {
  const { contract, isReady } = useContract();

  const depositBalance = async (_user, _token, _amount) => {
    try {
      if (!isReady || !contract) throw new Error("Contract not ready");
      const tx = await contract.depositBalance(_user, _token, _amount);
      await tx.wait();
      console.log('✅ Deposit successful');
    } catch (error) {
      console.error("❌ Deposit error:", error.message || error);
    }
  };

  return { depositBalance };
};
