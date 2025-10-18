import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { WalletContextType } from '../types/wallet';

const USE_TESTNET = true;

// Check for existing StacksProvider conflicts
if ((window as any).StacksProvider && !(window as any).StacksProviderConflictHandled) {
  console.warn('StacksProvider already exists (likely from browser extension). Using existing provider.');
  (window as any).StacksProviderConflictHandled = true;
}

// Stacks contracts from deployments/Testnet.toml
const STACKS_DEPLOYER = 'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1';
const STACKS_CONTRACTS = {
  CoinQuestToken: `${STACKS_DEPLOYER}.CoinQuestToken`,
  CoinQuestGame: `${STACKS_DEPLOYER}.CoinQuestGame`,
};

// Types imported from ../types/wallet

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Add display name for React Fast Refresh
useWallet.displayName = 'useWallet';

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [userSession, setUserSession] = useState<any | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [stxBalance, setStxBalance] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!(address && (userSession || (window as any).xverse || (window as any).LeatherProvider));

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
      const networkModule = await import('@stacks/network');
      return USE_TESTNET ? networkModule.STACKS_TESTNET : networkModule.STACKS_MAINNET;
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
            
            // Create a proper UserSession for Sats Connect compatibility
            try {
              const { UserSession, AppConfig } = await import('@stacks/connect');
              const appConfig = new AppConfig(['store_write', 'publish_data'], window.location.origin);
              const userSession = new UserSession({ appConfig });
              
              // Create a proper user data structure
              const userData = {
                profile: {
                  stxAddress_testnet: stacksAddress,
                  stxAddress_mainnet: stacksAddress
                },
                username: stacksAddress,
                identityAddress: stacksAddress,
                appPrivateKey: 'dummy-key-for-testing',
                coreNode: 'https://stacks-node-api.testnet.stacks.co',
                hubUrl: 'https://hub.testnet.stacks.co',
                version: '1.0.0'
              };
              
              // Properly initialize the session
              (userSession as any).userData = userData;
              (userSession as any)._isSignInPending = false;
              (userSession as any)._isSignInComplete = true;
              
              // Override the isUserSignedIn method to return true
              userSession.isUserSignedIn = () => true;
              
              setUserSession(userSession);
              console.log('✅ Proper UserSession created for Sats Connect');
              console.log('✅ UserSession isUserSignedIn:', userSession.isUserSignedIn());
            } catch (error) {
              console.error('❌ Failed to create UserSession:', error);
              // Fallback to mock session
              const mockUserSession = {
                isUserSignedIn: () => true,
                loadUserData: () => ({
                  profile: {
                    stxAddress_testnet: stacksAddress,
                    stxAddress_mainnet: stacksAddress
                  }
                })
              };
              setUserSession(mockUserSession);
            }
            
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
          
          if (userSession && (userSession as any).userData) {
            const address = (userSession as any).userData.profile.stxAddress.testnet;
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
              
              // Create a proper UserSession for Xverse direct compatibility
              try {
                const { UserSession, AppConfig } = await import('@stacks/connect');
                const appConfig = new AppConfig(['store_write', 'publish_data'], window.location.origin);
                const userSession = new UserSession({ appConfig });
                
                // Create a proper user data structure
                const userData = {
                  profile: {
                    stxAddress_testnet: address,
                    stxAddress_mainnet: address
                  },
                  username: address,
                  identityAddress: address,
                  appPrivateKey: 'dummy-key-for-testing',
                  coreNode: 'https://stacks-node-api.testnet.stacks.co',
                  hubUrl: 'https://hub.testnet.stacks.co',
                  version: '1.0.0'
                };
                
                // Properly initialize the session
                (userSession as any).userData = userData;
                (userSession as any)._isSignInPending = false;
                (userSession as any)._isSignInComplete = true;
                
                // Override the isUserSignedIn method to return true
                userSession.isUserSignedIn = () => true;
                
                setUserSession(userSession);
                console.log('✅ Proper UserSession created for Xverse direct connection');
                console.log('✅ UserSession isUserSignedIn:', userSession.isUserSignedIn());
              } catch (error) {
                console.error('❌ Failed to create UserSession:', error);
                // Fallback to mock session
                const mockUserSession = {
                  isUserSignedIn: () => true,
                  loadUserData: () => ({
                    profile: {
                      stxAddress_testnet: address,
                      stxAddress_mainnet: address
                    }
                  })
                };
                setUserSession(mockUserSession);
              }
              
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
              
              // Create a proper UserSession for Leather direct compatibility
              try {
                const { UserSession, AppConfig } = await import('@stacks/connect');
                const appConfig = new AppConfig(['store_write', 'publish_data'], window.location.origin);
                const userSession = new UserSession({ appConfig });
                
                // Create a proper user data structure
                const userData = {
                  profile: {
                    stxAddress_testnet: address,
                    stxAddress_mainnet: address
                  },
                  username: address,
                  identityAddress: address,
                  appPrivateKey: 'dummy-key-for-testing',
                  coreNode: 'https://stacks-node-api.testnet.stacks.co',
                  hubUrl: 'https://hub.testnet.stacks.co',
                  version: '1.0.0'
                };
                
                // Properly initialize the session
                (userSession as any).userData = userData;
                (userSession as any)._isSignInPending = false;
                (userSession as any)._isSignInComplete = true;
                
                // Override the isUserSignedIn method to return true
                userSession.isUserSignedIn = () => true;
                
                setUserSession(userSession);
                console.log('✅ Proper UserSession created for Leather direct connection');
                console.log('✅ UserSession isUserSignedIn:', userSession.isUserSignedIn());
              } catch (error) {
                console.error('❌ Failed to create UserSession:', error);
                // Fallback to mock session
                const mockUserSession = {
                  isUserSignedIn: () => true,
                  loadUserData: () => ({
                    profile: {
                      stxAddress_testnet: address,
                      stxAddress_mainnet: address
                    }
                  })
                };
                setUserSession(mockUserSession);
              }
              
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

  // Expose debug function globally
  useEffect(() => {
    (window as any).debugWalletDetection = debugWalletDetection;
  }, [debugWalletDetection]);

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


  const callContract = useCallback(async (
    contractId: string, 
    functionName: string, 
    functionArgs: any[]
  ) => {
    console.log('🔍 === CONTRACT CALL DEBUG ===');
    console.log('🔍 Contract ID:', contractId);
    console.log('🔍 Function:', functionName);
    console.log('🔍 Args:', functionArgs);
    console.log('🔍 User session exists:', !!userSession);
    console.log('🔍 User session signed in:', userSession?.isUserSignedIn?.());
    console.log('🔍 Address:', address);
    console.log('🔗 Contract call initiated:', { contractId, functionName, functionArgs });
    
    // Don't convert to Clarity values here - do it in each wallet call to avoid serialization issues
    console.log('🔍 Raw function args:', functionArgs);
    
    // Try direct wallet contract calls first (for Xverse/Leather)
    // Check if wallet is connected through any method
    const isWalletConnected = address && (
      isConnected || 
      userSession?.isUserSignedIn?.() || 
      (window as any).xverse?.request || 
      (window as any).LeatherProvider?.request
    );
    
    console.log('🔍 === WALLET CONNECTION DEBUG ===');
    console.log('🔍 Address:', address);
    console.log('🔍 isConnected:', isConnected);
    console.log('🔍 userSession?.isUserSignedIn?.():', userSession?.isUserSignedIn?.());
    console.log('🔍 (window as any).xverse:', !!(window as any).xverse);
    console.log('🔍 (window as any).xverse?.request:', !!(window as any).xverse?.request);
    console.log('🔍 (window as any).LeatherProvider:', !!(window as any).LeatherProvider);
    console.log('🔍 (window as any).LeatherProvider?.request:', !!(window as any).LeatherProvider?.request);
    console.log('🔍 Final isWalletConnected:', isWalletConnected);
    
    if ((window as any).xverse) {
      console.log('🔍 Xverse methods:', Object.keys((window as any).xverse));
    }
    
    // Try Sats Connect for contract calls (proper way)
    if (isWalletConnected) {
      console.log('🔍 === ATTEMPTING SATS CONNECT CONTRACT CALL ===');
      console.log('🔍 Wallet connected:', isWalletConnected);
      
      try {
        console.log('🔍 Importing Sats Connect...');
        const { request } = await import('sats-connect');
        
        // Convert to Clarity values for Sats Connect - do it directly to avoid serialization issues
        let clarityArgs;
        try {
          const { uintCV, stringUtf8CV, boolCV } = await import('@stacks/transactions');
          
          clarityArgs = functionArgs.map(arg => {
            // If already a Clarity value, return as-is
            if (arg && typeof arg === 'object' && arg.type) {
              return arg;
            }
            
            // Convert based on type
            if (typeof arg === 'number') {
              return uintCV(arg);
            } else if (typeof arg === 'string') {
              return stringUtf8CV(arg);
            } else if (typeof arg === 'boolean') {
              return boolCV(arg);
            }
            
            // Fallback to raw value
            return arg;
          });
        } catch (error) {
          console.warn('Failed to import Clarity value converters:', error);
          clarityArgs = functionArgs; // Use raw values as fallback
        }
        
        console.log('🔍 Contract call parameters:', {
          contract: contractId,
          functionName,
          functionArgs: clarityArgs,
          network: 'testnet'
        });
        
        // Use Sats Connect for contract calls
        const result = await request('stx_callContract', {
          contract: contractId,
          functionName,
          functionArgs: clarityArgs
        });
        
        console.log('✅ Sats Connect contract call successful:', result);
        return result;
      } catch (error) {
        console.log('⚠️ Sats Connect contract call failed:', error);
        console.log('⚠️ Error details:', {
          message: error instanceof Error ? error.message : String(error),
          code: (error as any)?.code,
          data: (error as any)?.data,
          stack: error instanceof Error ? error.stack : undefined
        });
        // Continue to try other methods
      }
    }
    
    // Try Leather direct contract calls
    if (isWalletConnected && (window as any).LeatherProvider?.request) {
      console.log('🔍 Trying Leather direct contract call...');
      console.log('🔍 Available Leather methods:', Object.keys((window as any).LeatherProvider));
        try {
          const leather = (window as any).LeatherProvider;
          const contractAddress = contractId.split('.')[0];
          const contractName = contractId.split('.')[1];
          
          // Convert to Clarity values for Leather - do it directly to avoid serialization issues
          let clarityArgs;
          try {
            const { uintCV, stringUtf8CV, boolCV } = await import('@stacks/transactions');
            
            clarityArgs = functionArgs.map(arg => {
              // If already a Clarity value, return as-is
              if (arg && typeof arg === 'object' && arg.type) {
                return arg;
              }
              
              // Convert based on type
              if (typeof arg === 'number') {
                return uintCV(arg);
              } else if (typeof arg === 'string') {
                return stringUtf8CV(arg);
              } else if (typeof arg === 'boolean') {
                return boolCV(arg);
              }
              
              // Fallback to raw value
              return arg;
            });
          } catch (error) {
            console.warn('Failed to import Clarity value converters:', error);
            clarityArgs = functionArgs; // Use raw values as fallback
          }
          
          // Try the correct Leather method for contract calls
          console.log('🔍 Trying Leather contract call method...');
            const result = await leather.request({
              method: 'stx_callContract',
              params: {
                contractAddress,
                contractName,
                functionName,
                functionArgs: clarityArgs,
                network: 'testnet'
              }
            });
        
        console.log('✅ Leather contract call successful:', result);
        return result;
      } catch (error) {
        console.log('⚠️ Leather direct contract call failed:', error);
        // Don't fall back to Stacks Connect yet, try alternative methods first
      }
    }
    
    // If wallet is connected but direct methods failed, try alternative approaches
    if (isWalletConnected) {
      console.log('🔍 Wallet is connected but direct methods failed, trying alternative approaches...');
      
      // Try to use the connected wallet through different methods
      if ((window as any).xverse) {
        console.log('🔍 Trying Xverse alternative methods...');
        try {
          const xverse = (window as any).xverse;
          const contractAddress = contractId.split('.')[0];
          const contractName = contractId.split('.')[1];
          
          // Convert to Clarity values
          let clarityArgs;
          try {
            const { uintCV, stringUtf8CV, boolCV } = await import('@stacks/transactions');
            
            clarityArgs = functionArgs.map(arg => {
              // If already a Clarity value, return as-is
              if (arg && typeof arg === 'object' && arg.type) {
                return arg;
              }
              
              // Convert based on type
              if (typeof arg === 'number') {
                return uintCV(arg);
              } else if (typeof arg === 'string') {
                return stringUtf8CV(arg);
              } else if (typeof arg === 'boolean') {
                return boolCV(arg);
              }
              
              // Fallback to raw value
              return arg;
            });
          } catch (error) {
            console.warn('Failed to import Clarity value converters:', error);
            clarityArgs = functionArgs; // Use raw values as fallback
          }
          
          // Try different Sats Connect methods
          const methods = ['stx_callContract', 'callContract', 'sendTransaction'];
          for (const method of methods) {
            try {
              console.log(`🔍 Trying Xverse ${method}...`);
                const result = await xverse.request({
                  method: method,
                  params: {
                    contractAddress,
                    contractName,
                    functionName,
                    functionArgs: clarityArgs,
                    network: 'testnet'
                  }
                });
              console.log(`✅ Xverse ${method} successful:`, result);
              return result;
            } catch (methodError) {
              console.log(`⚠️ Xverse ${method} failed:`, methodError instanceof Error ? methodError.message : String(methodError));
            }
          }
        } catch (error) {
          console.log('⚠️ Xverse alternative methods failed:', error);
        }
      }
      
      if ((window as any).LeatherProvider) {
        console.log('🔍 Trying Leather alternative methods...');
        try {
          const leather = (window as any).LeatherProvider;
          const contractAddress = contractId.split('.')[0];
          const contractName = contractId.split('.')[1];
          
          // Convert to Clarity values
          let clarityArgs;
          try {
            const { uintCV, stringUtf8CV, boolCV } = await import('@stacks/transactions');
            
            clarityArgs = functionArgs.map(arg => {
              // If already a Clarity value, return as-is
              if (arg && typeof arg === 'object' && arg.type) {
                return arg;
              }
              
              // Convert based on type
              if (typeof arg === 'number') {
                return uintCV(arg);
              } else if (typeof arg === 'string') {
                return stringUtf8CV(arg);
              } else if (typeof arg === 'boolean') {
                return boolCV(arg);
              }
              
              // Fallback to raw value
              return arg;
            });
          } catch (error) {
            console.warn('Failed to import Clarity value converters:', error);
            clarityArgs = functionArgs; // Use raw values as fallback
          }
          
          // Try different Leather methods
          const methods = ['stx_callContract', 'callContract', 'sendTransaction'];
          for (const method of methods) {
            try {
              console.log(`🔍 Trying Leather ${method}...`);
                const result = await leather.request({
                  method: method,
                  params: {
                    contractAddress,
                    contractName,
                    functionName,
                    functionArgs: clarityArgs,
                    network: 'testnet'
                  }
                });
              console.log(`✅ Leather ${method} successful:`, result);
              return result;
            } catch (methodError) {
              console.log(`⚠️ Leather ${method} failed:`, methodError instanceof Error ? methodError.message : String(methodError));
            }
          }
        } catch (error) {
          console.log('⚠️ Leather alternative methods failed:', error);
        }
      }
      
      // If all direct methods failed, try to use the wallet's native methods
      console.log('🔍 All direct methods failed, trying native wallet methods...');
      
      // Try to use the wallet's native methods without Stacks Connect
      if ((window as any).xverse && (window as any).xverse.request) {
        try {
          console.log('🔍 Trying Xverse native method...');
          
          // Convert to Clarity values
          let clarityArgs;
          try {
            const { uintCV, stringUtf8CV, boolCV } = await import('@stacks/transactions');
            
            clarityArgs = functionArgs.map(arg => {
              // If already a Clarity value, return as-is
              if (arg && typeof arg === 'object' && arg.type) {
                return arg;
              }
              
              // Convert based on type
              if (typeof arg === 'number') {
                return uintCV(arg);
              } else if (typeof arg === 'string') {
                return stringUtf8CV(arg);
              } else if (typeof arg === 'boolean') {
                return boolCV(arg);
              }
              
              // Fallback to raw value
              return arg;
            });
          } catch (error) {
            console.warn('Failed to import Clarity value converters:', error);
            clarityArgs = functionArgs; // Use raw values as fallback
          }
          
          const result = await (window as any).xverse.request({
            method: 'stx_callContract',
            params: {
              contractAddress: contractId.split('.')[0],
              contractName: contractId.split('.')[1],
              functionName,
              functionArgs: clarityArgs,
              network: 'testnet'
            }
          });
          console.log('✅ Xverse native method successful:', result);
          return result;
        } catch (error) {
          console.log('⚠️ Xverse native method failed:', error);
        }
      }
      
      if ((window as any).LeatherProvider && (window as any).LeatherProvider.request) {
        try {
          console.log('🔍 Trying Leather native method...');
          
          // Convert to Clarity values
          let clarityArgs;
          try {
            const { uintCV, stringUtf8CV, boolCV } = await import('@stacks/transactions');
            
            clarityArgs = functionArgs.map(arg => {
              // If already a Clarity value, return as-is
              if (arg && typeof arg === 'object' && arg.type) {
                return arg;
              }
              
              // Convert based on type
              if (typeof arg === 'number') {
                return uintCV(arg);
              } else if (typeof arg === 'string') {
                return stringUtf8CV(arg);
              } else if (typeof arg === 'boolean') {
                return boolCV(arg);
              }
              
              // Fallback to raw value
              return arg;
            });
          } catch (error) {
            console.warn('Failed to import Clarity value converters:', error);
            clarityArgs = functionArgs; // Use raw values as fallback
          }
          
          const result = await (window as any).LeatherProvider.request({
            method: 'stx_callContract',
            params: {
              contractAddress: contractId.split('.')[0],
              contractName: contractId.split('.')[1],
              functionName,
              functionArgs: clarityArgs,
              network: 'testnet'
            }
          });
          console.log('✅ Leather native method successful:', result);
          return result;
        } catch (error) {
          console.log('⚠️ Leather native method failed:', error);
        }
      }
    }
    
    // Check why we're not using direct wallet calls
    console.log('🔍 === SKIPPING DIRECT WALLET CALLS ===');
    console.log('🔍 Reason: isWalletConnected =', isWalletConnected);
    console.log('🔍 Reason: xverse.request =', !!(window as any).xverse?.request);
    console.log('🔍 Reason: LeatherProvider.request =', !!(window as any).LeatherProvider?.request);
    
    // Fall back to Stacks Connect
    console.log('🔍 === FALLING BACK TO STACKS CONNECT ===');
    console.log('🔍 All direct wallet methods failed, using Stacks Connect');
    console.log('🔍 User session details:', {
      hasUserSession: !!userSession,
      isSignedIn: userSession?.isUserSignedIn?.(),
      hasUserData: !!(userSession as any)?.userData,
      userData: (userSession as any)?.userData
    });

      // If we have a connected wallet but Stacks Connect is failing,
      // try one more time with a different approach
      if (isWalletConnected) {
        console.log('🔍 Wallet is connected but all methods failed, trying one final approach...');

        // Try to use the wallet's native methods one more time
        if ((window as any).xverse && (window as any).xverse.request) {
          try {
            console.log('🔍 Final attempt with Xverse...');
            
            // Convert to Clarity values
            let clarityArgs;
            try {
              const { uintCV, stringUtf8CV, boolCV } = await import('@stacks/transactions');
              
              clarityArgs = functionArgs.map(arg => {
                // If already a Clarity value, return as-is
                if (arg && typeof arg === 'object' && arg.type) {
                  return arg;
                }
                
                // Convert based on type
                if (typeof arg === 'number') {
                  return uintCV(arg);
                } else if (typeof arg === 'string') {
                  return stringUtf8CV(arg);
                } else if (typeof arg === 'boolean') {
                  return boolCV(arg);
                }
                
                // Fallback to raw value
                return arg;
              });
            } catch (error) {
              console.warn('Failed to import Clarity value converters:', error);
              clarityArgs = functionArgs; // Use raw values as fallback
            }
            
            const result = await (window as any).xverse.request({
              method: 'stx_callContract',
              params: {
                contractAddress: contractId.split('.')[0],
                contractName: contractId.split('.')[1],
                functionName,
                functionArgs: clarityArgs,
                network: 'testnet'
              }
            });
            console.log('✅ Final Xverse attempt successful:', result);
            return result;
          } catch (error) {
            console.log('⚠️ Final Xverse attempt failed:', error);
          }
        }

        if ((window as any).LeatherProvider && (window as any).LeatherProvider.request) {
          try {
            console.log('🔍 Final attempt with Leather...');
            
            // Convert to Clarity values
            let clarityArgs;
            try {
              const { uintCV, stringUtf8CV, boolCV } = await import('@stacks/transactions');
              
              clarityArgs = functionArgs.map(arg => {
                // If already a Clarity value, return as-is
                if (arg && typeof arg === 'object' && arg.type) {
                  return arg;
                }
                
                // Convert based on type
                if (typeof arg === 'number') {
                  return uintCV(arg);
                } else if (typeof arg === 'string') {
                  return stringUtf8CV(arg);
                } else if (typeof arg === 'boolean') {
                  return boolCV(arg);
                }
                
                // Fallback to raw value
                return arg;
              });
            } catch (error) {
              console.warn('Failed to import Clarity value converters:', error);
              clarityArgs = functionArgs; // Use raw values as fallback
            }
            
            const result = await (window as any).LeatherProvider.request({
              method: 'stx_callContract',
              params: {
                contractAddress: contractId.split('.')[0],
                contractName: contractId.split('.')[1],
                functionName,
                functionArgs: clarityArgs,
                network: 'testnet'
              }
            });
            console.log('✅ Final Leather attempt successful:', result);
            return result;
          } catch (error) {
            console.log('⚠️ Final Leather attempt failed:', error);
          }
        }
      }

      // Check if we have a valid userSession for Stacks Connect
      if (!userSession) {
        console.error('❌ No userSession available for Stacks Connect contract call');
        throw new Error('Wallet not properly authenticated for contract calls');
      }

      if (!userSession.isUserSignedIn()) {
        console.error('❌ UserSession not signed in for contract call');
        throw new Error('Wallet session not authenticated for contract calls');
    }

    try {
      let openContractCall;
      try {
        console.log('📦 Loading Stacks Connect...');
        const connectModule = await import('@stacks/connect');
        openContractCall = connectModule.openContractCall;
        
        console.log('📦 Stacks Connect loaded:', !!openContractCall);
        console.log('📦 openContractCall type:', typeof openContractCall);
        
        if (!openContractCall || typeof openContractCall !== 'function') {
          throw new Error('openContractCall is not available or not a function');
        }
        console.log('✅ Stacks Connect loaded for contract call');
      } catch (error) {
        console.error('❌ Failed to import openContractCall:', error);
        throw new Error('Stacks Connect library not available for contract calls');
      }

      const network = await getStacksNetwork();
      console.log('🌐 Using network:', network);

      // Convert to Clarity values for Stacks Connect - do it directly to avoid serialization issues
      let clarityArgs;
      try {
        const { uintCV, stringUtf8CV, boolCV } = await import('@stacks/transactions');
        
        clarityArgs = functionArgs.map(arg => {
          // If already a Clarity value, return as-is
          if (arg && typeof arg === 'object' && arg.type) {
            return arg;
          }
          
          // Convert based on type
          if (typeof arg === 'number') {
            return uintCV(arg);
          } else if (typeof arg === 'string') {
            return stringUtf8CV(arg);
          } else if (typeof arg === 'boolean') {
            return boolCV(arg);
          }
          
          // Fallback to raw value
          return arg;
        });
      } catch (error) {
        console.warn('Failed to import Clarity value converters:', error);
        clarityArgs = functionArgs; // Use raw values as fallback
      }

      return new Promise((resolve, reject) => {
        console.log('📞 Calling contract:', {
          contractAddress: contractId.split('.')[0],
          contractName: contractId.split('.')[1],
          functionName,
          functionArgs: clarityArgs
        });
        
        console.log('🚀 Opening contract call popup...');
        console.log('🚀 Transaction details:', {
          userSession: !!userSession,
          contractAddress: contractId.split('.')[0],
          contractName: contractId.split('.')[1],
          functionName,
          functionArgs: clarityArgs,
          network: network,
          appDetails: {
            name: 'CoinQuest',
            icon: `${window.location.origin}/favicon-32x32.png`,
          }
        });
        
        // Add a timeout to detect if popup doesn't open
        const timeout = setTimeout(() => {
          console.log('⏰ Contract call timeout - popup may not have opened');
          reject(new Error('Transaction timeout - wallet popup may not have opened'));
        }, 30000); // 30 second timeout
        
        console.log('🚀 === OPENING CONTRACT CALL ===');
        console.log('🚀 Contract call parameters:', {
          contractAddress: contractId.split('.')[0],
          contractName: contractId.split('.')[1],
          functionName,
          functionArgs: clarityArgs,
          network: network,
          userSession: !!userSession,
          userSessionSignedIn: userSession?.isUserSignedIn?.(),
          appDetails: {
            name: 'CoinQuest',
            icon: `${window.location.origin}/favicon-32x32.png`,
          }
        });
        
        openContractCall({
          contractAddress: contractId.split('.')[0],
          contractName: contractId.split('.')[1],
          functionName,
          functionArgs: clarityArgs,
          network: network as any,
          userSession: userSession,
          appDetails: {
            name: 'CoinQuest',
            icon: `${window.location.origin}/favicon-32x32.png`,
          },
          onFinish: (result) => {
            clearTimeout(timeout);
            console.log('✅ === CONTRACT CALL SUCCESSFUL ===');
            console.log('✅ Result:', result);
            console.log('✅ Transaction details:', {
              txId: result?.txId,
              txStxAddress: (result as any)?.txStxAddress,
              txStxAddressDetails: (result as any)?.txStxAddressDetails
            });
            resolve(result);
          },
          onCancel: () => {
            clearTimeout(timeout);
            console.log('❌ === CONTRACT CALL CANCELED ===');
            console.log('❌ This could mean:');
            console.log('❌ 1. User clicked "Cancel" in wallet popup');
            console.log('❌ 2. User clicked "Yes" but transaction failed');
            console.log('❌ 3. Wallet popup closed unexpectedly');
            console.log('❌ 4. Transaction parameters were invalid');
            console.log('❌ Cancel details:', {
              contractAddress: contractId.split('.')[0],
              contractName: contractId.split('.')[1],
              functionName,
              functionArgs: clarityArgs,
              network: network,
              userSession: !!userSession,
              userSessionSignedIn: userSession?.isUserSignedIn?.()
            });
            reject(new Error('User canceled transaction'));
          },
        });
      });
    } catch (error) {
      console.error('❌ Contract call failed:', error);
      throw error;
    }
  }, [userSession, getStacksNetwork, address, isConnected]);

  // Comprehensive wallet connection check
  const checkWalletConnection = useCallback(() => {
    const hasAddress = !!address;
    const hasUserSession = !!userSession;
    const hasXverse = !!(window as any).xverse?.request;
    const hasLeather = !!(window as any).LeatherProvider?.request;
    const isStacksConnected = userSession?.isUserSignedIn?.();
    
    const connectionStatus = {
      hasAddress,
      hasUserSession,
      hasXverse,
      hasLeather,
      isStacksConnected,
      isConnected,
      overallConnected: hasAddress && (hasUserSession || hasXverse || hasLeather)
    };
    
    console.log('🔍 Comprehensive wallet check:', connectionStatus);
    return connectionStatus;
  }, [address, userSession, isConnected]);

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
    checkWalletConnection,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Add display name for React Fast Refresh
WalletProvider.displayName = 'WalletProvider';