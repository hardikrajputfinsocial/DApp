import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../../store/slices/userSlice";
import toast from "react-hot-toast";

const ConnectWallet = () => {
  const [address, setAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);
  const navigate = useNavigate();
  const reconnectTimeoutRef = useRef(null);

  const { user, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Auto-connect with saved MetaMask account
  useEffect(() => {
    // If already tried to auto-connect, don't try again
    if (autoConnectAttempted) return;

    const autoConnectWallet = async () => {
      // If already connected or loading, do nothing
      if (user || loading) return;

      // Check if we have a saved MetaMask connection
      const walletType = localStorage.getItem("walletConnected");
      const savedAddress = localStorage.getItem("metamaskAddress");

      if (walletType === "metamask" && savedAddress && window.ethereum) {
        try {
          setIsConnecting(true);

          // Check if still have access to the account
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (
            accounts &&
            accounts.length > 0 &&
            accounts.includes(savedAddress)
          ) {
            // Auto-login with the saved address - but catch errors
            try {
              await dispatch(login(savedAddress));
              console.log("Auto-connected with MetaMask");
            } catch (error) {
              console.error("Failed to auto-login:", error);
              // Clear saved data on login failure
              localStorage.removeItem("walletConnected");
              localStorage.removeItem("metamaskAddress");
              toast.error(
                "Automatic login failed. Please reconnect your wallet."
              );
            }
          } else {
            // Clear saved data if account not accessible anymore
            localStorage.removeItem("walletConnected");
            localStorage.removeItem("metamaskAddress");
          }
        } catch (error) {
          console.error("Auto-connect error:", error);
          localStorage.removeItem("walletConnected");
          localStorage.removeItem("metamaskAddress");
        } finally {
          setIsConnecting(false);
          // Mark that we've attempted auto-connect to prevent repeated tries
          setAutoConnectAttempted(true);
        }
      } else {
        // Mark as attempted even if no saved connection
        setAutoConnectAttempted(true);
      }
    };

    // Clear any existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Delay auto-connect slightly to ensure app is fully loaded
    reconnectTimeoutRef.current = setTimeout(() => {
      autoConnectWallet();
    }, 500);

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [dispatch, user, loading, autoConnectAttempted]);

  // Set up MetaMask account change listener
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      const currentType = localStorage.getItem("walletConnected");

      // Only handle if we're using MetaMask
      if (currentType === "metamask" && user) {
        if (accounts.length === 0) {
          // User disconnected from MetaMask - log out
          navigate("/logout");
        } else if (accounts[0] !== user.address) {
          // Account changed - update our connection
          localStorage.setItem("metamaskAddress", accounts[0]);
          toast.info("MetaMask account changed - reconnecting...");
          try {
            const resultAction = await dispatch(login(accounts[0]));
            if (login.fulfilled.match(resultAction)) {
              toast.success("Connected to new MetaMask account");
            }
          } catch (loginError) {
            console.error("Account change error:", loginError);
            toast.error(
              "Failed to connect to new account. Please reconnect manually."
            );
            navigate("/logout");
          }
        }
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [dispatch, navigate, user]);

  // Reset auto-connect if there's an error
  useEffect(() => {
    if (error) {
      setAutoConnectAttempted(true);
    }
  }, [error]);

  const handleConnect = async () => {
    if (user) {
      // Already connected
      return;
    }

    // Check if MetaMask is available
    if (window.ethereum && !showAddressInput) {
      try {
        setIsConnecting(true);
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts.length > 0) {
          const metamaskAddress = accounts[0];

          // Store MetaMask info for reconnection
          localStorage.setItem("walletConnected", "metamask");
          localStorage.setItem("metamaskAddress", metamaskAddress);

          // Login with the MetaMask address
          try {
            const resultAction = await dispatch(login(metamaskAddress));
            if (login.fulfilled.match(resultAction)) {
              toast.success("MetaMask connected successfully!");
              return;
            } else {
              throw new Error(resultAction.error?.message || "Failed to login");
            }
          } catch (error) {
            console.error("Login error:", error);
            toast.error(
              "Connected to MetaMask but login failed. Server may be unavailable."
            );
            localStorage.removeItem("walletConnected");
            localStorage.removeItem("metamaskAddress");
          }
        }
      } catch (error) {
        console.error("MetaMask connection error:", error);
        toast.error("Failed to connect with MetaMask");
        setShowAddressInput(true);
      } finally {
        setIsConnecting(false);
      }
      return;
    }

    if (!showAddressInput) {
      setShowAddressInput(true);
      return;
    }

    if (!address.trim()) {
      toast.error("Please enter a valid wallet address");
      return;
    }

    setIsConnecting(true);

    try {
      const resultAction = await dispatch(login(address));
      if (login.fulfilled.match(resultAction)) {
        toast.success("Wallet connected successfully!");
        setShowAddressInput(false);
        // Mark as manual connection
        localStorage.setItem("walletConnected", "manual");
      } else {
        throw new Error(resultAction.error?.message || "Failed to login");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.message || "Failed to connect wallet. Server may be unavailable."
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    // Navigate to logout page that will handle everything
    navigate("/logout");
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  };

  // Check if connected with MetaMask
  const isMetaMaskConnected =
    localStorage.getItem("walletConnected") === "metamask";

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-3">Wallet</h3>

      {user ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-gray-400">Connected as</div>
              <div className="font-mono">{formatAddress(user.address)}</div>
              {isMetaMaskConnected && (
                <div className="text-xs text-orange-400 mt-1 flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
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
                  </svg>
                  MetaMask
                </div>
              )}
            </div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <button
            onClick={handleDisconnect}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div>
          {showAddressInput ? (
            <div className="mb-3">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter wallet address"
                className="w-full bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div className="text-sm text-gray-400 mb-3">Not connected</div>
          )}

          <button
            onClick={handleConnect}
            disabled={loading || isConnecting}
            className={`w-full ${
              window.ethereum && !showAddressInput
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white py-2 rounded transition flex items-center justify-center ${
              loading || isConnecting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading || isConnecting ? (
              "Connecting..."
            ) : showAddressInput ? (
              "Connect"
            ) : window.ethereum ? (
              <>
                <svg
                  className="w-4 h-4 mr-2"
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
                </svg>
                Connect with MetaMask
              </>
            ) : (
              "Connect Wallet"
            )}
          </button>
        </div>
      )}

      {!user && (
        <div className="mt-4 text-xs text-gray-400">
          For demo purposes, you can use:
          <div className="font-mono mt-1 bg-gray-700 p-1 rounded text-xs">
            0x1234567890123456789012345678901234567890
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
