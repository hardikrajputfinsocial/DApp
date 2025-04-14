const getCurrentPrice = async (contractAddress, baseToken, quoteToken) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const price = await contract.getCurrentPrice(baseToken, quoteToken);
    return price;
};

export default getCurrentPrice;