// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IfutureLongShort.sol";

contract FuturesTWAP is KeeperCompatibleInterface {
    IfutureLongShort public futuresContract;

    struct OrderConfig {
        address user;
        address baseToken;
        address quoteToken;
        uint256 margin;
        uint256 leverage;
        IfutureLongShort.PositionType tradeType;
    }
    
    struct OrderSchedule {
        uint256 batchSize;
        uint256 interval;
        uint256 closeStartTime;
        uint256 lastExecutionTime;
    }

    struct OrderState {
        bool isActive;
        bool isOpen;
        uint256[] positionIds;
        uint256 batchesOpened;
        uint256 batchesClosed;
    }

    struct TWAPOrder {
        OrderConfig config;
        OrderSchedule schedule;
        OrderState state;
    }

    mapping(address => TWAPOrder[]) public userOrders;
    address[] public users;
    mapping(address => bool) public isUserAdded;

    event OrderPlaced(
    address indexed user,
    uint256 indexed orderIndex,
    uint256 margin,
    uint256 batchSize,
    uint256 interval
);

event PositionOpened(
    address indexed user,
    uint256 indexed orderIndex,
    uint256 batchNumber,
    uint256 positionId,
    uint256 marginUsed
);

event PositionClosed(
    address indexed user,
    uint256 indexed orderIndex,
    uint256 batchNumber,
    uint256 positionId
);

event OrderCancelled(address indexed user, uint256 indexed orderIndex, uint256 refundAmount);

event OrderFullyExecuted(address indexed user, uint256 indexed orderIndex);



    constructor(address _futuresContract) {
        futuresContract = IfutureLongShort(_futuresContract);
    }

    function placeTWAPOrder(
        address _user,
        address _baseToken,
        address _quoteToken,
        uint256 _margin,
        uint256 _leverage,
        IfutureLongShort.PositionType _tradeType,
        uint256 _batchSize,
        uint256 _interval,
        uint256 _closeStartTime
    ) external {
        require(_batchSize > 0 && _interval > 0, "Invalid batch or interval");
        require(_closeStartTime > block.timestamp, "Close start time should be in future");

        uint256 balance = futuresContract.getUserWalletBalance(msg.sender, _quoteToken);
        require(balance >= _margin, "Insufficient balance");

        futuresContract.deductUserBalancesFromWallet(msg.sender, _quoteToken, _margin);

        TWAPOrder memory order = TWAPOrder({
            config: OrderConfig({
               // user: msg.sender,
               user: _user,
                baseToken: _baseToken,
                quoteToken: _quoteToken,
                margin: _margin,
                leverage: _leverage,
                tradeType: _tradeType
            }),
            schedule: OrderSchedule({
                batchSize: _batchSize,
                interval: _interval,
                closeStartTime: _closeStartTime,
                lastExecutionTime: block.timestamp
            }),
            state: OrderState({
                isActive: true,
                isOpen: false,
                positionIds: new uint256[](0),
                batchesOpened: 0,
                batchesClosed: 0
            })
        });

        userOrders[_user].push(order);

        if (!isUserAdded[_user]) {
            users.push(_user);
            isUserAdded[_user] = true;
        }
        emit OrderPlaced(msg.sender, userOrders[_user].length - 1, _margin, _batchSize, _interval);

    }

    function checkUpkeep(bytes calldata) external view override returns (bool, bytes memory) {
        for (uint256 u = 0; u < users.length; u++) {
            address user = users[u];
            TWAPOrder[] memory orders = userOrders[user];
            for (uint256 i = 0; i < orders.length; i++) {
                TWAPOrder memory order = orders[i];
                if (!order.state.isActive) continue;

                if (!order.state.isOpen && block.timestamp >= order.schedule.lastExecutionTime + order.schedule.interval) {
                    return (true, abi.encode(user, i, true));
                }

                if (
                    order.state.isOpen &&
                    order.state.batchesClosed < order.schedule.batchSize &&
                    block.timestamp >= order.schedule.closeStartTime + (order.state.batchesClosed * order.schedule.interval)
                ) {
                    return (true, abi.encode(user, i, false));
                }
            }
        }
        return (false, "");
    }

    function performUpkeep(bytes calldata performData) external override {
        (address user, uint256 index, bool isOpening) = abi.decode(performData, (address, uint256, bool));
        TWAPOrder storage order = userOrders[user][index];

        if (!order.state.isActive) return;

        if (isOpening && !order.state.isOpen && order.state.batchesOpened < order.schedule.batchSize) {
            uint256 marginPerBatch = order.config.margin / order.schedule.batchSize;
            if (order.state.batchesOpened == order.schedule.batchSize - 1) {
                marginPerBatch = order.config.margin - (marginPerBatch * (order.schedule.batchSize - 1));
            }

            uint256 posId = futuresContract.openPosition(
                order.config.user,
                order.config.baseToken,
                order.config.quoteToken,
                order.config.tradeType,
                marginPerBatch,
                order.config.leverage
            );
            order.state.positionIds.push(posId);
            order.state.batchesOpened++;
            order.schedule.lastExecutionTime = block.timestamp;
            emit PositionOpened(user, index, order.state.batchesOpened - 1, posId, marginPerBatch);

            if (order.state.batchesOpened == order.schedule.batchSize) {
                order.state.isOpen = true;
            }
        } else if (order.state.isOpen && order.state.batchesClosed < order.state.positionIds.length) {
            uint256 posIdToClose = order.state.positionIds[order.state.batchesClosed];
            emit PositionClosed(user, index, order.state.batchesClosed, posIdToClose);
            futuresContract.closePosition(posIdToClose);
            order.state.batchesClosed++;
            

            if (order.state.batchesClosed == order.schedule.batchSize) {
                order.state.isActive = false;
                emit OrderFullyExecuted(user, index);
            }
        }
    }


function cancelTWAPOrder(uint256 orderIndex) external {
    require(orderIndex < userOrders[msg.sender].length, "Invalid order index");

    TWAPOrder storage order = userOrders[msg.sender][orderIndex];
    require(order.state.isActive, "Order already inactive or cancelled");
    require(order.state.batchesOpened < order.schedule.batchSize, "All batches already opened");

    uint256 unopenedBatches = order.schedule.batchSize - order.state.batchesOpened;
    uint256 marginPerBatch = order.config.margin / order.schedule.batchSize;
    uint256 refundAmount = unopenedBatches * marginPerBatch;
    if (order.state.batchesOpened == order.schedule.batchSize - 1) {
        refundAmount = order.config.margin - (marginPerBatch * order.state.batchesOpened);
    }

    
    order.schedule.batchSize = order.state.batchesOpened;
    order.state.isOpen = true; 


    futuresContract.refundMargin( msg.sender,order.config.quoteToken, refundAmount);

    emit OrderCancelled(msg.sender, orderIndex, refundAmount);
}


    function getOrders(address user) external view returns (TWAPOrder[] memory) {
        return userOrders[user];
    }
}
