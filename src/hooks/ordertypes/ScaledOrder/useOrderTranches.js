import { useContractRead } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../constants/config';

export const useOrderTranches = (orderId) => {
  const { data, isLoading, isError, error } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getOrderTranches',
    args: [orderId],
    watch: true,
  });

  return {
    tranches: data,
    isLoading,
    isError,
    error,
  };
};
