# PredictChain - Decentralized Prediction Market

A decentralized prediction market built on the Shardeum blockchain. Users can create prediction events, participate by staking tokens, and receive proportional rewards if their predictions are correct.

## Prerequisites
- [Node.js](https://nodejs.org/) (v16.4.0 or higher)
- [MetaMask](https://metamask.io/) Wallet Extension

## Project Structure
- `blockchain/`: Contains Hardhat setup, Solidity smart contracts, and tests.
- `frontend/`: Contains the React (Vite) frontend application.

---

## How to Run Locally

### 1. Start the Local Blockchain Node
Open a terminal and navigate to the `blockchain` directory.
```bash
cd blockchain
npm install
npx hardhat node
```
*Keep this terminal running. It creates a local Ethereum network with 20 test accounts.*

### 2. Deploy the Smart Contract
Open a **new** terminal, navigate to the `blockchain` directory, and deploy the contract to your local network:
```bash
cd blockchain
npx hardhat ignition deploy ignition/modules/Deploy.js --network localhost
```
*Note the deployed contract address and update it in `frontend/src/context/Web3Context.jsx` if it differs from the default `0x5FbDB2315678afecb367f032d93F642f64180aa3`.*

### 3. Start the Frontend Application
Open another terminal and navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
*The app will be available at `http://localhost:5173/`.*

### 4. Setup MetaMask for Local Testing
1. Open the MetaMask extension.
2. Go to Settings -> Networks -> Add Network -> Add a network manually.
    - **Network name:** Localhost 8545
    - **New RPC URL:** http://127.0.0.1:8545
    - **Chain ID:** 31337
    - **Currency symbol:** ETH (or SHM)
3. Import an account into MetaMask using one of the Private Keys displayed in the terminal where you ran `npx hardhat node`.
4. Connect this imported wallet to the frontend application and start predicting!

---

## Deploying to Shardeum Testnet
1. Get testnet SHM from the [Shardeum Faucet](https://docs.shardeum.org/faucet/claim).
2. Create `blockchain/.env` and add your wallet's private key:
   `PRIVATE_KEY=your_private_key_here`
3. Run the deployment script for Shardeum:
   ```bash
   cd blockchain
   npx hardhat ignition deploy ignition/modules/Deploy.js --network shardeum
   ```
4. Update the `CONTRACT_ADDRESS` in `frontend/src/context/Web3Context.jsx` with your new deployed Shardeum Testnet address.
# PredictChain
# predictchain
