const isPairSupported = async (contractAddress, baseToken, quoteToken) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const supported = await contract.isPairSupported(baseToken, quoteToken);
    return supported;
  };
  
  export default isPairSupported;
  