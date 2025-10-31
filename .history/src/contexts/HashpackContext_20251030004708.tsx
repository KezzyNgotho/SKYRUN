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
  sendTransaction: (txBytes: Uint8Array) => Promise<any>; 
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
          }
        });

        hc.disconnectionEvent.on((topic: string) => {
          console.log('❌ Wallet disconnected, topic:', topic);
          if (mounted) {
            setPairingData(undefined);
            setStatus(HashConnectConnectionState.Disconnected);
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
        
        // Access topic and pairingString from the instance
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hcTopic = (hc as any).hcData?.topic || (hc as any).topic;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hcPairingString = (hc as any).hcData?.pairingString || (hc as any).pairingString;
        
        setTopic(hcTopic);
        setPairingString(hcPairingString);
        console.log('📋 Topic:', hcTopic);
        console.log('🔗 Pairing string:', hcPairingString);

        // Check if HashConnect restored a previous session
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hcDataAny = hc as any;
        const savedPairings = hcDataAny.hcData?.pairingData || 
                             hcDataAny.pairingData || 
                             [];
        
        if (savedPairings.length > 0) {
          console.log('✅ HashConnect restored existing session:', savedPairings[0]);
          if (mounted) {
            setPairingData(savedPairings[0]);
            setStatus(HashConnectConnectionState.Connected);
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

        console.log('✅ HashConnect setup complete');
        console.log('💡 To clear sessions: run clearWalletConnectData() in console');
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
  }, []);

  const value = useMemo<HashpackContextType>(() => ({
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
          return new Promise((resolve) => {
            // Give extension time to inject itself
            setTimeout(() => {
              const hasHashPack = !!(window as any).hashpack || 
                                 document.querySelector('[data-hashpack]') ||
                                 !!(window as any).ethereum?.isHashPack;
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
      if (!hashconnect || !topic) {
        console.error('Cannot disconnect: HashConnect not initialized or no topic');
        return;
      }
      try {
        await hashconnect.disconnect();
        setPairingData(undefined);
        localStorage.removeItem('hashconnectData');
      } catch (error) {
        console.error('❌ Disconnect error:', error);
      }
    },
    sendTransaction: async (txBytes: Uint8Array) => {
      if (!hashconnect || !topic || !pairingData || !pairingData.accountIds?.length) {
        throw new Error('HashPack not paired. Please connect your wallet first.');
      }
      
      const accountId = pairingData.accountIds[0];
      console.log('📤 Sending transaction for account:', accountId);
      
      try {
        // HashConnect v3 sendTransaction - try both signatures for compatibility
        let result;
        try {
          // Try v3.0.14+ signature (2 params)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result = await (hashconnect as any).sendTransaction(topic, {
            topic,
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
            topic,
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
  }), [pairingData, status, topic, pairingString, hashconnect]);

  return <HashpackContext.Provider value={value}>{children}</HashpackContext.Provider>;
};

export function useHashpack() {
  const ctx = useContext(HashpackContext);
  if (!ctx) throw new Error('useHashpack must be used within HashpackProvider');
  return ctx;
}
