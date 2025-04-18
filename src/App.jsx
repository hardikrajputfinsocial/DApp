import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "./store/slices/userSlice";
import "./App.css";

// Layout
import Layout from "./components/Layout/Layout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import FuturesList from "./pages/FuturesList";
import FutureDetails from "./pages/FutureDetails";
import CreateFuture from "./pages/CreateFuture";
import EditFuture from "./pages/EditFuture";
import NotFound from "./pages/NotFound";
import TradingPage from "./pages/TradingPage";
import SpotTradingPage from "./pages/SpotTradingPage";
import MarginTradingPage from "./pages/MarginTradingPage";
import ChartDemo from "./pages/ChartDemo";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.user);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);

  useEffect(() => {
    if (token) {
      dispatch(getProfile());
    }
  }, [dispatch, token]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="logout" element={<Logout />} />
        <Route path="futures" element={<FuturesList />} />
        <Route path="futures/:id" element={<FutureDetails />} />
        <Route path="trading" element={<TradingPage />} />
        <Route path="trading/spot" element={<SpotTradingPage />} />
        <Route path="trading/margin" element={<MarginTradingPage />} />
        <Route path="charts" element={<ChartDemo />} />

        {/* Protected routes */}
        <Route
          path="futures/create"
          element={
            <ProtectedRoute>
              <CreateFuture />
            </ProtectedRoute>
          }
        />
        <Route
          path="futures/edit/:id"
          element={
            <ProtectedRoute>
              <EditFuture />
            </ProtectedRoute>
          }
        />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
