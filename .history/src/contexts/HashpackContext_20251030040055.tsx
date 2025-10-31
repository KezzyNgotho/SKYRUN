import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { HashConnect, HashConnectConnectionState, type SessionData } from 'hashconnect';
import { LedgerId, AccountId, Client, Transaction } from '@hashgraph/sdk';

// Type for transaction input - can be bytes or a transaction object
type TransactionInput = Uint8Array | Transaction;

type HashpackContextType = {
  connected: boolean;
  accountId?: string;
  topic?: string;
  pairingString?: string;
  walletName?: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (txBytesOrTransaction: TransactionInput) => Promise<{ receipt?: unknown; success: boolean }>; 
};

const HashpackContext = createContext<HashpackContextType | undefined>(undefined);

const APP_METADATA = {
  name: 'SkyRun',
  description: 'SkyRun - A blockchain-powered arcade game on Hedera',
  icons: ['https://skyrun.app/icon.png'],
  url: typeof window !== 'undefined' ? window.location.origin : 'https://skyrun.app'
};

// HashConnect v3 requires a WalletConnect Project ID
// Get yours at: https://cloud.walletconnect.com
const PROJECT_ID = '002b886cd4d5603ebf9067f7f4b66938';

export const HashpackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hashconnect, setHashconnect] = useState<HashConnect | null>(null);
  const [pairingData, setPairingData] = useState<SessionData | undefined>();
  const [topic, setTopic] = useState<string | undefined>();
  const [pairingString, setPairingString] = useState<string | undefined>();
  const [status, setStatus] = useState<HashConnectConnectionState>(HashConnectConnectionState.Disconnected);

  useEffect(() => {
    let hc: HashConnect;
    let mounted = true;

    const initHashConnect = async () => {
      try {
        console.log('🔗 Initializing HashConnect v3...');
        
        // NOTE: We do NOT clear WalletConnect sessions automatically
        // HashConnect v3 needs these sessions to restore connections
        // If you have issues, run: clearWalletConnectData() in console
        console.log('💾 Preserving WalletConnect sessions for auto-reconnect');
        
        // Temporarily suppress WalletConnect errors during initialization
        const originalError = console.error;
        console.error = (...args: unknown[]) => {
          const message = args.join(' ');
          if (message.includes('No matching key') || 
              message.includes('expirer') ||
              message.includes('core/expirer') ||
              message.includes('Decoded payload') ||
              message.includes('JSON-RPC request or a response')) {
            // Silently ignore these errors - they're from old/expired sessions
            return;
          }
          originalError.apply(console, args);
        };
        
        try {
          // Create HashConnect instance with proper v3 parameters
          hc = new HashConnect(
            LedgerId.TESTNET,   // Use TESTNET for development
            PROJECT_ID,          // WalletConnect Project ID
            APP_METADATA,        // dApp metadata
            false                // Disable debug mode to reduce console noise
          );
          
          if (!mounted) return;
          setHashconnect(hc);
        } finally {
          // Restore original console.error
          console.error = originalError;
        }

        // IMPORTANT: Set up event listeners BEFORE calling init()
        hc.pairingEvent.on((data: SessionData) => {
          console.log('✅ Pairing successful:', data);
          console.log('Connected account:', data.accountIds?.[0]);
          if (mounted) {
            setPairingData(data);
            setStatus(HashConnectConnectionState.Connected);
            
            // Try to extract topic from pairing data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let pairingTopic = (data as any).topic || (hc as any).hcData?.topic;
            
            // If no topic in pairing data, get it from SignClient
            if (!pairingTopic) {
              console.log('🔍 No topic in pairing data, checking SignClient...');
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const hcAny = hc as any;
              const signClient = hcAny.signClient || hcAny.signingClient || hcAny.client;
              if (signClient) {
                try {
                  const sessions = signClient.session?.getAll?.() || 
                                 Object.values(signClient.session?.values || {});
                  if (sessions && sessions.length > 0) {
                    pairingTopic = sessions[0].topic;
                    console.log('📋 Got topic from SignClient after pairing:', pairingTopic);
                  }
                } catch (e) {
                  console.log('Could not get topic from SignClient:', e);
                }
              }
            }
            
            if (pairingTopic) {
              console.log('📋 Setting topic from pairing:', pairingTopic);
              setTopic(pairingTopic);
            } else {
              console.warn('⚠️ Pairing successful but no topic found!');
            }
          }
        });

        hc.disconnectionEvent.on(() => {
          console.log('❌ Wallet disconnected');
          if (mounted) {
            setPairingData(undefined);
            setStatus(HashConnectConnectionState.Disconnected);
            setTopic(undefined);
          }
        });

        hc.connectionStatusChangeEvent.on((state: HashConnectConnectionState) => {
          console.log('🔄 Connection status:', HashConnectConnectionState[state]);
          if (mounted) {
            setStatus(state);
          }
        });

        // Initialize HashConnect - this will restore previous sessions automatically
        // Suppress WalletConnect errors during init
        console.error = (...args: unknown[]) => {
          const message = args.join(' ');
          if (message.includes('No matching key') || 
              message.includes('expirer') ||
              message.includes('core/expirer') ||
              message.includes('Decoded payload') ||
              message.includes('JSON-RPC request or a response')) {
            return;
          }
          originalError.apply(console, args);
        };
        
        try {
          await hc.init();
          console.log('✅ HashConnect initialized');
        } finally {
          // Restore original console.error
          console.error = originalError;
        }
        
        // Give HashConnect time to restore sessions from its internal storage
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!mounted) return;
        
        // Debug: Log entire HashConnect structure to find topic
        console.log('🔍 HashConnect instance:', hc);
        console.log('🔍 HashConnect keys:', Object.keys(hc));
        console.log('🔍 HashConnect hcData:', (hc as any).hcData); // eslint-disable-line @typescript-eslint/no-explicit-any
        
        // Try multiple ways to get topic
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hcAny = hc as any;
        
        // Try to get topic from SignClient sessions
        let hcTopic = hcAny.hcData?.topic || 
                     hcAny.topic || 
                     hcAny._topic ||
                     hcAny.connectionState?.topic;
        
        // If no topic, try to get from SignClient
        if (!hcTopic) {
          console.log('🔍 No direct topic, checking SignClient...');
          const signClient = hcAny.signClient || hcAny.signingClient || hcAny.client;
          if (signClient) {
            console.log('🔍 SignClient keys:', Object.keys(signClient));
            try {
              const sessions = signClient.session?.getAll?.() || 
                             Object.values(signClient.session?.values || {});
              console.log('🔍 Initial sessions:', sessions);
              if (sessions && sessions.length > 0) {
                hcTopic = sessions[0].topic;
                console.log('📋 Got topic from SignClient session:', hcTopic);
              }
            } catch (e) {
              console.log('Could not get sessions:', e);
            }
          }
        }
                       
        const hcPairingString = hcAny.hcData?.pairingString || 
                                hcAny.pairingString ||
                                hcAny._pairingString;
        
        setTopic(hcTopic);
        setPairingString(hcPairingString);
        console.log('📋 Topic found:', hcTopic);
        console.log('🔗 Pairing string:', hcPairingString);

        // Check if HashConnect restored a previous session
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hcDataAny = hc as any;
        const savedPairings = hcDataAny.hcData?.pairingData || 
                             hcDataAny.pairingData || 
                             [];
        
        if (savedPairings.length > 0) {
          console.log('✅ HashConnect restored existing session');
          console.log('Restored pairing object:', savedPairings[0]);
          
          if (mounted) {
            const restoredPairing = savedPairings[0];
            setPairingData(restoredPairing);
            setStatus(HashConnectConnectionState.Connected);
            
            // Try to extract topic from multiple possible locations in pairing data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rpAny = restoredPairing as any;
            const restoredTopic = rpAny.topic || 
                                 rpAny.metadata?.topic ||
                                 rpAny.pairingTopic ||
                                 hcTopic;
            
            if (restoredTopic) {
              console.log('📋 Setting topic from restored pairing:', restoredTopic);
              setTopic(restoredTopic);
            } else {
              console.warn('⚠️ No topic found in restored pairing!');
              console.warn('Pairing keys:', Object.keys(restoredPairing));
            }
          }
        } else {
          console.log('📭 No existing sessions found - user needs to connect wallet');
        }

        // Expose global connect function for legacy buttons
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).connectWallet = async () => {
          try {
            console.log('🔌 Attempting to connect to Hedera wallet...');
            
            // Try to open pairing modal - HashConnect will handle extension detection
            await hc.openPairingModal();
          } catch (e) {
            console.error('❌ Connect failed:', e);
            const error = e as Error;
            
            // Check if it's a "no extension" type error
            if (error?.message?.includes('extension') || error?.message?.includes('wallet')) {
              alert('Please install HashPack or Blade wallet extension first!\n\nHashPack: https://www.hashpack.app/download\nBlade: https://bladewallet.io/');
            } else {
              alert('Failed to connect wallet. Error: ' + (error?.message || 'Unknown error'));
            }
          }
        };

        // Add global function to manually clear all WalletConnect data
        // Only use this if you're having connection issues!
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).clearWalletConnectData = async () => {
          console.warn('⚠️ MANUAL CLEAR: This will disconnect your wallet and clear all sessions!');
          
          // Disconnect first
          try {
            if (hc) {
              await hc.disconnect();
              console.log('✅ Disconnected from HashConnect');
            }
          } catch (e) {
            console.warn('Could not disconnect:', e);
          }
          
          // Clear all WalletConnect storage
          const keysRemoved: string[] = [];
          Object.keys(localStorage).forEach(key => {
            if (key.includes('wc@2') || key.includes('walletconnect')) {
              localStorage.removeItem(key);
              keysRemoved.push(key);
            }
          });
          
          console.log('🗑️ Removed', keysRemoved.length, 'WalletConnect keys');
          console.log('✅ Cleared! Refreshing page...');
          setTimeout(() => location.reload(), 500);
        };

        // Add global debug function
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).debugWallet = () => {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('🔍 Wallet Connection Debug Info:');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('Connected:', !!pairingData);
          console.log('Account ID:', pairingData?.accountIds?.[0] || 'None');
          console.log('Status:', HashConnectConnectionState[status]);
          console.log('Topic (state):', topic || 'None');
          console.log('HashConnect initialized:', !!hc);
          
          // Try to get topic from multiple sources
          if (hc) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const hcTopic = (hc as any).hcData?.topic || (hc as any).topic;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pairingTopic = (pairingData as any)?.topic;
            console.log('Topic (HashConnect):', hcTopic || 'None');
            console.log('Topic (PairingData):', pairingTopic || 'None');
          }
          
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('Pairing Data:', pairingData);
          
          // Check for React wallet functions
          if (window.reactWalletFunctions) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('React Wallet Functions:', window.reactWalletFunctions.getWalletStatus());
          }
          
          // Check localStorage for WalletConnect data
          const wcKeys = Object.keys(localStorage).filter(key => 
            key.includes('wc@2') || key.includes('walletconnect')
          );
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('WalletConnect Storage Keys:', wcKeys.length);
          wcKeys.forEach(key => console.log('  -', key));
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          
          return {
            connected: !!pairingData,
            accountId: pairingData?.accountIds?.[0],
            status,
            topic,
            hasHashConnect: !!hc
          };
        };

        console.log('✅ HashConnect setup complete');
        console.log('💡 Debug commands:');
        console.log('  - debugWallet() - Check wallet connection status');
        console.log('  - clearWalletConnectData() - Clear all sessions and refresh');
      } catch (error) {
        console.error('❌ HashConnect initialization failed:', error);
        console.error('Make sure you have a valid WalletConnect Project ID');
      }
    };

    initHashConnect();

    return () => {
      // Cleanup on unmount
      mounted = false;
      try {
        if (hc) {
          hc.disconnect();
        }
      } catch (e) {
        console.error('Disconnect error:', e);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<HashpackContextType>(() => {
    // Log connection state for debugging (uses status to avoid unused variable warning)
    if (process.env.NODE_ENV === 'development') {
      console.debug('Wallet state:', { 
        connected: !!pairingData && !!pairingData.accountIds?.length, 
        status: HashConnectConnectionState[status],
        accountId: pairingData?.accountIds?.[0] 
      });
    }
    
    return {
      // Connected if we have pairing data - status may not immediately reflect connection state during restoration
      connected: !!pairingData && !!pairingData.accountIds?.length,
      accountId: pairingData?.accountIds?.[0],
      topic,
      pairingString,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      walletName: (pairingData as any)?.metadata?.name,
      connect: async () => {
      if (!hashconnect) {
        console.error('HashConnect not initialized');
        alert('Wallet connection not ready. Please refresh the page.');
        return;
      }
      
      try {
        console.log('🔌 Attempting to connect to Hedera wallet...');
        console.log('💡 If you see "Failed to launch wc:..." error, this is normal.');
        console.log('   The HashPack extension should intercept it automatically.');
        
        // Check if HashPack extension is installed
        const checkExtension = () => {
          return new Promise<boolean>((resolve) => {
            // Give extension time to inject itself
            setTimeout(() => {
              const w = window as { hashpack?: unknown; ethereum?: { isHashPack?: boolean } };
              const hasHashPack = !!w.hashpack || 
                                 !!document.querySelector('[data-hashpack]') ||
                                 !!w.ethereum?.isHashPack;
              resolve(hasHashPack);
            }, 500);
          });
        };

        const hasExtension = await checkExtension();
        
        if (!hasExtension) {
          console.warn('⚠️ HashPack extension not detected');
          const shouldInstall = confirm(
            '⚠️ HashPack Wallet Extension Not Detected\n\n' +
            'Please install the HashPack extension to connect your wallet.\n\n' +
            'After installing:\n' +
            '1. Enable the extension in your browser\n' +
            '2. Refresh this page\n' +
            '3. Click "Connect Wallet" again\n\n' +
            'Click OK to go to the HashPack download page.'
          );
          if (shouldInstall) {
            window.open('https://www.hashpack.app/download', '_blank');
          }
          return;
        }
        
        // Open pairing modal - extension should handle the wc: protocol
        await hashconnect.openPairingModal();
        
        console.log('✅ Pairing request sent - check your HashPack extension!');
      } catch (e) {
        const error = e as Error;
        console.error('❌ Connect error:', error);
        
        // The "Failed to launch wc:..." is not actually an error we can catch
        // It's a browser security warning when no handler is registered
        // The extension should still receive the pairing request
        
        if (error?.message?.includes('extension') || error?.message?.includes('No extension found')) {
          alert(
            'HashPack wallet extension not found!\n\n' +
            'Please:\n' +
            '1. Install HashPack from: https://www.hashpack.app/download\n' +
            '2. Enable the extension in your browser\n' +
            '3. Refresh this page and try again'
          );
        } else {
          console.warn('Connection attempt completed. Check your HashPack extension for pairing request.');
        }
      }
    },
    disconnect: async () => {
      if (!hashconnect) {
        console.error('Cannot disconnect: HashConnect not initialized');
        return;
      }
      try {
        console.log('🔌 Disconnecting wallet...');
        
        // Disconnect from HashConnect - it will handle session cleanup
        await hashconnect.disconnect();
        
        // Clear local state
        setPairingData(undefined);
        setStatus(HashConnectConnectionState.Disconnected);
        setTopic(undefined);
        
        console.log('✅ Wallet disconnected successfully');
      } catch (error) {
        console.error('❌ Disconnect error:', error);
        // Force clear state even if disconnect fails
        setPairingData(undefined);
        setStatus(HashConnectConnectionState.Disconnected);
        setTopic(undefined);
      }
    },
    sendTransaction: async (txBytesOrTransaction: TransactionInput) => {
      if (!hashconnect || !pairingData || !pairingData.accountIds?.length) {
        console.error('Transaction failed - missing required data:', {
          hasHashConnect: !!hashconnect,
          hasPairingData: !!pairingData,
          hasAccountIds: !!pairingData?.accountIds?.length
        });
        throw new Error('HashPack not paired. Please connect your wallet first.');
      }
      
      const accountId = pairingData.accountIds[0];
      console.log('📤 Preparing transaction for account:', accountId);
      
      try {
        // HashConnect v3 CORRECT API: Use getSigner() then call methods on the signer
        // This is the official HashConnect v3 pattern
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hc = hashconnect as any;
        
        console.log('Getting HashConnect signer...');
        const signer = hc.getSigner(AccountId.fromString(accountId));
        
        if (!signer) {
          throw new Error('Could not get signer from HashConnect. Please reconnect your wallet.');
        }
        
        console.log('✅ Signer obtained:', signer);
        console.log('Signer type:', typeof signer);
        console.log('Signer constructor:', signer?.constructor?.name);
        
        // Safely log signer methods
        try {
          const proto = Object.getPrototypeOf(signer);
          if (proto) {
            console.log('Signer prototype methods:', Object.getOwnPropertyNames(proto));
          }
          console.log('Signer own properties:', Object.getOwnPropertyNames(signer));
        } catch (e) {
          console.log('Could not inspect signer:', e);
        }
        
        // CORRECT HashConnect v3 pattern: Use freezeWithSigner and signWithSigner
        console.log('Preparing transaction...');
        console.log('Input type:', typeof txBytesOrTransaction);
        
        // Import Transaction from Hedera SDK
        const { Transaction } = await import('@hashgraph/sdk');
        
        let transaction;
        try {
          // If we received bytes, convert to Transaction object
          if (txBytesOrTransaction instanceof Uint8Array) {
            console.log('Converting bytes to Transaction...');
            transaction = Transaction.fromBytes(txBytesOrTransaction);
          } else {
            // Already a transaction object
            console.log('Using transaction object directly');
            transaction = txBytesOrTransaction;
          }
          
          console.log('✅ Transaction object ready');
          console.log('Transaction type:', transaction.constructor.name);
          
        } catch (convError) {
          console.error('❌ Failed to prepare transaction:', convError);
          throw new Error('Could not prepare transaction object');
        }
        
        // CORRECT pattern: Set operator, generate TransactionId, freeze, THEN execute
        let result;
        
        try {
          console.log('Step 1: Setting up transaction with fresh timestamp...');
          const client = Client.forTestnet();
          
          // Set operator to the connected account - this auto-generates TransactionId on freeze
          client.setOperator(AccountId.fromString(accountId), signer);
          
          console.log('Step 2: Freezing transaction with client...');
          const frozenTx = await transaction.freezeWith(client);
          console.log('✅ Transaction frozen with fresh timestamp');
          
          console.log('Step 2: Executing transaction with signer...');
          
          // Method 1: Try executeWithSigner on frozen transaction
          if (typeof frozenTx.executeWithSigner === 'function') {
            console.log('Using frozenTx.executeWithSigner(signer)...');
            const response = await frozenTx.executeWithSigner(signer);
            console.log('✅ Transaction executed!');
            console.log('Transaction response:', response);
            
            // Get receipt
            console.log('Step 3: Getting receipt...');
            const receipt = await response.getReceipt(client);
            console.log('✅ Receipt received!');
            result = receipt;
          }
          // Method 2: Try signer.call with frozen transaction
          else if (typeof signer.call === 'function') {
            console.log('Using signer.call(frozenTx)...');
            result = await signer.call(frozenTx);
            console.log('✅ Transaction executed via signer.call!');
          }
          // Method 3: Manual sign and execute
          else {
            console.log('Using manual sign and execute...');
            
            // Get transaction bytes from frozen transaction
            const txBytes = frozenTx.toBytes();
            console.log('Transaction bytes length:', txBytes.length);
            
            // Try to execute via signer
            console.log('Calling signer with transaction bytes...');
            const signedBytes = await signer.signTransaction(Transaction.fromBytes(txBytes));
            console.log('✅ Transaction signed');
            
            // Execute the signed transaction
            const response = await signedBytes.execute(client);
            console.log('✅ Transaction executed');
            
            // Get receipt
            const receipt = await response.getReceipt(client);
            console.log('✅ Receipt received');
            result = receipt;
          }
          
          console.log('✅ Transaction completed successfully!');
          console.log('Result:', result);
          
          // Return success
          return { success: true, receipt: result };
          
        } catch (methodError) {
          console.error('❌ Error during transaction execution:', methodError);
          throw methodError;
        }
        
      } catch (error) {
        console.error('❌ Transaction failed:', error);
        console.error('Error details:', error);
        
        // HashConnect errors are objects with {code, message, data}
        if (error && typeof error === 'object') {
          const hcError = error as { code?: number; message?: unknown; data?: { status?: string } };
          
          // Log structured error details
          if (hcError.code !== undefined) {
            console.error('Error code:', hcError.code);
            console.error('Error message:', hcError.message);
            console.error('Error data:', hcError.data);
            
            // Check specific error status
            if (hcError.code === 9000) {
              // Check if it's a transaction expired error
              if (hcError.data?.status === 'TRANSACTION_EXPIRED') {
                throw new Error('Transaction expired. Please try again and approve more quickly.');
              }
              // Check if it's an invalid duration error
              if (hcError.data?.status === 'INVALID_TRANSACTION_DURATION') {
                throw new Error('Invalid transaction duration. Please try again.');
              }
              // Otherwise it's a user rejection
              throw new Error('Transaction rejected by user in HashPack wallet.');
            }
          }
          
          // Check for specific error types in message string
          const errorMsg = (error as Error).message || '';
          if (typeof errorMsg === 'string') {
            if (errorMsg.includes('session') || errorMsg.includes('signer')) {
              throw new Error('Wallet connection lost. Please click "Connect Wallet" again.');
            }
          }
        }
        
        throw error;
      }
    }
  };
  }, [pairingData, topic, pairingString, hashconnect, status]);

  return <HashpackContext.Provider value={value}>{children}</HashpackContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useHashpack() {
  const ctx = useContext(HashpackContext);
  if (!ctx) throw new Error('useHashpack must be used within HashpackProvider');
  return ctx;
}
