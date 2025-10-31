import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { HashConnect, HashConnectConnectionState, type SessionData } from 'hashconnect';
import { LedgerId } from '@hashgraph/sdk';

type HashpackContextType = {
  connected: boolean;
  accountId?: string;
  topic?: string;
  pairingString?: string;
  walletName?: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (txBytes: Uint8Array) => Promise<{ receipt?: unknown; success: boolean }>; 
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
        
        // Clear old/corrupted WalletConnect sessions that cause "No matching key" errors
        try {
          const keysToCheck = Object.keys(localStorage).filter(key => 
            key.includes('wc@2') || key.includes('walletconnect')
          );
          
          if (keysToCheck.length > 0) {
            console.log('🧹 Clearing old WalletConnect sessions to prevent errors...');
            keysToCheck.forEach(key => {
              try {
                localStorage.removeItem(key);
              } catch {
                // Ignore errors when removing keys
              }
            });
            console.log('✅ Cleared', keysToCheck.length, 'old session(s)');
          }
        } catch (e) {
          console.warn('Could not clear old sessions:', e);
        }
        
        // Create HashConnect instance with proper v3 parameters
        hc = new HashConnect(
          LedgerId.TESTNET,   // Use TESTNET for development
          PROJECT_ID,          // WalletConnect Project ID
          APP_METADATA,        // dApp metadata
          false                // Disable debug mode to reduce console noise
        );
        
        if (!mounted) return;
        setHashconnect(hc);

        // IMPORTANT: Set up event listeners BEFORE calling init()
        hc.pairingEvent.on((data: SessionData) => {
          console.log('✅ Pairing successful:', data);
          console.log('Connected account:', data.accountIds?.[0]);
          if (mounted) {
            setPairingData(data);
            setStatus(HashConnectConnectionState.Connected);
            
            // Extract and set topic from pairing data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pairingTopic = (data as any).topic || (hc as any).hcData?.topic;
            if (pairingTopic) {
              console.log('📋 Setting topic from pairing:', pairingTopic);
              setTopic(pairingTopic);
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
        await hc.init();
        console.log('✅ HashConnect initialized');
        
        // Give HashConnect time to restore sessions from its internal storage
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!mounted) return;
        
        // Debug: Log entire HashConnect structure to find topic
        console.log('🔍 HashConnect instance:', hc);
        console.log('🔍 HashConnect hcData:', (hc as any).hcData); // eslint-disable-line @typescript-eslint/no-explicit-any
        
        // Try multiple ways to get topic
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hcAny = hc as any;
        const hcTopic = hcAny.hcData?.topic || 
                       hcAny.topic || 
                       hcAny._topic ||
                       hcAny.connectionState?.topic;
                       
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).clearWalletConnectData = async () => {
          console.log('🧹 Manually clearing all WalletConnect data...');
          
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
          Object.keys(localStorage).forEach(key => {
            if (key.includes('wc@2') || key.includes('walletconnect')) {
              localStorage.removeItem(key);
              console.log('🗑️ Removed:', key);
            }
          });
          
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
    sendTransaction: async (txBytes: Uint8Array) => {
      if (!hashconnect || !pairingData || !pairingData.accountIds?.length) {
        console.error('Transaction failed - missing required data:', {
          hasHashConnect: !!hashconnect,
          hasPairingData: !!pairingData,
          hasAccountIds: !!pairingData?.accountIds?.length,
          topic
        });
        throw new Error('HashPack not paired. Please connect your wallet first.');
      }
      
      const accountId = pairingData.accountIds[0];
      
      // Try to get topic from multiple sources
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hcAny = hashconnect as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdAny = pairingData as any;
      
      let activeTopic = topic || 
                       pdAny.topic || 
                       hcAny.hcData?.topic ||
                       hcAny.topic;
      
      // If still no topic, try to get it from all available pairings
      if (!activeTopic) {
        console.log('🔍 Topic not in state, checking all pairings...');
        const allPairings = hcAny.hcData?.pairingData || hcAny.pairingData || [];
        console.log('🔍 Available pairings:', allPairings);
        
        if (allPairings.length > 0) {
          // Use the topic from the first pairing
          activeTopic = allPairings[0].topic;
          console.log('📋 Using topic from first pairing:', activeTopic);
          
          // Update state for future use
          if (activeTopic) {
            setTopic(activeTopic);
          }
        }
      }
      
      // Last resort: try to get from WalletConnect SignClient
      if (!activeTopic && hcAny.signingClient) {
        console.log('🔍 Checking WalletConnect SignClient for topics...');
        try {
          const sessions = hcAny.signingClient.session?.getAll?.() || [];
          console.log('🔍 WalletConnect sessions:', sessions);
          if (sessions.length > 0) {
            activeTopic = sessions[0].topic;
            console.log('📋 Using topic from WalletConnect session:', activeTopic);
            if (activeTopic) {
              setTopic(activeTopic);
            }
          }
        } catch (e) {
          console.log('Could not get sessions from SignClient:', e);
        }
      }
      
      if (!activeTopic) {
        console.error('❌ No topic found anywhere!');
        console.error('State topic:', topic);
        console.error('PairingData:', pairingData);
        console.error('HashConnect hcData:', hcAny.hcData);
        throw new Error('Connection topic not found. Please disconnect and reconnect your wallet.');
      }
      
      console.log('📤 Sending transaction for account:', accountId, 'on topic:', activeTopic);
      
      try {
        // HashConnect v3 sendTransaction - try both signatures for compatibility
        let result;
        try {
          // Try v3.0.14+ signature (2 params)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result = await (hashconnect as any).sendTransaction(activeTopic, {
            topic: activeTopic,
            byteArray: txBytes,
            metadata: {
              accountToSign: accountId,
              returnTransaction: false
            }
          });
        } catch {
          // Fallback to single param signature
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result = await (hashconnect as any).sendTransaction({
            topic: activeTopic,
            byteArray: txBytes,
            metadata: {
              accountToSign: accountId,
              returnTransaction: false
            }
          });
        }
        
        console.log('✅ Transaction sent:', result);
        return result;
      } catch (error) {
        console.error('❌ Transaction failed:', error);
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
