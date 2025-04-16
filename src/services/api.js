import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Mock data for user authentication (when server is not available)
const MOCK_USERS = [
  {
    address: "0x1234567890123456789012345678901234567890",
    username: "demo_user",
    role: "user",
    balance: 1500,
  },
  {
    address: "0x0987654321098765432109876543210987654321",
    username: "admin_user",
    role: "admin",
    balance: 5000,
  },
];

// Flag to use mock data instead of calling real API
// Set to false to use real backend API
const USE_MOCK_API = true;

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle generic errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response error:", error.response.data);

      // Handle authentication errors
      if (error.response.status === 401) {
        // Clear user data if unauthorized
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // You might want to redirect to login page
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Request error:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Mock API implementation
const mockAPI = {
  login: async (address) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(
          (u) => u.address.toLowerCase() === address.toLowerCase()
        );

        if (user) {
          const mockToken = `mock_token_${Math.random()
            .toString(36)
            .substring(2, 15)}`;

          resolve({
            success: true,
            user,
            token: mockToken,
          });
        } else {
          // If address is not in our mock users but still a valid Ethereum address, create a new user
          if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
            const newUser = {
              address,
              username: `user_${address.substring(2, 8)}`,
              role:
                address.toLowerCase() ===
                "0x1234567890123456789012345678901234567890"
                  ? "admin"
                  : "user",
              balance: 1000,
            };

            resolve({
              success: true,
              user: newUser,
              token: `mock_token_${Math.random()
                .toString(36)
                .substring(2, 15)}`,
            });
          } else {
            reject({
              response: {
                data: {
                  success: false,
                  message: "Invalid Ethereum address",
                },
              },
            });
          }
        }
      }, 500); // Simulate network delay
    });
  },

  getProfile: async () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const token = localStorage.getItem("token");
        if (!token) {
          reject({
            response: {
              data: {
                success: false,
                message: "Authentication required",
              },
              status: 401,
            },
          });
          return;
        }

        // For demo purposes, we'll just return the stored user
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          resolve({
            success: true,
            data: JSON.parse(storedUser),
          });
        } else {
          reject({
            response: {
              data: {
                success: false,
                message: "User not found",
              },
            },
          });
        }
      }, 500);
    });
  },
};

// Authentication API calls
export const authAPI = {
  login: async (address) => {
    if (USE_MOCK_API) {
      const response = await mockAPI.login(address);
      return { data: response }; // Wrap the response to match expected structure
    } else {
      const response = await api.post("/users/login", { address });
      return response.data;
    }
  },

  getProfile: async () => {
    if (USE_MOCK_API) {
      const response = await mockAPI.getProfile();
      return { data: response }; // Wrap the response to match expected structure
    } else {
      const response = await api.get("/users/profile");
      return response.data;
    }
  },
};

// Futures API calls
export const futuresAPI = {
  getAllFutures: async () => {
    const response = await api.get("/futures");
    return response.data;
  },

  getFutureById: async (id) => {
    const response = await api.get(`/futures/${id}`);
    return response.data;
  },

  createFuture: async (futureData, privateKey) => {
    const response = await api.post("/futures", futureData, {
      headers: {
        "X-Private-Key": privateKey,
      },
    });
    return response.data;
  },

  updateFuture: async (id, updateData, privateKey) => {
    const response = await api.put(`/futures/${id}`, updateData, {
      headers: {
        "X-Private-Key": privateKey,
      },
    });
    return response.data;
  },

  fulfillFuture: async (id, privateKey) => {
    const response = await api.patch(
      `/futures/${id}/fulfill`,
      {},
      {
        headers: {
          "X-Private-Key": privateKey,
        },
      }
    );
    return response.data;
  },
};

export default api;
