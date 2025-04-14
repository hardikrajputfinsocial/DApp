import React from "react";
import "./App.css"
import OrderType from "./components/OrderTypes/OrderType";
import ConnectWallet from "./components/wallet/ConnectWallet";
import AdminFunctions from "./components/AdminFunctions";
import { useContract } from "./hooks/UserFunctions/FutureLongShort/useContract";
// import Header from "./components/Header/Header";
// import LSButtons from "./components/LSButtons/LSButtons";
import Details from "./components/LongShort/Details";

const App = () => {
  const { contract, isReady } = useContract();

  return (
    <>
      <main className="w-full h-screen bg-gradient-to-br from-gray-900 to-gray-900/95 flex justify-center items-center">
        <div>
          <OrderType/>
          <div className="mt-2">
            <ConnectWallet/>
          </div>
        </div>
      </main>
      <section className="bg-gray-900/95 text-white">
      {isReady ? (
          <AdminFunctions contract={contract} />
        ) : (
          <p>Loading Admin Functions...</p>
        )}
      <Details />
      </section>
    </>
  );
};

export default App;
