import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/userSlice";

const Header = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Try to extract display name regardless of user object structure
  const getDisplayName = () => {
    if (!user) return "Unknown";

    // Check for different possible structures
    if (user.username) return user.username;
    if (user.address)
      return `${user.address.substring(0, 6)}...${user.address.substring(
        user.address.length - 4
      )}`;
    if (user.user?.address)
      return `${user.user.address.substring(
        0,
        6
      )}...${user.user.address.substring(user.user.address.length - 4)}`;

    // Last resort - try to find any property that looks like an address
    const userStr = JSON.stringify(user);
    const addressMatch = userStr.match(/"address":"(0x[a-fA-F0-9]+)"/);
    if (addressMatch && addressMatch[1]) {
      const addr = addressMatch[1];
      return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    }

    return "Unknown";
  };

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Futures DApp
        </Link>

        <nav className="flex items-center space-x-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "text-blue-400" : "hover:text-blue-400 transition"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/futures"
            className={({ isActive }) =>
              isActive ? "text-blue-400" : "hover:text-blue-400 transition"
            }
          >
            Futures
          </NavLink>

          <NavLink
            to="/trading"
            className={({ isActive }) =>
              isActive ? "text-blue-400" : "hover:text-blue-400 transition"
            }
          >
            Trading
          </NavLink>

          <NavLink
            to="/charts"
            className={({ isActive }) =>
              isActive ? "text-blue-400" : "hover:text-blue-400 transition"
            }
          >
            Charts
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/futures/create"
                className={({ isActive }) =>
                  isActive ? "text-blue-400" : "hover:text-blue-400 transition"
                }
              >
                Create Future
              </NavLink>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">
                  {getDisplayName()}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? "text-blue-400" : "hover:text-blue-400 transition"
              }
            >
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
