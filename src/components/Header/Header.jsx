import React, { useState } from "react";
import {
  MarginModeModal,
  LeverageModal,
  AssetModeModal,
} from "../OrderModels/index";

const Header = () => {
  const [showModal, setShowModal] = useState(false);
  const [marginMode, setMarginMode] = useState("Cross");
  const [leverageModalOpen, setLeverageModalOpen] = useState(false);
  const [selectedLeverage, setSelectedLeverage] = useState(20);
  const [assetModeOpen, setAssetModeOpen] = useState(false);

  const handleConfirm = (mode) => {
    setMarginMode(mode.charAt(0).toUpperCase() + mode.slice(1));
    setShowModal(false);
  };

  return (
    <div>
      <div className="app-container">
        <div className="flex justify-between">
          <button
            onClick={() => setShowModal(true)}
            className="bg-gray-700 px-3 py-1 rounded"
          >
            {marginMode}
          </button>
          <button
            onClick={() => setLeverageModalOpen(true)}
            className="bg-gray-700 px-3 py-1 rounded"
          >
            {selectedLeverage}x
          </button>
          <button
            onClick={() => setAssetModeOpen(true)}
            className="bg-gray-700 px-3 py-1 rounded"
          >
            S
          </button>
        </div>

        <LeverageModal
          show={leverageModalOpen}
          onClose={() => setLeverageModalOpen(false)}
          onConfirm={setSelectedLeverage}
          currentLeverage={selectedLeverage}
        />

        <MarginModeModal
          tokenName="ETHUSDT"
          // quantity={percentage || "0"}
          defaultMode={marginMode.toLowerCase()}
          showModal={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
        />

        <AssetModeModal
          show={assetModeOpen}
          onClose={() => setAssetModeOpen(false)}
        />
      </div>
    </div>
  );
};

export default Header;
