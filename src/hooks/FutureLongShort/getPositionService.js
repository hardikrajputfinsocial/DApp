import { ethers } from "ethers";
import contractABI from "../../abis/futureLongShort.json";

const contractAddress = import.meta.env.VITE_FUTURE_LONG_SHORT;
const RPC_URL =
  import.meta.env.VITE_RPC_URL ||
  "https://eth-sepolia.g.alchemy.com/v2/7MR1wZl9NIUNNmZDTz8jpivjjEz-sYW3";

// Create a singleton provider instance
let provider = null;

const getProvider = () => {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_URL, {
      name: "sepolia",
      chainId: 11155111,
    });
  }
  return provider;
};

// Map position type enum to string
const getPositionTypeString = (type) => {
  console.log("=== Position Type Debug ===");
  console.log("Raw position type value:", type);
  console.log("Position type type:", typeof type);
  // Convert to number if it's a BigInt
  const numericType = typeof type === "bigint" ? Number(type) : type;
  console.log("Numeric position type:", numericType);
  const result = numericType === 0 ? "LONG" : "SHORT";
  console.log("Final position type string:", result);
  console.log("=== End Position Type Debug ===");
  return result;
};

export async function getPosition(positionId) {
  try {
    console.log("Fetching position for ID:", positionId);
    const provider = getProvider();
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );

    // Use callStatic to make a read-only call
    const position = await contract.getPosition.staticCall(positionId);
    console.log("Raw position data:", position);

    // Map the tuple to an object with keys matching the Position struct
    const result = {
      positionId: position[0].toString(),
      positionType: getPositionTypeString(position[1]), // Convert enum to string
      trader: position[2],
      baseToken: position[3],
      quoteToken: position[4],
      positionSize: ethers.formatUnits(position[5], 18),
      margin: ethers.formatUnits(position[6], 18),
      leverage: position[7].toString(),
      entryPrice: ethers.formatUnits(position[8], 18),
      liquidationPrice: ethers.formatUnits(position[9], 18),
      openTimestamp: new Date(Number(position[10]) * 1000).toLocaleString(),
      isOpen: position[11],
      pnl: ethers.formatUnits(position[12], 18),
    };

    console.log("=== Final Position Data ===");
    console.log("Processed position data:", result);
    console.log("Position type in result:", result.positionType);
    console.log("=== End Final Position Data ===");
    return result;
  } catch (error) {
    console.error("Failed to fetch position:", error);
    return null;
  }
}
