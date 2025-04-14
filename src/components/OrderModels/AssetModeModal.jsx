import React from "react";

const AssetModeModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg w-[420px] relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <div className="mb-4 flex items-center space-x-2">
          <span className="bg-gray-700 px-2 py-1 rounded">USDⓢ-M</span>
        </div>

        <h2 className="text-lg font-semibold mb-4">Asset Mode</h2>

        <div className="space-y-4">
          {/* Single-Asset Mode */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-teal-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h3 className="text-md font-semibold">Single-Asset Mode</h3>
            </div>
            <p className="text-sm text-gray-300">
              • Supports USDⓢ-M Futures trading by only using the single margin
              asset of the symbol. <br />
              • PNL of the same margin asset positions can be offset. <br />
              • Supports Cross Margin Mode and Isolated Margin Mode.
            </p>
          </div>

          {/* Multi-Assets Mode */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex space-x-1">
                <span className="bg-orange-400 w-5 h-5 rounded-full" />
                <span className="bg-green-400 w-5 h-5 rounded-full" />
              </div>
              <h3 className="text-md font-semibold">Multi-Assets Mode</h3>
            </div>
            <p className="text-sm text-gray-300">
              • USDⓢ-M Futures trading across multiple margin assets. <br />
              • PNL can be offset among the different margin asset positions.{" "}
              <br />
              • Only supports Cross Margin Mode.
            </p>
          </div>
        </div>

        {/* Info Note */}
        <p className="text-xs text-gray-400 mt-4">
          * Please note that BUSD can only be used as collateral in
          Multi-Assets Mode. Switching to Single-Asset Mode may cause changes
          in your position liquidation price due to the reduction of margin.
          Multi-Assets Mode only applies to USDⓢ-M Futures. Before activating
          Multi-Assets Mode, please read the{" "}
          <a href="#" className="underline text-blue-400">
            guide
          </a>{" "}
          in detail to better manage USDⓢ-M Futures account risk accordingly
          when using Multi-Assets Mode.
        </p>
      </div>
    </div>
  );
};

export default AssetModeModal;
