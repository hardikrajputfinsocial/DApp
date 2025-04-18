// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IfutureLongShort.sol";
import "./SLTP.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

contract LimitOrderFuture is KeeperCompatibleInterface {
    IfutureLongShort public futuresContract;
    SLTP public sltpContract;

    struct LimitOrderData {
        uint256 orderId;
        address trader;
        IfutureLongShort.PositionType positionType;
        address baseToken;
        address quoteToken;
        uint256 margin;
        uint256 leverage;
        uint256 limitPrice;
        uint256 stopLoss;
        uint256 takeProfit;
        uint256 positionId;
        bool isActive;        
    }
    struct SimplifiedExecutedOrder {
    uint256 orderId;
    address trader;
    IfutureLongShort.PositionType positionType;
    address baseToken;
    address quoteToken;
    uint256 margin;
    uint256 leverage;
    uint256 limitPrice; 
    uint256 stopLoss;
    uint256 takeProfit;
    uint256 positionId;
    uint256 entryPrice;
    uint256 liquidationPrice;
    int PNL;
    bool isOpen;
}


    mapping(uint256 => LimitOrderData) public limitOrders;
    uint256 public orderCounter;

    event LimitOrderPlaced(uint256 indexed orderId, address indexed trader, uint256 limitPrice);
    event LimitOrderExecuted(uint256 indexed orderId, uint256 positionId);
    event LimitOrderCancelled(uint256 indexed orderId, address indexed trader);

    constructor(address _futuresContract, address _sltpContract) {
        futuresContract = IfutureLongShort(_futuresContract);
        sltpContract = SLTP(_sltpContract);
    }

    function placeLimitOrder(
        address _baseToken,
        address _quoteToken,
        uint256 _limitPrice,
        IfutureLongShort.PositionType _positionType,
        uint256 _margin,
        uint256 _leverage,
        uint256 _stopLoss,
        uint256 _takeProfit    
    ) external {
        uint256 userBalance = futuresContract.getUserWalletBalance(msg.sender, _quoteToken);
        require(userBalance >= _margin, "Insufficient balance");

        // Deduct margin from user wallet
        futuresContract.deductUserBalancesFromWallet(msg.sender, _quoteToken, _margin);

        // Store order
        orderCounter++;
        limitOrders[orderCounter] = LimitOrderData({
            orderId: orderCounter,
            trader: msg.sender,
            positionType: _positionType,
            baseToken: _baseToken,
            quoteToken: _quoteToken,
            margin: _margin,
            leverage: _leverage,
            limitPrice: _limitPrice,
            stopLoss: _stopLoss,
            takeProfit: _takeProfit,
            positionId: 0,
            isActive: true
            
        });

        emit LimitOrderPlaced(orderCounter, msg.sender, _limitPrice);
    }


    function cancelLimitOrder(uint256 _orderId) external {
        LimitOrderData storage order = limitOrders[_orderId];
        require(order.trader == msg.sender, "Only trader can cancel");
        require(order.isActive, "Order is not active");
        require(order.positionId == 0, "Position already opened");

        order.isActive = false;

        // Refund margin to user
        futuresContract.refundMargin(order.trader, order.quoteToken, order.margin);

        emit LimitOrderCancelled(_orderId, msg.sender);
    }

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        for (uint256 i = 1; i <= orderCounter; i++) {
            LimitOrderData memory order = limitOrders[i];
            if (order.isActive && order.positionId == 0 ) {

                // change by man vaghani
                uint256 currentPrice = futuresContract.getCurrentPrice(order.baseToken, order.quoteToken);
                uint256 lowerBound = order.limitPrice - ((order.limitPrice * 5) / 1000); 
                uint256 upperBound = order.limitPrice + ((order.limitPrice * 5) / 1000); 
                if (
                    (order.positionType == IfutureLongShort.PositionType.LONG && currentPrice >= lowerBound && currentPrice <= upperBound) ||
                    (order.positionType == IfutureLongShort.PositionType.SHORT && currentPrice >= lowerBound && currentPrice <= upperBound)
                ) {
                    return (true, abi.encode(i));
                }
            }
        }
        return (false, "");
    }

    function performUpkeep(bytes calldata performData) external override {
        uint256 orderId = abi.decode(performData, (uint256));
        LimitOrderData storage order = limitOrders[orderId];
        require(order.isActive && order.positionId == 0, "Invalid or already opened order");

        // Open the position
        uint256 positionId = futuresContract.openPosition(
            order.trader,
            order.baseToken,
            order.quoteToken,
            order.positionType,
            order.margin,
            order.leverage
        );

        // Confirm position is open
        IfutureLongShort.Position memory pos = futuresContract.getPosition(positionId);
        require(pos.isOpen, "Failed to open position");

        order.positionId = positionId;
        // Set SLTP
        if(order.stopLoss > 0 && order.takeProfit > 0){
            sltpContract.setSLTP(positionId, order.stopLoss, order.takeProfit);
        }
        
        emit LimitOrderExecuted(orderId, positionId);
    }
    
    function getPendingLimitOrders(address user) external view returns (LimitOrderData[] memory) {
    uint256 count = 0;

    // Count matching orders
    for (uint256 i = 1; i <= orderCounter; i++) {
        if (limitOrders[i].trader == user && limitOrders[i].positionId == 0 && limitOrders[i].isActive) {
            count++;
        }
    }

    LimitOrderData[] memory pendingOrders = new LimitOrderData[](count);
    uint256 index = 0;

    // Populate the result
    for (uint256 i = 1; i <= orderCounter; i++) {
        if (limitOrders[i].trader == user && limitOrders[i].positionId == 0 && limitOrders[i].isActive) {
            pendingOrders[index] = limitOrders[i];
            index++;
        }
    }

    return pendingOrders;
}

function getExecutedLimitOrders(address user) external  returns (SimplifiedExecutedOrder[] memory) {
    uint256 count = 0;

    for (uint256 i = 1; i <= orderCounter; i++) {
        if (limitOrders[i].trader == user && limitOrders[i].positionId != 0) {
            count++;
        }
    }

    SimplifiedExecutedOrder[] memory executedOrders = new SimplifiedExecutedOrder[](count);
    uint256 index = 0;

    for (uint256 i = 1; i <= orderCounter; i++) {
        if (limitOrders[i].trader == user && limitOrders[i].positionId != 0) {
            LimitOrderData memory order = limitOrders[i];
            IfutureLongShort.Position memory pos = futuresContract.getPosition(order.positionId);

            executedOrders[index] = SimplifiedExecutedOrder({
                orderId: order.orderId,
                trader: order.trader,
                positionType: order.positionType,
                baseToken: order.baseToken,
                quoteToken: order.quoteToken,
                margin: order.margin,
                leverage: order.leverage,
                limitPrice: order.limitPrice,
                stopLoss: order.stopLoss,
                takeProfit: order.takeProfit,
                positionId: pos.positionId,
                entryPrice: pos.entryPrice,
                liquidationPrice: pos.liquidationPrice,
                PNL : pos.pnl,
                isOpen: pos.isOpen
            });

            index++;
        }
    }

    return executedOrders;
}


}
