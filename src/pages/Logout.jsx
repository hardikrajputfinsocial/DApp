import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/userSlice";
import toast from "react-hot-toast";

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = () => {
      // Clear wallet connection info
      localStorage.removeItem("walletConnected");
      localStorage.removeItem("metamaskAddress");

      // Dispatch logout action to Redux
      dispatch(logout());

      // Show logout notification
      toast.success("Logged out successfully");

      // Redirect to home page
      navigate("/");
    };

    performLogout();
  }, [dispatch, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;
