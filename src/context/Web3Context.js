import React, { createContext, useState, useContext, useEffect } from 'react';
import Web3 from 'web3'; // Ensure Web3 is imported
import { abi } from '../abi'; // Assuming ABI is available in this path

const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isBuilder, setIsBuilder] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);
  const [web3, setWeb3] = useState(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // Initialize Web3 instance
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        
        // Call to check the user role after wallet connection
        checkUserRole(accounts[0], web3Instance);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('Please install MetaMask to use this feature!');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setIsBuilder(false);
    setIsBuyer(false);
  };

  // Function to check if the wallet is registered as a Builder or Verified Buyer
  const checkUserRole = async (walletAddress, web3Instance) => {
    const contractAddress = '0x7B3978DdA448852c42671298f5F1F786752cc827'; // Replace with your contract address
    const contract = new web3Instance.eth.Contract(abi, contractAddress);

    try {
      // Check if the account is a Builder
      const builder = await contract.methods.builders(walletAddress).call();
      setIsBuilder(builder.isRegistered);

      // Check if the account is a Buyer
      const buyer = await contract.methods.buyers(walletAddress).call();
      setIsBuyer(buyer.isVerified);
    } catch (error) {
      console.log('Error checking user role:', error);
      alert("error here")
    }
  };

  useEffect(() => {
    // Check if already connected and check user role if so
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);
            
            // Ensure roles are checked once after the wallet connects
            checkUserRole(accounts[0], web3Instance);
          }
        });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);

          // Create new web3 instance for the new account
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          // Check user role for the new wallet address
          checkUserRole(accounts[0], web3Instance);
        } else {
          setAccount(null);
          setIsConnected(false);
          setIsBuilder(false);
          setIsBuyer(false);
        }
      });
    }
  }, []); // Empty dependency array ensures this runs only once at initial render

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnected,
        connectWallet,
        disconnectWallet,
        isBuilder,
        isBuyer,
        web3,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}
