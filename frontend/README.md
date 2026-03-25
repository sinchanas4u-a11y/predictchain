# PredictChain Frontend

This is the React frontend for the PredictChain Decentralized Prediction Market.

## Getting Started

First, ensure you have the `blockchain` node running and the smart contract deployed.

### Running the App
1. Install dependencies:
   ```bash
   npm install
   ```
2. Make sure the `CONTRACT_ADDRESS` in `src/context/Web3Context.jsx` matches your deployed smart contract.
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173/`.
5. Connect your MetaMask wallet (configured for your local `localhost:8545` network or Shardeum testnet) to interact with the application.
