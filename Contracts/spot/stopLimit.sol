// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "./SLTP.sol";
import "./IfutureLongShort.sol";

contract stopLimit is KeeperCompatibleInterface {
 
    // futureLongAndShort public futures;
    IfutureLongShort tradingPlatform;
    SLTP public sltp;
    struct StopLimitData {
        uint256 positionId;
        address user;
        address baseToken;
        address quoteToken;
        uint256 margin;
        uint256 leverage;
        uint256 stopPrice;
        uint256 limitPrice;
        IfutureLongShort.PositionType positionType;
        bool triggered;
        uint256 SL;
        uint256 TP;
    }

    mapping(address => StopLimitData[]) public userPositions;
    address[] public userList;
    mapping(address => bool) public isUserAdded;
   
    uint256 public constant LIQUIDATION_THRESHOLD = 80; // 80% margin loss triggers liquidation
    uint256 public constant Slippage = 1; // 1% slippage

    event StopLimitOrderPlace(
        address indexed user,
        uint256 index
    );
    event PositionClosed(address indexed user, uint256 index, uint256 pnl);
    event PositionLiquidated(address indexed user, uint256 index);

    constructor(address _future , address _sltp) {
        tradingPlatform = IfutureLongShort(_future);
        sltp = SLTP(_sltp);
    }
    struct baseParam{
        address trader;
        address baseToken;
        address quoteToken;
        uint256 margin;
        uint256 leverage;
        uint256 stopPrice;
        uint256 limitPrice;
    }

    function PlaceStopLimitOrder(
        address _trader,
        address _baseToken,
        address _quoteToken,
        uint256 _margin,
        uint256 _leverage,
        uint256 _stopPrice,
        uint256 _limitPrice,
        IfutureLongShort.PositionType _positionType,
        uint256 _sl,
        uint256 _tp
    ) external {
        require(
            tradingPlatform.isPairSupported(_baseToken, _quoteToken),
            "Pair not supported"
        );
        uint256 userBalance = tradingPlatform.getUserWalletBalance(msg.sender, _quoteToken);
        require(userBalance >= _margin, "Insufficient balance to place order");

        
        require(
            _baseToken != address(0) &&
            _quoteToken != address(0) &&
            _trader != address(0),
            "Invalid token address"
        );
        require(_margin > 0 && _leverage > 0, "Invalid margin or leverage");
         tradingPlatform.deductUserBalancesFromWallet(msg.sender, _quoteToken, _margin);

        
        //uint256 _positionId = tradingPlatform.openPosition(_trader,_baseToken,_quoteToken,_positionType,_margin,_leverage);

        userPositions[_trader].push(
            StopLimitData(
                0,
                _trader,
                _baseToken,
                _quoteToken,
                _margin,
                _leverage,
                _stopPrice,
                _limitPrice,
                _positionType,
                false,
                _sl,
                _tp
            )
        );
        if (!isUserAdded[_trader]) {
            userList.push(_trader);
            isUserAdded[_trader] = true;
        }

        emit StopLimitOrderPlace(
            _trader,
            userPositions[_trader].length - 1
        );
    }

   function checkUpkeep(bytes calldata)
    external
    override
    returns (bool upkeepNeeded, bytes memory performData)
{
    address[] memory tempUsers = new address[](userList.length * 10);
    uint256[] memory tempIndices = new uint256[](userList.length * 10);
    uint256 totalExecutableOrders = 0;

    for (
        uint256 u = 0;
        u < userList.length;
        u++
    ) {
        address user = userList[u];
        for (
            uint256 i = 0;
            i < userPositions[user].length;
            i++
        ) {
            StopLimitData storage position = userPositions[user][i];
            uint256 currentPrice = CurrentPrice(position.baseToken, position.quoteToken);

            if (position.positionType == IfutureLongShort.PositionType.LONG) {
                if (!position.triggered && currentPrice >= position.stopPrice) {
                    position.triggered = true;
                    uint256 _positionId = tradingPlatform.openPosition(
                        position.user,
                        position.baseToken,
                        position.quoteToken,
                        IfutureLongShort.PositionType.LONG,
                        position.margin,
                        position.leverage
                    );
                    position.positionId = _positionId;
                    if (position.SL > 0 && position.TP > 0) {
                        sltp.setSLTP(position.positionId, position.SL, position.TP);
                    }
                }

                if (position.triggered && currentPrice >= position.limitPrice && getPositionActive(position.positionId)) {
                    tempUsers[totalExecutableOrders] = user;
                    tempIndices[totalExecutableOrders] = i;
                    totalExecutableOrders++;
                }
            }

            if (position.positionType == IfutureLongShort.PositionType.SHORT) {
                if (!position.triggered && currentPrice <= position.stopPrice) {
                    position.triggered = true;
                    uint256 _positionId = tradingPlatform.openPosition(
                        position.user,
                        position.baseToken,
                        position.quoteToken,
                        IfutureLongShort.PositionType.SHORT,
                        position.margin,
                        position.leverage
                    );
                    position.positionId = _positionId;
                    if (position.SL > 0 && position.TP > 0) {
                        sltp.setSLTP(position.positionId, position.SL, position.TP);
                    }
                }

                if (position.triggered && currentPrice <= position.limitPrice && getPositionActive(position.positionId)) {
                    tempUsers[totalExecutableOrders] = user;
                    tempIndices[totalExecutableOrders] = i;
                    totalExecutableOrders++;
                }
            }
        }
    }

    if (totalExecutableOrders > 0) {
        // Trim to actual size
        address[] memory executableUsers = new address[](totalExecutableOrders);
        uint256[] memory executableIndices = new uint256[](totalExecutableOrders);
        for (uint256 j = 0; j < totalExecutableOrders; j++) {
            executableUsers[j] = tempUsers[j];
            executableIndices[j] = tempIndices[j];
        }

        return (
            true,
            abi.encode(executableUsers, executableIndices, totalExecutableOrders)
        );
    } else {
        return (false, "");
    }
}

 



    function performUpkeep(bytes calldata performData) external override {
        (
            address[] memory executableUsers,
            uint256[] memory executableIndices,
            uint256 totalExecutableOrders
        ) = abi.decode(performData, (address[], uint256[], uint256));
        for (uint256 i = 0; i < totalExecutableOrders; i++) {
            executePosition(executableUsers[i], executableIndices[i]);
        }
    }

    function CurrentPrice(address _baseToken, address _quoteToken)
        public
        view
        returns (uint256)
    {
        uint256 livePrice = tradingPlatform.getCurrentPrice(_baseToken, _quoteToken);
        return  livePrice  ;
    }

    function executePosition(address _user, uint256 _index) internal {
        StopLimitData storage position = userPositions[_user][_index];
        // if (!position.isActive) return;
        if(!getPositionActive(position.positionId)) return;
        uint256 currentPrice = CurrentPrice(
            position.baseToken,
            position.quoteToken
        );

        if (currentPrice >= position.limitPrice) {
  
            uint256 amountOut = position.margin;
            if (amountOut == 0) return;
            console.log("Amount Out:", amountOut);

            tradingPlatform.closePosition(position.positionId);
        }
    }

     function getPositionActive(uint256 positionId) internal returns (bool) {
        IfutureLongShort.Position memory pos = tradingPlatform.getPosition(positionId);
        
        return (pos.isOpen);
        
    }

    function cancelOrder(uint256 _orderIndex) external {
        require(isUserAdded[msg.sender],"user Not Addes");
        require(_orderIndex < userPositions[msg.sender].length,"Index out of bounds");        
        StopLimitData storage data = userPositions[msg.sender][_orderIndex];
        require(data.positionId == 0 , "your position already created");
        tradingPlatform.refundMargin(msg.sender,data.quoteToken,data.margin);       
        for (uint256 i = _orderIndex; i < userPositions[msg.sender].length - 1; i++) {
        userPositions[msg.sender][i] = userPositions[msg.sender][i + 1];
        }       
        userPositions[msg.sender].pop();   
    }
    
    function getMyPositions() external view returns (StopLimitData[] memory) {
    return userPositions[msg.sender];
    }
function getPendingStopLimitOrders(address _user) external view returns (StopLimitData[] memory) {
    StopLimitData[] storage all = userPositions[_user];
    uint256 count = 0;

    for (uint256 i = 0; i < all.length; i++) {
        if (all[i].positionId == 0) {
            count++;
        }
    }

    StopLimitData[] memory pendingOrders = new StopLimitData[](count);
    uint256 j = 0;
    for (uint256 i = 0; i < all.length; i++) {
        if (all[i].positionId == 0) {
            pendingOrders[j] = all[i];
            j++;
        }
    }

    return pendingOrders;
}

function getActiveStopLimitOrders(address _user) external view returns (StopLimitData[] memory) {
    StopLimitData[] storage all = userPositions[_user];
    uint256 count = 0;

    for (uint256 i = 0; i < all.length; i++) {
        if (all[i].positionId != 0) {
            count++;
        }
    }

    StopLimitData[] memory activeOrders = new StopLimitData[](count);
    uint256 j = 0;
    for (uint256 i = 0; i < all.length; i++) {
        if (all[i].positionId != 0) {
            activeOrders[j] = all[i];
            j++;
        }
    }

    return activeOrders;
}

}
