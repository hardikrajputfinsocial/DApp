import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../store/slices/userSlice";
import toast from "react-hot-toast";
import { ethers } from "ethers";

const Login = () => {
  const [address, setAddress] = useState("");
  const [isConnectingMetaMask, setIsConnectingMetaMask] = useState(false);
  const { loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error("Please enter your wallet address");
      return;
    }

    try {
      const resultAction = await dispatch(login(address));
      if (login.fulfilled.match(resultAction)) {
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message || "Login failed");
    }
  };

  const connectWithMetaMask = async () => {
    if (!window.ethereum) {
      toast.error(
        "MetaMask is not installed. Please install MetaMask to continue."
      );
      return;
    }

    setIsConnectingMetaMask(true);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const metamaskAddress = accounts[0];

      if (!metamaskAddress) {
        throw new Error("No account selected");
      }

      // Store the MetaMask connection in localStorage for automatic wallet connection
      localStorage.setItem("walletConnected", "metamask");
      localStorage.setItem("metamaskAddress", metamaskAddress);

      // Login with the MetaMask address
      const resultAction = await dispatch(login(metamaskAddress));
      if (login.fulfilled.match(resultAction)) {
        toast.success("MetaMask connected and logged in successfully!");
        navigate("/");
      } else {
        throw new Error(resultAction.error?.message || "Login failed");
      }
    } catch (error) {
      console.error("MetaMask connection error:", error);
      toast.error(error.message || "Failed to connect to MetaMask");
    } finally {
      setIsConnectingMetaMask(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Login to Futures DApp
        </h2>

        {error && (
          <div className="bg-red-600/20 border border-red-600 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={connectWithMetaMask}
            disabled={loading || isConnectingMetaMask}
            className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition mb-4 flex items-center justify-center ${
              isConnectingMetaMask ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isConnectingMetaMask ? (
              "Connecting..."
            ) : (
              <>
                <svg
                  className="w-6 h-6 mr-2"
                  viewBox="0 0 35 33"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M32.9582 1L19.8241 10.7183L22.2665 5.09902L32.9582 1Z"
                    fill="#E17726"
                  />
                  <path
                    d="M2.65179 1L15.6838 10.8237L13.3696 5.09902L2.65179 1Z"
                    fill="#E27625"
                  />
                  <path
                    d="M28.2295 23.5334L24.6827 28.8739L32.2521 30.8974L34.3893 23.6401L28.2295 23.5334Z"
                    fill="#E27625"
                  />
                  <path
                    d="M0.826172 23.6401L2.95648 30.8974L10.5259 28.8739L6.98913 23.5334L0.826172 23.6401Z"
                    fill="#E27625"
                  />
                  <path
                    d="M10.1044 14.5149L7.99219 17.6507L15.4876 17.9782L15.2569 9.86062L10.1044 14.5149Z"
                    fill="#E27625"
                  />
                  <path
                    d="M25.5055 14.5149L20.259 9.75999L20.1444 17.9782L27.626 17.6507L25.5055 14.5149Z"
                    fill="#E27625"
                  />
                  <path
                    d="M10.5259 28.8738L15.0824 26.6689L11.2151 23.6975L10.5259 28.8738Z"
                    fill="#E27625"
                  />
                  <path
                    d="M20.5276 26.6689L25.0841 28.8738L24.3948 23.6975L20.5276 26.6689Z"
                    fill="#E27625"
                  />
                </svg>
                Connect with MetaMask
              </>
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">
                Or Login with Address
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="address" className="block text-gray-300 mb-2">
              Wallet Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your wallet address"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Connecting..." : "Login with Address"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            For demo purposes, use one of these test addresses:
          </p>
          <div className="mt-3 bg-gray-700 p-3 rounded-lg text-xs text-gray-300">
            <p className="mb-2">0x1234567890123456789012345678901234567890</p>
            <p>0x0987654321098765432109876543210987654321</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
