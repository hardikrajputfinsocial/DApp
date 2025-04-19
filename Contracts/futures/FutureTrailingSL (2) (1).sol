// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "./IfutureLongShort.sol";

contract TrailingSL is KeeperCompatibleInterface {
    IfutureLongShort public futuresContract;

    struct Order {
        address user;
        uint positionId;
        address baseToken;
        address quoteToken;
        uint256 margin;
        uint256 leverage;
        IfutureLongShort.PositionType tradeType;
        uint256 tslPercent;
        bool isActive;
        uint256 peakPrice;
        uint256 targetPrice;
        uint256 tslPrice;
    }

    address[] public usersList;
    mapping(address => Order[]) public userOrders;
    mapping(address => bool) public isUserAdded;

    event OrderPlaced(
        address indexed user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 tslPercent,
        bool isActive,
        uint256 peakPrice,
        uint256 targetPrice,
        uint256 tslPrice
    );

    event PriceUpdated(address user, uint orderIndex, uint256 newPeakPrice, uint256 newTslPrice);
    event OrderClosed(address user, uint orderIndex, uint256 closePrice);

    constructor(address _futuresContract) {
        futuresContract = IfutureLongShort(_futuresContract);
    }

    function placeOrder(
        address _user,
        address _baseToken,
        address _quoteToken,
        uint256 _margin,
        uint256 _leverage,
        IfutureLongShort.PositionType _positionType,
        uint256 _targetPrice,
        uint256 _tslPercent
    ) external {
        require(_baseToken != address(0) && _quoteToken != address(0), "Invalid token address");
        require(_margin > 0, "Margin must be greater than 0");
        require(_tslPercent > 0, "TSL percent must be greater than 0");

        uint256 userBalance = futuresContract.getUserWalletBalance(_user, _quoteToken);
        require(userBalance >= _margin, "Insufficient balance");

        uint256 entryPrice = futuresContract.getCurrentPrice(_baseToken, _quoteToken);
        futuresContract.deductUserBalancesFromWallet(msg.sender, _quoteToken, _margin);
        uint256 _positionId = futuresContract.openPosition(_user, _baseToken, _quoteToken, _positionType, _margin, _leverage);

        uint256 initialTSL = (_positionType == IfutureLongShort.PositionType.LONG)
            ? entryPrice - (entryPrice * _tslPercent) / 100
            : entryPrice + (entryPrice * _tslPercent) / 100;

        Order memory newOrder = Order({
            user: _user,
            positionId: _positionId,
            baseToken: _baseToken,
            quoteToken: _quoteToken,
            margin: _margin,
            leverage: _leverage,
            tradeType: _positionType,
            tslPercent: _tslPercent,
            isActive: true,
            peakPrice: entryPrice,
            targetPrice: _targetPrice,
            tslPrice: initialTSL
        });

        if (!isUserAdded[_user]) {
            usersList.push(_user);
            isUserAdded[_user] = true;
        }

        userOrders[_user].push(newOrder);

        emit OrderPlaced(
            _user,
            _baseToken,
            _quoteToken,
            _margin,
            _tslPercent,
            true,
            entryPrice,
            _targetPrice,
            initialTSL
        );
    }

    function updateTrailingPrice(address user, uint orderIndex) internal {
        Order storage order = userOrders[user][orderIndex];
        uint256 currentPrice = futuresContract.getCurrentPrice(order.baseToken, order.quoteToken);

        if (order.tradeType == IfutureLongShort.PositionType.LONG) {
            if (currentPrice > order.peakPrice) {
                order.peakPrice = currentPrice;
                order.tslPrice = currentPrice - (currentPrice * order.tslPercent) / 100;
                emit PriceUpdated(user, orderIndex, order.peakPrice, order.tslPrice);
            }
        } else if (order.tradeType == IfutureLongShort.PositionType.SHORT) {
            if (currentPrice < order.peakPrice) {
                order.peakPrice = currentPrice;
                order.tslPrice = currentPrice + (currentPrice * order.tslPercent) / 100;
                emit PriceUpdated(user, orderIndex, order.peakPrice, order.tslPrice);
            }
        }
    }

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        uint totalExecutableOrders = 0;
        uint maxOrders = 10;
        address[] memory executableUsers = new address[](maxOrders);
        uint[] memory executableOrderIndices = new uint[](maxOrders);

        for (uint u = 0; u < usersList.length && totalExecutableOrders < maxOrders; u++) {
            address user = usersList[u];
            Order[] memory orders = userOrders[user];

            for (uint i = 0; i < orders.length && totalExecutableOrders < maxOrders; i++) {
                Order memory order = orders[i];
                if (!order.isActive) continue;

                uint256 currentPrice = futuresContract.getCurrentPrice(order.baseToken, order.quoteToken);

                if (order.tradeType == IfutureLongShort.PositionType.LONG) {
                    if (currentPrice > order.peakPrice || currentPrice >= order.targetPrice || currentPrice <= order.tslPrice) {
                        executableUsers[totalExecutableOrders] = user;
                        executableOrderIndices[totalExecutableOrders] = i;
                        totalExecutableOrders++;
                    }
                } else {
                    if (currentPrice < order.peakPrice || currentPrice <= order.targetPrice || currentPrice >= order.tslPrice) {
                        executableUsers[totalExecutableOrders] = user;
                        executableOrderIndices[totalExecutableOrders] = i;
                        totalExecutableOrders++;
                    }
                }
            }
        }

        if (totalExecutableOrders > 0) {
            return (true, abi.encode(executableUsers, executableOrderIndices, totalExecutableOrders));
        }

        return (false, "");
    }

    function performUpkeep(bytes calldata performData) external override {
        (address[] memory users, uint[] memory indices, uint total) = abi.decode(performData, (address[], uint[], uint));

        for (uint i = 0; i < total; i++) {
            address user = users[i];
            uint orderIndex = indices[i];
            Order storage order = userOrders[user][orderIndex];

            if (!order.isActive) continue;

            updateTrailingPrice(user, orderIndex); // ✅ Update trailing first
            uint256 currentPrice = futuresContract.getCurrentPrice(order.baseToken, order.quoteToken);

            bool shouldClose = false;

            if (order.tradeType == IfutureLongShort.PositionType.LONG) {
                shouldClose = (currentPrice >= order.targetPrice || currentPrice <= order.tslPrice);
            } else {
                shouldClose = (currentPrice <= order.targetPrice || currentPrice >= order.tslPrice);
            }

            if (shouldClose) {
                futuresContract.closePosition(order.positionId);
                order.isActive = false;
                emit OrderClosed(user, orderIndex, currentPrice);
            }
        }
    }

    function getOrders(address user) external view returns (Order[] memory) {
        return userOrders[user];
    }
}
