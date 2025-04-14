import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../constants/config';
import { toast } from 'react-toastify';

export const useCancelOrder = () => {
  const {
    write: cancelOrderWrite,
    data,
    isLoading,
    isError,
    error,
  } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'cancelOrder',
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => toast.success('✅ Order cancelled and margin refunded.'),
    onError: () => toast.error('❌ Failed to cancel the order.'),
  });

  const cancelOrder = (orderId) => {
    if (!orderId) return;
    cancelOrderWrite({ args: [orderId] });
  };

  return {
    cancelOrder,
    isLoading,
    isConfirming,
    isSuccess,
    isError,
    error,
    txHash: data?.hash,
  };
};
