import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import PredictionMarketJSON from '../../../blockchain/artifacts/contracts/PredictionMarket.sol/PredictionMarket.json';

const Web3Context = createContext();

// NOTE: Please replace this address with your deployed contract address on Shardeum
const CONTRACT_ADDRESS = "0x8fb3B24aCF348674037BC4984d7f5c0f49e98A67";

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          initializeWeb3();
        } else {
          setAccount("");
          setSigner(null);
          setContract(null);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkConnection() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await initializeWeb3();
        }
      } catch (err) {
        console.error(err);
      }
    }
    setLoading(false);
  };

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this platform!");
      return false;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      await initializeWeb3();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  async function initializeWeb3() {
    try {
      if (window.ethereum) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);
        const web3Signer = await web3Provider.getSigner();
        setSigner(web3Signer);
        
        // Setup Contract
        if (CONTRACT_ADDRESS !== "0xYOUR_CONTRACT_ADDRESS") {
           const pmContract = new ethers.Contract(CONTRACT_ADDRESS, PredictionMarketJSON.abi, web3Signer);
           setContract(pmContract);
        }
      }
    } catch (err) {
      console.error("Failed to initialize web3", err);
    }
  };

  return (
    <Web3Context.Provider value={{ provider, signer, contract, account, connectWallet, loading }}>
      {children}
    </Web3Context.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWeb3 = () => useContext(Web3Context);
