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

    const initHashConnect = async () => {
      try {
        console.log('🔗 Initializing HashConnect v3...');
        
        // Create HashConnect instance with proper v3 parameters
        hc = new HashConnect(
          LedgerId.TESTNET,   // Use TESTNET for development
          PROJECT_ID,          // WalletConnect Project ID
          APP_METADATA,        // dApp metadata
          true                 // Enable debug mode
        );
        
        setHashconnect(hc);

        // IMPORTANT: Set up event listeners BEFORE calling init()
        hc.pairingEvent.on((data: SessionData) => {
          console.log('✅ Pairing event:', data);
          setPairingData(data);
        });

        hc.disconnectionEvent.on((data: any) => {
          console.log('❌ Disconnection event:', data);
          setPairingData(undefined);
        });

        hc.connectionStatusChangeEvent.on((state: HashConnectConnectionState) => {
          console.log('🔄 Connection status:', state);
          setStatus(state);
        });

        // Initialize HashConnect
        await hc.init();
        console.log('✅ HashConnect initialized');
        
        // Access topic and pairingString from the instance
        const hcTopic = (hc as any).hcData?.topic || (hc as any).topic;
        const hcPairingString = (hc as any).hcData?.pairingString || (hc as any).pairingString;
        
        setTopic(hcTopic);
        setPairingString(hcPairingString);
        console.log('📋 Topic:', hcTopic);
        console.log('🔗 Pairing string:', hcPairingString);

        // Expose global connect function for legacy buttons
        (window as any).connectWallet = async () => {
          try {
            console.log('🔌 Opening pairing modal...');
            await hc.openPairingModal();
          } catch (e) {
            console.error('❌ Connect failed:', e);
          }
        };

        console.log('✅ HashConnect setup complete');
      } catch (error) {
        console.error('❌ HashConnect initialization failed:', error);
        console.error('Make sure you have a valid WalletConnect Project ID');
      }
    };

    initHashConnect();

    return () => {
      // Cleanup on unmount
      try {
        if (hc) {
          hc.disconnect();
        }
      } catch (e) {
        console.error('Disconnect error:', e);
      }
    };
  }, []);

  useEffect(() => {
    if (pairingData) {
      localStorage.setItem('hashconnectData', JSON.stringify(pairingData));
    }
  }, [pairingData]);

  const value = useMemo<HashpackContextType>(() => ({
    connected: !!pairingData && status === HashConnectConnectionState.Connected,
    accountId: pairingData?.accountIds?.[0],
    topic,
    pairingString,
    walletName: (pairingData as any)?.metadata?.name,
    connect: async () => {
      if (!hashconnect) {
        console.error('HashConnect not initialized');
        return;
      }
      try {
        console.log('🔌 Opening pairing modal...');
        await hashconnect.openPairingModal();
      } catch (error) {
        console.error('❌ Connect error:', error);
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
          result = await (hashconnect as any).sendTransaction(topic, {
            topic,
            byteArray: txBytes,
            metadata: {
              accountToSign: accountId,
              returnTransaction: false
            }
          });
        } catch (e) {
          // Fallback to single param signature
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
