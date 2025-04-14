import React from "react";
import { useContract } from "../hooks/UserFunctions/FutureLongShort/useContract";
import AdminFunctions from "../components/AdminFunctions";

const AdminPage = () => {
  const { contract, isReady } = useContract();

  if (!isReady) return <p>Loading contract...</p>;

  return (
    <div className="admin-page">
      <h1>Admin Panel</h1>
      <AdminFunctions contract={contract} />
    </div>
  );
};

export default AdminPage;
