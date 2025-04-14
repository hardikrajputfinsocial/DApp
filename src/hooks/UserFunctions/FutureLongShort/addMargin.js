const addMargin = async (contractAddress, positionId, additionalMargin) => {
    const signer = await getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const tx = await contract.addMargin(positionId, additionalMargin);
    await tx.wait();
    return tx;
  };
  
  export default addMargin;
  