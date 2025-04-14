const getPosition = async (contractAddress, positionId) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const position = await contract.getPosition(positionId);
    return position;
  };
  
  export default getPosition;
  