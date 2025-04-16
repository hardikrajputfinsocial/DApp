import { ethers } from "ethers";
import { ContractService } from "./contract.service.js";
import { logger } from "../utils/logger.js";

export class FuturesService {
  constructor() {
    this.contractService = new ContractService();
  }

  _formatFuture(futureData) {
    const [
      id,
      name,
      description,
      creator,
      expiryDate,
      strikePrice,
      isFulfilled,
    ] = futureData;
    return {
      id: id.toString(),
      name,
      description,
      creator,
      expiryDate: Number(expiryDate),
      strikePrice: ethers.formatEther(strikePrice),
      isFulfilled,
    };
  }

  async getAllFutures() {
    try {
      const futuresCount = await this.contractService.executeReadFunction(
        "getFuturesCount"
      );
      const futures = [];

      for (let i = 0; i < futuresCount; i++) {
        const future = await this.contractService.executeReadFunction(
          "getFuture",
          i
        );
        futures.push(this._formatFuture(future));
      }

      return futures;
    } catch (error) {
      logger.error("Error getting all futures:", error);
      throw error;
    }
  }

  async getFutureById(id) {
    try {
      const future = await this.contractService.executeReadFunction(
        "getFuture",
        id
      );
      return this._formatFuture(future);
    } catch (error) {
      logger.error(`Error getting future ${id}:`, error);
      throw error;
    }
  }

  async createFuture(futureData, privateKey) {
    try {
      const receipt = await this.contractService.executeWriteFunction(
        privateKey,
        "createFuture",
        futureData.name,
        futureData.description,
        futureData.expiryDate,
        ethers.parseEther(futureData.strikePrice.toString())
      );

      // Get the newly created future ID from events
      const futuresCount = await this.contractService.executeReadFunction(
        "getFuturesCount"
      );
      const newFutureId = futuresCount - 1;

      // Get the future details
      const future = await this.contractService.executeReadFunction(
        "getFuture",
        newFutureId
      );
      return this._formatFuture(future);
    } catch (error) {
      logger.error("Error creating future:", error);
      throw error;
    }
  }

  async updateFuture(id, updateData, privateKey) {
    try {
      await this.contractService.executeWriteFunction(
        privateKey,
        "updateFuture",
        id,
        updateData.name,
        updateData.description,
        updateData.expiryDate,
        ethers.parseEther(updateData.strikePrice.toString())
      );

      // Get the updated future
      const future = await this.contractService.executeReadFunction(
        "getFuture",
        id
      );
      return this._formatFuture(future);
    } catch (error) {
      logger.error(`Error updating future ${id}:`, error);
      throw error;
    }
  }

  async fulfillFuture(id, privateKey) {
    try {
      await this.contractService.executeWriteFunction(
        privateKey,
        "fulfillFuture",
        id
      );

      // Get the updated future
      const future = await this.contractService.executeReadFunction(
        "getFuture",
        id
      );
      return this._formatFuture(future);
    } catch (error) {
      logger.error(`Error fulfilling future ${id}:`, error);
      throw error;
    }
  }
}
