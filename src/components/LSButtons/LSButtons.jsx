import React from "react";

const LSButtons = ({
  orderType,
  onBuy,
  onSell,
  liqPrice = "--",
  cost = "0.00",
  max = "0.00",
}) => {
  return (
    <>
      <div className="flex justify-between items-center space-x-4 mt-4">
        <button
          onClick={onBuy}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold"
        >
          Buy / Long
        </button>
        <button
          onClick={onSell}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold"
        >
          Sell / Short
        </button>
      </div>

      <div className="grid grid-cols-2 text-xs text-gray-400 mt-2">
        <div>
          <div>
            Liq Price -- <span className="text-white">{liqPrice} USDT</span>
          </div>
          <div>
            Cost {cost} <span className="text-white">USDT</span>
          </div>
          <div>
            Max {max} <span className="text-white">BNB</span>
          </div>
        </div>
        <div className="text-right">
          <div>
            Liq Price -- <span className="text-white">{liqPrice} USDT</span>
          </div>
          <div>
            Cost {cost} <span className="text-white">USDT</span>
          </div>
          <div>
            Max {max} <span className="text-white">BNB</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default LSButtons;
