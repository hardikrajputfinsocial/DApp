# Futures DApp

A decentralized application for creating and managing financial futures on the blockchain.

## Project Structure

- **Frontend**: React application with Redux for state management and React Router for navigation
- **Backend**: Express.js API server that interacts with smart contracts on the blockchain

## Setup and Installation

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Ethereum wallet with private key (for testing purposes)

### Install Dependencies

1. Install frontend dependencies

   ```
   npm install
   ```

2. Install backend dependencies
   ```
   cd backend
   npm install
   ```

### Environment Variables

1. Configure backend environment variables in `backend/.env`:

   ```
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   RPC_URL=your_ethereum_rpc_url
   CONTRACT_ADDRESS=your_contract_address
   ```

2. Configure frontend environment variables in `.env`:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

### Start the Application

To run both the frontend and backend concurrently:

```
npm run start
```

Or run them separately:

- Frontend: `npm run dev`
- Backend: `npm run backend`

## API Endpoints

### Futures API

- `GET /api/futures` - Get all futures
- `GET /api/futures/:id` - Get a specific future
- `POST /api/futures` - Create a new future
- `PUT /api/futures/:id` - Update a future
- `PATCH /api/futures/:id/fulfill` - Fulfill a future

### User API

- `POST /api/users/login` - Login with wallet address
- `GET /api/users/profile` - Get user profile

## Project Features

- Create, view, update, and fulfill financial futures
- User authentication with wallet address
- Secure blockchain transactions

## License

MIT
