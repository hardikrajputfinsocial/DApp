// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IfutureLongShort.sol";

interface IScaledOrder {
    // Enums
     enum OrderState {
        PENDING,  
        ACTIVE,
        COMPLETED,
        CANCELLED
    }
    
    // Structs
    struct orderPositionDetails{
        uint orderId;
        Tranche[] tranche;
    }
    struct OrderDetails {
    uint256 orderId;
    ScaledOrderInfo orderInfo;
}
    
    struct ScaledOrderInfo {
        address trader;
        address baseToken;
        address quoteToken;
        IfutureLongShort.PositionType positionType;
        uint256 totalMargin;
        uint256 leverage;
        uint256 remainingMargin;
        uint256 startPrice;
        uint256 endPrice;
        uint16 numTranches;
        uint16 executedTranches;
        OrderState state;
        // uint expirationTimestamp;
    }
    event positionClosed(address trader,uint orderId,uint totalPossitionsClosed,int pnl);
    struct Tranche {
        uint256 triggerPrice;
        uint256 margin;
        uint256 positionId;
        bool executed;
        bool isOpen;
    }

    // Events
    event ScaledOrderCreated(
        uint256 indexed orderId,
        address indexed trader,
        IfutureLongShort.PositionType positionType,
        uint256 totalMargin,
        uint256 leverage,
        uint256 startPrice,
        uint256 endPrice
    );
    event OrderCancelled(uint256 indexed orderId, address indexed trader);
    event TrancheExecuted(
        uint256 indexed orderId,
        uint256 indexed trancheIndex,
        uint256 triggerPrice,
        uint256 margin,
        uint256 positionId,
        uint256 currentPrice
    );
    event OrderCompleted(uint256 indexed orderId, OrderState state);
    event OrderExpiredWithRefund(
        uint256 indexed orderId,
        address indexed trader,
        uint16 executedTranches,
        uint16 totalTranches
    );
    event OrderActivated(uint256 indexed orderId, address indexed trader);

    // Functions
    function createScaledOrder(
        address baseToken,
        address quoteToken,
        IfutureLongShort.PositionType _positionType,
        uint256 _totalMargin,
        uint256 _leverage,
        uint256 _startPrice,
        uint256 _endPrice,
        uint16 _numTranches
        // uint256 _expiryDuration
    ) external;

    // function executeTranches(uint256 _orderId, uint256 _trancheIndex,uint currentPrice) external;

    function cancelOrder(uint256 _orderId) external;

    function getUserOrders(address _user) external view returns (orderPositionDetails [] memory);

    function getOrderTranches(uint256 _orderId) external view returns (Tranche[] memory);

    function getOrderStatus(uint256 _orderId) external view returns (
        OrderState state,
        uint16 executedTranches,
        uint16 totalTranches,
        uint256 remainingMargin
    );
    function getAllUserOrderDetails(address _user) external view returns (OrderDetails[] memory) ;
    function getPendingOrders(address _user) external view returns (OrderDetails[] memory);
} 