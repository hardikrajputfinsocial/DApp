import { useContractRead } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../constants/config';

export const useUserOrders = (userAddress) => {
  const { data, isLoading, isError, error } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserOrders',
    args: [userAddress],
    watch: true,
  });

  return {
    orders: data,
    isLoading,
    isError,
    error,
  };
};
