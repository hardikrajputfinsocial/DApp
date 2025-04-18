// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IfutureLongShort {
    struct TokenPair {
        bool isSupported;
        address oracleAddress;
    }

    struct Position {
        uint256 positionId;
        PositionType positionType;
        address trader;
        address baseToken;
        address quoteToken;
        uint256 positionSize;
        uint256 margin;
        uint256 leverage;
        uint256 entryPrice;
        uint256 liquidationPrice;
        uint256 openTimestamp;
        bool isOpen;
        int pnl;
    }
    enum PositionType { LONG, SHORT }

    event PositionOpened(
        uint256 indexed positionId, 
        PositionType _positionType, 
        address indexed trader, 
        uint256 margin, 
        uint256 leverage
    );
    event MarginAdded(
        uint256 indexed positionId,  
        uint256 additionalMargin, 
        uint256 newMargin
    );
    event BalanceDeposited(address indexed user, address indexed token, uint256 amount);
    event BalanceWithdrawn(address indexed user, address indexed token, uint256 amount);
    function addWalletBalance(address _user,address _token,uint _amount) external;
    
     event PairAdded(
        address indexed baseToken,
        address indexed quoteToken,
        address OracleAddress
    );
    event MarginAdded(
        uint256 indexed positionId,
        address indexed trader,
        uint256 additionalMargin,
        uint256 newMargin,
        uint256 newLeverage,
        uint256 newLiquidationPrice
    );
    event PairRemoved(address indexed baseToken, address indexed quoteToken);
    event PositionOpened(
        uint256 indexed positionId,
        PositionType _positionType,
        address indexed trader,
        address baseToken,
        address quoteToken,
        uint256 positionSize,
        uint256 margin,
        uint256 leverage,
        uint256 entryPrice,
        uint256 openTimestamp
    );
    event PositionClosed(
        uint256 indexed positionId,
        address indexed trader,
        uint256 closePrice,
        int256 profitAndLoss,
        uint256 fee,
        uint256 closingTimestamp
    );
    event PositionLiquidated(
        uint256 indexed positionId,
        address indexed trader,
        uint256 currentPrice,
        uint256 fee,
        uint256 liquidationTimestamp
    );
    // event marginRefunded(
    //     address user,
    //     address token,
    //     uint feeCollected,
    //     uint amountRefunded
    // );
    event marginRefunded(address _user, address _token, uint _expirationFee, uint refundedAmount);

    function refundMargin(address _user,address _token,uint256 _amount) external ;
    event FeeCollected(address indexed trader, uint256 fee);
    function getUserWalletBalance(address user,address _token) external view returns(uint);
    // function getNormalizedPrice(address _baseToken,address _quoteToken,uint _price) external view returns(uint) ;
    function openPosition(
        address _trader,
        address _baseToken,
        address _quoteToken,
        PositionType _positionType,
        uint256 _margin,
        uint256 _leverage
    ) external returns (uint256);
     function deductUserBalancesFromWallet(address _user,address _token,uint _amount) external ;
    function closePosition(uint256 _positionId) external ;
    function liquidatePosition(uint256 _positionId) external;
    function addSupportedPair(
        address _baseToken,
        address _quoteToken,
        address _oracleAddress
    ) external;
    
    function depositBalance(
        address _user,
        address _token,
        uint256 _amount
    ) external;
    function isPairSupported(address _baseToken, address _quoteToken) external view returns (bool);
    function getCurrentPrice(address _baseToken, address _quoteToken) external view returns (uint256);
     function getPosition(uint256 _positionId)
        external
        returns (
            Position memory 
        );
    


    

}