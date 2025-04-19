// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "./IfutureLongShort.sol";
import "hardhat/console.sol";

contract SLTP is KeeperCompatibleInterface {
    IfutureLongShort public futuresContract;

    struct SLTPOrder {
        address trader;
        uint256 stopLoss;
        uint256 takeProfit;
        bool isActive;
    }

    mapping(uint256 => SLTPOrder) public sLTPOrders;
    uint256[] public activePositions;

    event SLTPSet(uint256 indexed positionId, address indexed trader, uint256 stopLoss, uint256 takeProfit);
    event SLTPExecuted(uint256 indexed positionId, address indexed trader, string action);

    constructor(address _futuresContract) {
        futuresContract = IfutureLongShort(_futuresContract);
    }

    function setSLTP(uint256 _positionId, uint256 _stopLoss, uint256 _takeProfit) external {
        IfutureLongShort.Position memory pos = futuresContract.getPosition(_positionId);
        console.log("position id",pos.positionId);
        //require(msg.sender == pos.trader, "Only trader can set SL/TP");
        require(pos.isOpen, "Position not open");

        sLTPOrders[_positionId] = SLTPOrder({
            trader: pos.trader,
            stopLoss: _stopLoss,
            takeProfit: _takeProfit,
            isActive: true
        });

        activePositions.push(_positionId);
        emit SLTPSet(_positionId, pos.trader, _stopLoss, _takeProfit);
    }

    function checkUpkeep(bytes calldata) external  override returns (bool upkeepNeeded, bytes memory performData) {
        for (uint256 i = 0; i < activePositions.length; i++) {
            uint256 positionId = activePositions[i];

            if (sLTPOrders[positionId].isActive) {
                IfutureLongShort.Position memory pos = futuresContract.getPosition(positionId);
                if (!pos.isOpen) continue;

                uint256 currentPrice = futuresContract.getCurrentPrice(pos.baseToken, pos.quoteToken);

                // SLTP logic based on position type
                if (
                    (pos.positionType == IfutureLongShort.PositionType.LONG && 
                        (currentPrice <= sLTPOrders[positionId].stopLoss || currentPrice >= sLTPOrders[positionId].takeProfit)) ||

                    (pos.positionType == IfutureLongShort.PositionType.SHORT && 
                        (currentPrice >= sLTPOrders[positionId].stopLoss || currentPrice <= sLTPOrders[positionId].takeProfit))
                ) { 
                    return (true, abi.encode(positionId));
                }
            }
        }
        return (false, "");
    }

    function performUpkeep(bytes calldata performData) external override {
        uint256 positionId = abi.decode(performData, (uint256));
        if (!sLTPOrders[positionId].isActive) return;

        IfutureLongShort.Position memory pos = futuresContract.getPosition(positionId);
        if (!pos.isOpen) return;

        uint256 currentPrice = futuresContract.getCurrentPrice(pos.baseToken, pos.quoteToken);
        bool shouldClose = false;
        string memory reason = "";
        
        if (pos.positionType == IfutureLongShort.PositionType.LONG) {
            if (currentPrice <= sLTPOrders[positionId].stopLoss) {
                shouldClose = true;
                reason = "Stop Loss";
            } else if (currentPrice >= sLTPOrders[positionId].takeProfit) {
                shouldClose = true;
                reason = "Take Profit";
            }
        } else if (pos.positionType == IfutureLongShort.PositionType.SHORT) {
            if (currentPrice >= sLTPOrders[positionId].stopLoss) {
                shouldClose = true;
                reason = "Stop Loss";
            } else if (currentPrice <= sLTPOrders[positionId].takeProfit) {
                shouldClose = true;
                reason = "Take Profit";
            }
        }

        if (shouldClose) {
            futuresContract.closePosition(positionId);
            emit SLTPExecuted(positionId, sLTPOrders[positionId].trader, reason);
            removeActivePosition(positionId);
        }
    }
    
    function removeActivePosition(uint256 _positionId) internal {
        delete sLTPOrders[_positionId];

        for (uint256 i = 0; i < activePositions.length; i++) {
            if (activePositions[i] == _positionId) {
                activePositions[i] = activePositions[activePositions.length - 1];
                activePositions.pop();
                break;
            }
        }
    }
}
