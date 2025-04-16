import { ethers } from "ethers";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";
import { FUTURES_ABI } from "../abis/futures.js";

dotenv.config();

export class ContractService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.contractABI = FUTURES_ABI;
  }

  async executeReadFunction(functionName, ...args) {
    try {
      const contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        this.provider
      );

      const result = await contract[functionName](...args);
      return result;
    } catch (error) {
      logger.error(`Error executing read function ${functionName}:`, error);
      throw error;
    }
  }

  async executeWriteFunction(privateKey, functionName, ...args) {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        wallet
      );

      const tx = await contract[functionName](...args);
      const receipt = await tx.wait();

      logger.info(
        `Transaction for ${functionName} successful: ${receipt.hash}`
      );
      return receipt;
    } catch (error) {
      logger.error(`Error executing write function ${functionName}:`, error);
      throw error;
    }
  }
}
