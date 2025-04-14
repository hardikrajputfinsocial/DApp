import { ethers } from "ethers";
import contractABI from "../../abi/futureLongShortABI.json";
import getSigner from "../../utils/getSigner";

const openPosition = async (
  contractAddress,
  trader,
  baseToken,
  quoteToken,
  positionType, // 0 for LONG, 1 for SHORT
  margin,
  leverage
) => {
  const signer = await getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  const tx = await contract.openPosition(
    trader,
    baseToken,
    quoteToken,
    positionType,
    margin,
    leverage
  );
  await tx.wait();
  return tx;
};

export default openPosition;