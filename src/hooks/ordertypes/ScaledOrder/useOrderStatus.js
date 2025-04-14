import { useContractRead } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../constants/config';

export const useOrderStatus = (orderId) => {
  const { data, isLoading, isError, error } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getOrderStatus',
    args: [orderId],
    watch: true,
  });

  const [state, executedTranches, totalTranches, remainingMargin, isExpired] = data || [];

  return {
    status: {
      state,
      executedTranches,
      totalTranches,
      remainingMargin,
      isExpired,
    },
    isLoading,
    isError,
    error,
  };
};
