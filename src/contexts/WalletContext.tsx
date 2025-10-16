import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

const USE_TESTNET = true;

// Check for existing StacksProvider conflicts
if ((window as any).StacksProvider && !(window as any).StacksProviderConflictHandled) {
  console.warn('StacksProvider already exists (likely from browser extension). Using existing provider.');
  (window as any).StacksProviderConflictHandled = true;
}

// Stacks contracts from deployments/Testnet.toml
const STACKS_DEPLOYER = 'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1';
const STACKS_CONTRACTS = {
  GameTokenV2: `${STACKS_DEPLOYER}.GameTokenV2`,
  QuestRewardsV2: `${STACKS_DEPLOYER}.QuestRewardsV2`,
  PlayerProfileV2: `${STACKS_DEPLOYER}.PlayerProfileV2`,
};

interface WalletState {
  userSession: any | null;
  address: string | null;
  walletAddress: string | null; // Alias for address
  stxBalance: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

interface WalletActions {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  callContract: (contractId: string, functionName: string, functionArgs: any[]) => Promise<any>;
  getContractId: (name: string) => string | null;
}

type WalletContextType = WalletState & WalletActions;

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    console.warn('useWallet called outside of WalletProvider');
    return null;
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [userSession, setUserSession] = useState<any | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [stxBalance, setStxBalance] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!address;

  // Initialize app config and session
  const getAppConfig = useCallback(async () => {
    try {
      let AppConfig;
      try {
        const connectModule = await import('@stacks/connect');
        AppConfig = connectModule.AppConfig;
        
        if (!AppConfig) {
          throw new Error('AppConfig is not available');
        }
      } catch (error) {
        console.error('Failed to import AppConfig:', error);
        throw error;
      }
      
      // Create app config with proper error handling
      const config = new AppConfig(['store_write', 'publish_data'], window.location.origin);
      
      // Set app config globally to avoid conflicts
      if (!(window as any).StacksAppConfig) {
        (window as any).StacksAppConfig = config;
      }
      
      return config;
    } catch (error) {
      console.error('Failed to load AppConfig:', error);
      
      // Fallback: create a minimal config object
      const fallbackConfig = {
        appDomain: window.location.origin,
        scopes: ['store_write', 'publish_data'],
        redirectPath: '/',
        manifestPath: '/manifest.json',
        coreNode: USE_TESTNET 
          ? 'https://stacks-node-api.testnet.stacks.co' 
          : 'https://stacks-node-api.mainnet.stacks.co'
      };
      
      return fallbackConfig;
    }
  }, []);
  
  const getStacksNetwork = useCallback(async () => {
    try {
      const { StacksTestnet, StacksMainnet } = await import('@stacks/network');
      return USE_TESTNET ? new StacksTestnet() : new StacksMainnet();
    } catch (error) {
      console.warn('Failed to load Stacks network, using fallback');
      return USE_TESTNET
        ? { coreApiUrl: 'https://stacks-node-api.testnet.stacks.co' }
        : { coreApiUrl: 'https://stacks-node-api.mainnet.stacks.co' };
    }
  }, []);

  const getAddressFromUserData = useCallback((userData: any) => {
    const profile = userData?.profile || {};
    return USE_TESTNET
      ? (profile.stxAddress?.testnet || profile.stxAddress?.mainnet)
      : (profile.stxAddress?.mainnet || profile.stxAddress?.testnet);
  }, []);

  const refreshBalance = useCallback(async (addr?: string) => {
    const targetAddress = addr || address;
    if (!targetAddress) {
      setStxBalance(null);
      return;
    }

    try {
      const base = USE_TESTNET 
        ? 'https://stacks-node-api.testnet.stacks.co' 
        : 'https://stacks-node-api.mainnet.stacks.co';
      
      const response = await fetch(`${base}/v2/accounts/${targetAddress}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.status}`);
      }
      
      const data = await response.json();
      const microStx = Number(data.balance || 0);
      setStxBalance(microStx / 1_000_000);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setStxBalance(null);
    }
  }, [address]);

  const connectWallet = useCallback(async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    setError(null);

    try {
      console.log('🚀 Starting wallet connection using official Sats Connect...');
      
      // Method 1: Try Sats Connect (official Xverse integration)
      try {
        console.log('📞 Trying Sats Connect for Xverse...');
        const { request } = await import('sats-connect');
        
        // Request wallet connection
        const response = await request('wallet_connect', null);
        
        if (response.status === 'success') {
          console.log('✅ Sats Connect successful:', response);
          
          // Get Stacks address from the response
          const addresses = response.result.addresses;
          const stacksAddress = addresses.find((addr: any) => addr.purpose === 'stacks')?.address;
          
          if (stacksAddress) {
            console.log('✅ Stacks address found:', stacksAddress);
            setAddress(stacksAddress);
            await refreshBalance(stacksAddress);
            
            console.log('✅ Wallet connected successfully!');
            console.log('📝 Address:', stacksAddress);
            console.log('💰 Balance fetched:', stxBalance);
            return;
          } else {
            console.warn('⚠️ No Stacks address found in response');
          }
        } else {
          console.warn('⚠️ Sats Connect failed:', response.error?.message);
        }
      } catch (satsError) {
        console.warn('⚠️ Sats Connect failed:', satsError);
      }
      
      // Method 2: Try Stacks Connect (for other wallets)
      try {
        console.log('📞 Trying Stacks Connect fallback...');
        const connectModule = await import('@stacks/connect');
        const { showConnect } = connectModule;
        
        if (showConnect) {
          const userSession = await new Promise((resolve, reject) => {
            showConnect({
              appDetails: {
                name: 'CoinQuest',
                icon: `${window.location.origin}/favicon-32x32.png`,
              },
              redirectTo: window.location.origin,
              manifestPath: '/manifest.json',
              onFinish: (userSession) => {
                console.log('✅ Stacks Connect successful:', userSession);
                resolve(userSession);
              },
              onCancel: () => {
                console.log('❌ User cancelled Stacks Connect');
                reject(new Error('User cancelled the connection request'));
              },
            });
          });
          
          if (userSession && userSession.userData) {
            const address = userSession.userData.profile.stxAddress.testnet;
            console.log('✅ Stacks Connect address:', address);
            
            setAddress(address);
            await refreshBalance(address);
            
            console.log('✅ Wallet connected successfully!');
            console.log('📝 Address:', address);
            console.log('💰 Balance fetched:', stxBalance);
            return;
          }
        }
      } catch (stacksError) {
        console.warn('⚠️ Stacks Connect failed:', stacksError);
      }
      
      // Method 3: Try direct wallet detection
      console.log('📞 Trying direct wallet detection...');
      
      // Check for Xverse
      if ((window as any).xverse) {
        console.log('🔍 Xverse wallet detected');
        try {
          const xverse = (window as any).xverse;
          if (xverse.request) {
            const accounts = await xverse.request({ method: 'getAccounts' });
            if (accounts && accounts.length > 0) {
              const address = accounts[0];
              console.log('✅ Xverse direct connection successful:', address);
              
              setAddress(address);
              await refreshBalance(address);
              
              console.log('✅ Wallet connected successfully!');
              console.log('📝 Address:', address);
              console.log('💰 Balance fetched:', stxBalance);
              return;
            }
          }
        } catch (xverseError) {
          console.warn('⚠️ Xverse direct connection failed:', xverseError);
        }
      }
      
      // Check for Hiro/Leather
      if ((window as any).LeatherProvider) {
        console.log('🔍 Hiro/Leather wallet detected');
        try {
          const leather = (window as any).LeatherProvider;
          if (leather.request) {
            const accounts = await leather.request({ method: 'getAccounts' });
            if (accounts && accounts.length > 0) {
              const address = accounts[0];
              console.log('✅ Hiro/Leather direct connection successful:', address);
              
              setAddress(address);
              await refreshBalance(address);
              
              console.log('✅ Wallet connected successfully!');
              console.log('📝 Address:', address);
              console.log('💰 Balance fetched:', stxBalance);
              return;
            }
          }
        } catch (leatherError) {
          console.warn('⚠️ Hiro/Leather direct connection failed:', leatherError);
        }
      }
      
      // If all methods fail, show installation prompt
      console.log('❌ All connection methods failed, showing installation prompt...');
      await showWalletSelector();

    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      setError(error instanceof Error ? error.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, refreshBalance, stxBalance]);

  // Show installation prompt when Xverse is not installed
  const showWalletSelector = useCallback(async (): Promise<void> => {
    return new Promise((resolve) => {
      // Create modal
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
      `;

      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        max-width: 450px;
        width: 90%;
        text-align: center;
      `;

      modalContent.innerHTML = `
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold;">X</div>
        <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 24px;">Xverse Wallet Required</h2>
        <p style="margin: 0 0 30px 0; color: #6b7280; font-size: 16px; line-height: 1.5;">To connect your wallet and play coinQuest, please install the Xverse browser extension.</p>
        <a href="https://xverse.app/" target="_blank" style="
          display: inline-block;
          padding: 16px 32px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(99, 102, 241, 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(99, 102, 241, 0.3)'">
          Install Xverse Wallet
        </a>
        <button id="close-btn" style="
          display: block;
          margin: 20px auto 0;
          padding: 10px 20px;
          border: 1px solid #d1d5db;
          background: white;
          color: #6b7280;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        " onmouseover="this.style.backgroundColor='#f9fafb'" onmouseout="this.style.backgroundColor='white'">
          Close
        </button>
      `;

      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      // Add event listeners
      document.getElementById('close-btn')?.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve();
      });

      // Close on background click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
          resolve();
        }
      });
    });
  }, []);



  // Debug function to help troubleshoot wallet detection
  const debugWalletDetection = useCallback(() => {
    console.log('🔍 === WALLET DETECTION DEBUG ===');
    console.log('🔍 All window keys:', Object.keys(window));
    
    const walletRelatedKeys = Object.keys(window).filter(key => 
      key.toLowerCase().includes('xverse') || 
      key.toLowerCase().includes('stacks') ||
      key.toLowerCase().includes('btc') ||
      key.toLowerCase().includes('wallet')
    );
    
    console.log('🔍 Wallet-related keys:', walletRelatedKeys);
    
    walletRelatedKeys.forEach(key => {
      const obj = (window as any)[key];
      console.log(`🔍 window.${key}:`, obj);
      if (obj && typeof obj === 'object') {
        console.log(`🔍 window.${key} methods:`, Object.keys(obj));
      }
    });
    
    console.log('🔍 === END DEBUG ===');
  }, []);

  const disconnectWallet = useCallback(() => {
    try {
      if (userSession?.isUserSignedIn?.()) {
        userSession.signUserOut();
      }
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
    
    setUserSession(null);
    setAddress(null);
    setStxBalance(null);
    setError(null);
  }, [userSession]);

  const extractStxAddress = useCallback((response: any) => {
    try {
      console.log('🔍 Extracting address from response:', response);
      
      // Handle Xverse authenticationRequest response
      if (response?.address && typeof response.address === 'string') {
        console.log('✅ Extracted address from Xverse authentication:', response.address);
        return response.address;
      }

      // Handle Leather/Hiro response format
      if (response?.addresses && Array.isArray(response.addresses)) {
        const validAddress = response.addresses.find((addr: any) => 
          addr?.address && typeof addr.address === 'string'
        );
        return validAddress?.address;
      }

      // Handle Xverse response format
      if (Array.isArray(response)) {
        const first = response[0];
        if (first?.address && typeof first.address === 'string') {
          return first.address;
        }
        if (typeof first === 'string') {
          return first;
        }
      }

      // Handle direct address response
      if (response?.address && typeof response.address === 'string') {
        return response.address;
      }
      
      if (typeof response === 'string') {
        return response;
      }

      return null;
    } catch (error) {
      console.error('Error extracting address:', error);
      return null;
    }
  }, []);

  const callContract = useCallback(async (
    contractId: string, 
    functionName: string, 
    functionArgs: any[]
  ) => {
    console.log('🔗 Contract call initiated:', { contractId, functionName, functionArgs });
    
    if (!userSession?.isUserSignedIn?.()) {
      console.error('❌ Wallet not connected for contract call');
      throw new Error('Wallet not connected');
    }

    try {
      let openContractCall;
      try {
        const connectModule = await import('@stacks/connect');
        openContractCall = connectModule.openContractCall;
        
        if (!openContractCall || typeof openContractCall !== 'function') {
          throw new Error('openContractCall is not available or not a function');
        }
        console.log('✅ Stacks Connect loaded for contract call');
      } catch (error) {
        console.error('Failed to import openContractCall:', error);
        throw new Error('Stacks Connect library not available for contract calls');
      }

      const network = await getStacksNetwork();
      console.log('🌐 Using network:', network);

      return new Promise((resolve, reject) => {
        console.log('📞 Calling contract:', {
          contractAddress: contractId.split('.')[0],
          contractName: contractId.split('.')[1],
          functionName,
          functionArgs
        });
        
        openContractCall({
          userSession,
          contractAddress: contractId.split('.')[0],
          contractName: contractId.split('.')[1],
          functionName,
          functionArgs,
          network,
          postConditionMode: 1,
          onFinish: (result) => {
            console.log('✅ Contract call successful:', result);
            resolve(result);
          },
          onCancel: () => {
            console.log('❌ User canceled contract transaction');
            reject(new Error('User canceled transaction'));
          },
        });
      });
    } catch (error) {
      console.error('❌ Contract call failed:', error);
      throw error;
    }
  }, [userSession, getStacksNetwork]);

  const getContractId = useCallback((name: string) => {
    return STACKS_CONTRACTS[name as keyof typeof STACKS_CONTRACTS] || null;
  }, []);

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        let UserSession;
        try {
          const connectModule = await import('@stacks/connect');
          UserSession = connectModule.UserSession;
          
          if (!UserSession) {
            throw new Error('UserSession is not available');
          }
        } catch (error) {
          console.error('Failed to import Stacks Connect for session initialization:', error);
          return; // Skip initialization if we can't import
        }

        const appConfig = await getAppConfig();
        
        // Create UserSession with error handling for StacksProvider conflicts
        let session;
        try {
          if (appConfig) {
            session = new UserSession({ appConfig });
          } else {
            console.warn('No app config available, creating session without it');
            session = new UserSession();
          }
        } catch (error) {
          console.warn('UserSession creation failed, trying alternative approach:', error);
          
          // Try creating session without appConfig if there's a conflict
          try {
            session = new UserSession();
          } catch (altError) {
            console.error('Alternative UserSession creation also failed:', altError);
            return; // Skip initialization if we can't create a session
          }
        }
        
        if (session.isSignInPending()) {
          await session.handlePendingSignIn();
        }
        
        if (session.isUserSignedIn()) {
          const userData = session.loadUserData();
          const extractedAddress = getAddressFromUserData(userData);
          
          setUserSession(session);
          setAddress(extractedAddress);
          
          if (extractedAddress) {
            await refreshBalance(extractedAddress);
          }
        }
      } catch (error) {
        console.error('Session initialization failed:', error);
      }
    };

    initializeSession();
  }, [getAppConfig, getAddressFromUserData, refreshBalance]);

  // Auto-refresh balance periodically
  useEffect(() => {
    if (!address) return;

    const interval = setInterval(() => {
      refreshBalance();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [address, refreshBalance]);

  const value: WalletContextType = {
    // State
    userSession,
    address,
    walletAddress: address, // Alias for compatibility
    stxBalance,
    isConnected,
    isConnecting,
    error,
    
    // Actions
    connectWallet,
    disconnectWallet,
    refreshBalance,
    callContract,
    getContractId,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};