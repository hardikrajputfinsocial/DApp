// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IfutureLongShort.sol";
import "./SLTP.sol";
contract MarketOrder  {
    IfutureLongShort public futuresContract;
    SLTP sltp;
    struct MarketOrderData {
        uint256 positionId;
        address trader;
        IfutureLongShort.PositionType positionType;
        address baseToken;
        address quoteToken;
        uint256 margin;
        uint256 leverage;
        bool isActive;
        uint256 SL;
        uint256 TP;
    }
    struct SimplifiedUserOrderWithPosition {
    uint256 orderId;
    uint256 positionId;
    address trader;
    IfutureLongShort.PositionType positionType;
    address baseToken;
    address quoteToken;
    uint256 margin; 
    uint256 leverage;
    uint256 stopLoss;
    uint256 takeProfit;
    // from Position struct
    uint256 entryPrice;
    int PNL;
    bool isOpen;
    uint256 openTime;
    }
    mapping(uint256 => MarketOrderData) public MarketOrders;
    uint256 public orderCounter;

    event MarketOrderPlaced(uint256 indexed orderId, uint256 indexed positionId, address indexed trader);
    constructor(address _futuresContract , address _SLTP) {
        futuresContract = IfutureLongShort(_futuresContract);
        sltp = SLTP(_SLTP);
    }

    function placeMarketOrder(
        address _baseToken,
        address _quoteToken,
        IfutureLongShort.PositionType _positionType,
        uint256 _margin,
        uint256 _leverage,
        uint256 _sl,
        uint256 _tp
    ) external {
        uint256 userBalance = futuresContract.getUserWalletBalance(msg.sender, _quoteToken);
        require(userBalance >= _margin, "Insufficient balance to place order");
    
        futuresContract.deductUserBalancesFromWallet(msg.sender, _quoteToken, _margin);

        uint256 positionId = futuresContract.openPosition(
            msg.sender,
            _baseToken,
            _quoteToken,
            _positionType,
            _margin,
            _leverage         
        );

        orderCounter++;
        MarketOrders[orderCounter] = MarketOrderData({
            positionId: positionId,
            trader: msg.sender,
            positionType: _positionType,
            baseToken: _baseToken,
            quoteToken: _quoteToken,
            margin: _margin,
            leverage: _leverage,
            isActive: true,
            SL : _sl,
            TP : _tp
        });
        if(_sl > 0 && _tp > 0){
            sltp.setSLTP(positionId, _sl, _tp);
        }
        
        emit MarketOrderPlaced(orderCounter, positionId, msg.sender);
    }
   
//    function getUserOrders(address _user) external view returns (MarketOrderData[] memory) {
//     // First count how many orders belong to the user
//     uint256 count = 0;
//     for (uint256 i = 1; i <= orderCounter; i++) {
//         if (MarketOrders[i].trader == _user) {
//             count++;
//         }
//     }

//     // Create a fixed-size array to hold user orders
//     MarketOrderData[] memory userOrders = new MarketOrderData[](count);
//     uint256 index = 0;

//     // Populate the array
//     for (uint256 i = 1; i <= orderCounter; i++) {
//         if (MarketOrders[i].trader == _user) {
//             userOrders[index] = MarketOrders[i];
//             index++;
//         }
//     }

//     return userOrders;
// }   


function getUserOrders(address _user) external  returns (SimplifiedUserOrderWithPosition[] memory) {
    uint256 count = 0;

    // Count how many orders belong to the user
    for (uint256 i = 1; i <= orderCounter; i++) {
        if (MarketOrders[i].trader == _user) {
            count++;
        }
    }

    SimplifiedUserOrderWithPosition[] memory userOrders = new SimplifiedUserOrderWithPosition[](count);
    uint256 index = 0;

    for (uint256 i = 1; i <= orderCounter; i++) {
        if (MarketOrders[i].trader == _user) {
            MarketOrderData memory order = MarketOrders[i];
            IfutureLongShort.Position memory pos = futuresContract.getPosition(order.positionId);

            userOrders[index] = SimplifiedUserOrderWithPosition({
                orderId: i,
                positionId: order.positionId,
                trader: order.trader,
                positionType: order.positionType,
                baseToken: order.baseToken,
                quoteToken: order.quoteToken,
                margin: order.margin,
                leverage: order.leverage,
                stopLoss: order.SL,
                takeProfit: order.TP,
                entryPrice: pos.entryPrice,
                PNL: pos.pnl,
                isOpen: pos.isOpen,
                openTime: pos.openTimestamp
            });

            index++;
        }
    }

    return userOrders;
}

}
