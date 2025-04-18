// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./IfutureLongShort.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

contract futureLongShort is Ownable,IfutureLongShort, KeeperCompatibleInterface {
    using SafeERC20 for IERC20;
    // uint256 public MAX_LEVERAGE = 20;
    // uint256 constant LEVERAGE_MULTIPLIER = 100;
    uint256 constant BASIS_POINTS = 1e4;
    uint256 constant PRECISION = 1e18;
    uint256 public LIQUIDATION_THRESHOLD = 8000;
    uint256 public platformFeeRate; // Fee rate in basis points (e.g., 25 = 0.25%)
    address public feeCollector;
    // uint256 liquidatorRewardPercentage = 20;
    uint256 public nextPositionId = 1;

    mapping(uint256 => Position) positions;
    mapping(address => uint256[]) public userPositions;
    mapping(address => mapping(address => TokenPair)) supportedPairs;
    mapping(address => mapping(address => uint256)) userBalances;



    constructor(uint256 _initialFeeRate, address _feeCollector)
        Ownable(msg.sender)
    {
        require(_initialFeeRate <= 100, "Fee rate too high");
        require(_feeCollector != address(0), "Invalid fee collector");

        platformFeeRate = _initialFeeRate;
        feeCollector = _feeCollector;
    }
     function depositBalance(
        address _user,
        address _token,
        uint256 _amount
    ) external {
        require(_amount > 0, "Amount must be positive");
        require(_token != address(0), "Invalid token address");
        IERC20(_token).safeTransferFrom(_user, address(this), _amount);
        userBalances[_user][_token] += _amount;
        emit BalanceDeposited(_user, _token, _amount);
    }
    
    function getAllPositionId(address _user) view public returns (uint256[] memory){
        require(userPositions[_user].length > 0 , "User have no active positions");
        return userPositions[_user];
    }
    
    function deductUserBalancesFromWallet(//call this function to deduct money from user's wallet when order is placed
        address _user,
        address _token,
        uint256 _amount
    ) external {
        require(msg.sender.code.length!=0,"not authorized");
       
        require(userBalances[_user][_token] >= _amount, "Insufficient amount");
        userBalances[_user][_token] -= _amount;
    }
     function withdrawBalance(address _token, uint256 _amount) external {
        require(_amount > 0, "Amount must be positive");
        require(_token != address(0), "Invalid token address");
        require(
            userBalances[msg.sender][_token] >= _amount,
            "Insufficient balance"
        );

        userBalances[msg.sender][_token] -= _amount;
        IERC20(_token).safeTransfer(msg.sender, _amount);
        emit BalanceWithdrawn(msg.sender, _token, _amount);
    }
    function getUserWalletBalance(address _user,address _token) external view returns(uint){

        return userBalances[_user][_token];
    }
    function addWalletBalance(address _user,address _token,uint _amount) external{
        require(msg.sender.code.length!=0,"not authorized");
        userBalances[_user][_token]+=_amount;
    }
    function addSupportedPair(
        address _baseToken,//ETH
        address _quoteToken,//USDT
        address _oracleAddress
    ) external override onlyOwner {
        require(
            _baseToken != address(0) && _quoteToken != address(0),
            "Invalid token addresses"
        );
        require(_oracleAddress != address(0), "Invalid oracle address");
        require(
            !supportedPairs[_baseToken][_quoteToken].isSupported,
            "Pair already supported"
        );

        AggregatorV3Interface oracle = AggregatorV3Interface(_oracleAddress);
        oracle.latestRoundData();

        supportedPairs[_baseToken][_quoteToken] = TokenPair({
            isSupported: true,
            oracleAddress: _oracleAddress
        });

        emit PairAdded(_baseToken, _quoteToken, _oracleAddress);
    }
    function isPairSupported(address _baseToken, address _quoteToken)
        external
        view
        returns (bool)
    {
        return supportedPairs[_baseToken][_quoteToken].isSupported;
    }
     function openPosition(
        address _trader,
        address _baseToken,
        address _quoteToken,
        PositionType _positionType,
        uint256 _margin,
        uint256 _leverage
    ) external returns (uint256) {
        require(
            _positionType == PositionType.LONG ||
                _positionType == PositionType.SHORT,
            "Invalid position type"
        );
        require(_margin > 0, "Margin must be positive");
        // require(
        //     _leverage >= LEVERAGE_MULTIPLIER &&
        //         _leverage <= MAX_LEVERAGE * LEVERAGE_MULTIPLIER,
        //     "Invalid leverage"
        // );
        require(
            supportedPairs[_baseToken][_quoteToken].isSupported,
            "Token pair not supported"
        );

        uint256 currentPrice = getCurrentPrice(_baseToken, _quoteToken);
        require(currentPrice > 0, "Invalid price");

        // Calculate position size
        uint256 positionSize = _margin * _leverage;
        uint256 liquidationPrice = calculateLiquidationPrice(
            _positionType,
            currentPrice,
            _leverage
        );

        // Create position
        uint256 positionId = nextPositionId;
        positions[positionId] = Position({
            positionId: positionId,
            positionType: _positionType,
            trader: _trader,
            baseToken: _baseToken,
            quoteToken: _quoteToken,
            positionSize: positionSize,
            margin: _margin,
            leverage: _leverage ,
            entryPrice: currentPrice,
            liquidationPrice: liquidationPrice,
            openTimestamp: block.timestamp,
            isOpen: true,
            pnl:0
        });

        // Track user positions
        userPositions[_trader].push(positionId);
        nextPositionId++;

        // Emit event
        emit PositionOpened(
            positionId,
            _positionType,
            _trader,
            _margin,
            _leverage 
        );

        return positionId;
    }
    function setLiquidationThreshold(uint256 newLT) external onlyOwner {
        LIQUIDATION_THRESHOLD = newLT;
    }
     function refundMargin(
        address _user,
        address _token,
        uint256 _amount
    ) external {
        require(_amount > 0, "Amount must be positive");
        require(_token != address(0), "Invalid token address");
        require(msg.sender.code.length!=0, "Not authorized ");
        uint256 refundFee = (_amount * platformFeeRate) / BASIS_POINTS;
        uint256 actualAmountToRefund = _amount - refundFee;
        userBalances[feeCollector][_token] += refundFee;
        userBalances[_user][_token] += actualAmountToRefund;
        emit marginRefunded(_user, _token, refundFee, actualAmountToRefund);
    }

    function removeSupportedPair(address _baseToken, address _quoteToken)
        external
        onlyOwner
    {
        require(
            supportedPairs[_baseToken][_quoteToken].isSupported,
            "Pair not supported"
        );

        supportedPairs[_baseToken][_quoteToken].isSupported = false;

        emit PairRemoved(_baseToken, _quoteToken);
    }
      function updatePlatformFeeRate(uint256 _newFeeRate) external onlyOwner {
        require(_newFeeRate <= 100, "Fee rate too high"); // Max 1%
        platformFeeRate = _newFeeRate;
    }

    function updateFeeCollector(address _newFeeCollector) external onlyOwner {
        require(_newFeeCollector != address(0), "Invalid fee collector");
        feeCollector = _newFeeCollector;
    }
     function calculateLiquidationPrice(
        PositionType _positionType,
        uint256 _currentPrice,
        uint256 _leverage
    ) internal view returns (uint256) {
        uint256 liquidationThresholdRatio = (LIQUIDATION_THRESHOLD *
            PRECISION) / BASIS_POINTS; // :8000/10000=0.8*10^18
        uint256 priceMovementPercent = liquidationThresholdRatio /
            (_leverage ); //: 0.8/1000*100=0.08*10^18
        uint256 liquidationPrice;
        if (_positionType == PositionType.SHORT)
            liquidationPrice =
                (_currentPrice * (PRECISION + priceMovementPercent)) /
                PRECISION;
        else
            liquidationPrice =
                (_currentPrice * (PRECISION - priceMovementPercent)) /
                PRECISION;

        return liquidationPrice;
    }
      function addMargin(uint256 _positionId, uint256 _additionalMargin)
        external
    {
        require(
            _positionId < nextPositionId && _positionId > 0,
            "Invalid position ID"
        );
        require(_additionalMargin > 0, "Additional margin must be positive");

        Position storage position = positions[_positionId];
        require(position.isOpen, "Position already closed");
        require(position.trader == msg.sender, "Not position owner");

        uint256 newMargin = position.margin + _additionalMargin;

        // Check and update user balance instead of transfer
        require(
            userBalances[msg.sender][position.quoteToken] >= _additionalMargin,
            "Insufficient balance"
        );
        userBalances[msg.sender][position.quoteToken] -= _additionalMargin;

        uint256 currentPrice = getCurrentPrice(
            position.baseToken,
            position.quoteToken
        );
        require(currentPrice > 0, "Invalid price data");

        uint256 newLeverage = position.positionSize /newMargin;

        uint256 newLiquidationPrice = calculateLiquidationPrice(
            position.positionType,
            currentPrice,
            newLeverage
        );

        position.margin = newMargin;
        position.leverage = newLeverage;
        position.liquidationPrice = newLiquidationPrice;

        emit MarginAdded(
            _positionId,
            msg.sender,
            _additionalMargin,
            newMargin,
            newLeverage,
            newLiquidationPrice
        );
    }
    function removeUserPosition(address _user, uint256 _positionId) internal {
        uint256[] storage positionIds = userPositions[_user];
        for (uint256 i = 0; i < positionIds.length; i++) {
            if (positionIds[i] == _positionId) {
                positionIds[i] = positionIds[positionIds.length - 1];
                positionIds.pop();
                break;
            }
        }
    }
     function closePosition(uint256 _positionId) external  {
        require(
            _positionId < nextPositionId && _positionId > 0,
            "Invalid position ID"
        );

        Position storage position = positions[_positionId];
        // require(position.trader == msg.sender, "Not position owner");
        require(position.isOpen, "Position already closed");

        uint256 currentPrice = getCurrentPrice(
            position.baseToken,
            position.quoteToken
        );

        int256 pnl = calculatePnL(position, currentPrice);

        uint256 closingFee = (position.positionSize * platformFeeRate) /
            BASIS_POINTS;

        uint256 settlementAmount;
        if (pnl > 0) {
            settlementAmount = position.margin + uint256(pnl);
        } else {
            settlementAmount = position.margin > uint256(-pnl)
                ? position.margin - uint256(-pnl)
                : 0;
        }

        uint256 finalSettlement = settlementAmount > closingFee
            ? settlementAmount - closingFee
            : 0;
        uint256 actualFee = settlementAmount > closingFee
            ? closingFee
            : settlementAmount;

        position.isOpen = false;
        removeUserPosition(position.trader, _positionId);

        // Update user balance instead of direct transfer
        if (finalSettlement > 0) {
            userBalances[position.trader][position.quoteToken] += finalSettlement;
        }
        if (actualFee > 0) {
            userBalances[feeCollector][position.quoteToken] += actualFee;
        }

        emit PositionClosed(
            _positionId,
            msg.sender,
            currentPrice,
            pnl,
            actualFee,
            block.timestamp
        );

        if (closingFee > 0) {
            emit FeeCollected(msg.sender, actualFee);
        }
        position.pnl=pnl-int(actualFee);
        // return pnl-int(actualFee);
    }
     function canLiquidate(uint256 _positionId)
        public
        view
        returns (bool, uint256)
    {
        require(_positionId < nextPositionId, "Invalid position ID");

        Position storage position = positions[_positionId];
        require(position.isOpen, "position is closed");

        uint256 currentPrice = getCurrentPrice(
            position.baseToken,
            position.quoteToken
        );
        if (currentPrice == 0) {
            return (false, 0);
        }
        if (position.positionType == PositionType.SHORT)
            return (currentPrice >= position.liquidationPrice, currentPrice);
        else return (currentPrice <= position.liquidationPrice, currentPrice);
    }

    function liquidatePosition(uint256 _positionId) external {
        require(_positionId < nextPositionId, "Invalid position ID");
        Position storage position = positions[_positionId];
        require(position.isOpen, "Position already closed");
        (bool _canLiquidate, uint256 currentPrice) = canLiquidate(_positionId);
        require(
            _canLiquidate,
            "Cannot Liquidate due to price not met to liquidation price"
        );
        uint256 liquidationFee = (position.positionSize * platformFeeRate) /
            BASIS_POINTS;
        position.isOpen = false;
        if (liquidationFee > 0) {
            userBalances[feeCollector][
                position.quoteToken
            ] += liquidationFee;
        }
        removeUserPosition(position.trader, _positionId);
        emit PositionLiquidated(
            _positionId,
            position.trader,
            currentPrice,
            liquidationFee,
            block.timestamp
        );
    }
    function getLatestPNL(uint _positionId) internal view returns(int){
        Position storage position = positions[_positionId];
        require(position.isOpen,"position is closed");
        uint currentPrice=getCurrentPrice(position.baseToken, position.quoteToken);
        return calculatePnL(position, currentPrice);
    }
    function calculatePnL(Position storage _position, uint256 _currentPrice)
        internal
        view
        returns (int256)
    {
        if (_position.positionType == PositionType.SHORT) {
            if (_position.entryPrice > _currentPrice) {
                uint256 profit = (_position.positionSize *
                    (_position.entryPrice - _currentPrice)) /
                    _position.entryPrice;
                return int256(profit);
            } else {
                uint256 loss = (_position.positionSize *
                    (_currentPrice - _position.entryPrice)) /
                    _position.entryPrice;
                return -int256(loss);
            }
        } else {
            if (_position.entryPrice < _currentPrice) {
                uint256 profit = (_position.positionSize *
                    (_currentPrice - _position.entryPrice)) /
                    _position.entryPrice;
                return int256(profit);
            } else {
                uint256 loss = (_position.positionSize *
                    (_position.entryPrice - _currentPrice)) /
                    _position.entryPrice;
                return -int256(loss);
            }
        }
    }

    function getCurrentPrice(address _baseToken, address _quoteToken)
        public
        view
        returns (uint256)
    {
        require(
            supportedPairs[_baseToken][_quoteToken].isSupported,
            "Token pair not supported"
        );
        TokenPair memory pair = supportedPairs[_baseToken][_quoteToken];
        (, int256 price, , , ) = AggregatorV3Interface(pair.oracleAddress)
            .latestRoundData();
        require(price > 0, "Invalid price data");
        uint8 decimals = AggregatorV3Interface(pair.oracleAddress).decimals();
        // Convert to a common precision (18 decimals)
        uint256 normalizedPrice = uint256(price) * 10**(18 - decimals);
        return normalizedPrice;
    }
    
     function getPosition(uint256 _positionId)
        public  
        returns (
            Position memory 
        )
    {
        require(
            _positionId < nextPositionId && _positionId > 0,
            "Invalid position ID"
        );

        Position storage position = positions[_positionId];
        if(position.isOpen){
            int pnl=getLatestPNL(_positionId);
            positions[_positionId].pnl=pnl;
        }
        return (position);
    }
//     function updatePnL(uint256 _positionId) external {
//     require(_positionId < nextPositionId && _positionId > 0, "Invalid position ID");
//     if (positions[_positionId].isOpen) {
//         int pnl = getLatestPNL(_positionId);
//         positions[_positionId].pnl = pnl;
//     }
// }

    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory performData) {
        for (uint256 i = 1; i < nextPositionId; i++) {
            if (positions[i].isOpen) {
                (bool canBeLiquidated, uint256 currentPrice) = canLiquidate(i);
                if (canBeLiquidated) {
                    return (true, abi.encode(i, currentPrice));
                }
            }
        }
        return (false, "");
    }

    // Called by Chainlink Keepers when checkUpkeep returns true
    function performUpkeep(bytes calldata performData) external override{
        (uint256 positionId,) = abi.decode(performData, (uint256, uint256));
        this.liquidatePosition(positionId);
    }
    function getAllUserPositions(address _user) external returns (Position[] memory) {
    uint256[] memory allIds = getAllPositionId(_user);
    uint256 len = allIds.length;
    Position[] memory Userpositions = new Position[](len);

    for (uint256 i = 0; i < len; i++) {
        Userpositions[i] = getPosition(allIds[i]);
    }

    return Userpositions;
}
}