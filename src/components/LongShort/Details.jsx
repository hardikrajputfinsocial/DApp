import DepositForm from "./DepositForm";
import WithdrawForm from "./WithdrawForm";
import BalanceChecker from "./BalanceChecker";
import PositionViewer from "./PositionViewer";
import PriceChecker from "./PriceChecker";
import PnLUpdater from "./PnLUpdater";
import ClosePosition from "./ClosePosition";
import "./Details.css";

import React from "react";

const Details = () => {
  return (
    <div className="details-grid">
      <DepositForm />
      <WithdrawForm />
      <BalanceChecker />
      <PositionViewer />
      <PriceChecker />
      <PnLUpdater />
      <ClosePosition />
    </div>
  );
};

export default Details;
