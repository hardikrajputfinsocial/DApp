import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import ContractABI from '../../../abis/futureLongShort.json';
const CONTRACT_ADDRESS = '0x68706dE8FC057d0e002d14C5866E291af5F1dA97';

export const useContract = () => {
  const [contract, setContract] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadContract = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, ContractABI, signer);
        setContract(contractInstance);
        setIsReady(true);
      }
    };
    loadContract();
  }, []);

  return { contract, isReady };
};
