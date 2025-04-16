# Project Structure and Data Flow

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                 │     │                  │     │                  │
│   React UI      │────▶│  Express Backend │────▶│  Blockchain      │
│   (Frontend)    │◀────│  (API Server)    │◀────│  (Smart Contract)│
│                 │     │                  │     │                  │
└─────────────────┘     └──────────────────┘     └──────────────────┘
```

## Frontend (React)

- **State Management**: Redux for global state management
- **API Communication**: Axios for API requests
- **Routing**: React Router for navigation
- **Features**:
  - User authentication
  - Create, read, update futures
  - Fulfill futures
  - View all futures

## Backend (Express.js)

- **API Server**: Express.js
- **Blockchain Interaction**: Ethers.js
- **Authentication**: JWT
- **Features**:
  - Secured endpoints
  - Smart contract interaction

## Data Flow

1. **User Authentication**:

   - Frontend sends wallet address to backend
   - Backend generates JWT token
   - Frontend stores token for authenticated requests

2. **Futures Management**:

   - User creates a future through the frontend form
   - Frontend sends data with private key to backend API
   - Backend interacts with the smart contract
   - Smart contract creates the future on-chain
   - Backend returns the result to frontend
   - Frontend updates the UI

3. **Security Considerations**:
   - Private keys only used for transactions, never stored
   - JWT authentication for API requests
   - Backend validates requests before interacting with blockchain

## Folder Structure

### Frontend

```
src/
├── components/      # Reusable UI components
├── pages/           # Page components for routing
├── store/           # Redux store and slices
│   └── slices/      # Redux slices for state management
├── services/        # API services
├── utils/           # Utility functions
├── App.jsx          # Main application component with routes
└── main.jsx         # Entry point
```

### Backend

```
backend/
├── src/
│   ├── abis/         # Smart contract ABIs
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Express middleware
│   ├── routes/       # API routes
│   ├── services/     # Business logic and blockchain interaction
│   └── utils/        # Utility functions
└── index.js          # Entry point
```

## Improvement Opportunities

1. **Error Handling**: Implement more robust error handling throughout the application
2. **Loading States**: Add loading indicators for better user experience
3. **Validation**: Add more comprehensive input validation
4. **Testing**: Add unit and integration tests
5. **Monitoring**: Add monitoring for API performance and error tracking
