const closePosition = async (contractAddress, positionId) => {
    const signer = await getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const tx = await contract.closePosition(positionId);
    await tx.wait();
    return tx;
  };
  
  export default closePosition;
  