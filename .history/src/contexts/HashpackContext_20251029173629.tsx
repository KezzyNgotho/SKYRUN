import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { HashConnect, HashConnectConnectionState, HashConnectTypes } from 'hashconnect';

type HashpackContextType = {
  connected: boolean;
  accountId?: string;
  topic?: string;
  pairing?: HashConnectTypes.SavedPairingData;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (txBytes: Uint8Array) => Promise<HashConnectTypes.TransactionResponse>; 
};

const HashpackContext = createContext<HashpackContextType | undefined>(undefined);

const APP_METADATA: HashConnectTypes.AppMetadata = {
  name: 'SkyRun',
  description: 'SkyRun Hedera DApp',
  icon: 'https://skyrun.app/icon.png'
};

export const HashpackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hashconnect, setHashconnect] = useState<HashConnect | null>(null);
  const [pairingData, setPairingData] = useState<HashConnectTypes.SavedPairingData | undefined>();
  const [topic, setTopic] = useState<string | undefined>();
  const [status, setStatus] = useState<HashConnectConnectionState>(HashConnectConnectionState.Disconnected);

  useEffect(() => {
    const hc = new HashConnect(true);
    setHashconnect(hc);

    (async () => {
      const initData = await hc.init(APP_METADATA, 'testnet', false);
      setTopic(initData.topic);

      hc.foundExtensionEvent.once((walletMetadata) => {
        // auto-pair when wallet is found
        hc.connectToLocalWallet();
      });

      hc.pairingEvent.on((data) => {
        setPairingData(data);
      });

      hc.connectionStatusChangeEvent.on((s) => setStatus(s));

      // try to rehydrate saved pairing
      const saved = localStorage.getItem('hashconnectData');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as { pairingData?: HashConnectTypes.SavedPairingData };
          if (parsed.pairingData) setPairingData(parsed.pairingData);
        } catch {}
      }
    })();

    return () => {
      hc.disconnect();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('hashconnectData', JSON.stringify({ pairingData }));
  }, [pairingData]);

  const value = useMemo<HashpackContextType>(() => ({
    connected: !!pairingData && status === HashConnectConnectionState.Connected,
    accountId: pairingData?.accountIds?.[0],
    topic,
    pairing: pairingData,
    connect: async () => {
      if (!hashconnect) return;
      await hashconnect.connectToLocalWallet();
    },
    disconnect: async () => {
      if (!hashconnect || !topic) return;
      await hashconnect.disconnect(topic);
      setPairingData(undefined);
    },
    sendTransaction: async (txBytes: Uint8Array) => {
      if (!hashconnect || !topic || !pairingData || !pairingData.accountIds?.length) {
        throw new Error('HashPack not paired');
      }
      const acct = pairingData.accountIds[0];
      const res = await hashconnect.sendTransaction(topic, {
        topic,
        byteArray: txBytes,
        metadata: { accountToSign: acct, returnTransaction: false }
      }, acct);
      if (!res?.receipt) return res;
      return res;
    }
  }), [pairingData, status, topic, hashconnect]);

  return <HashpackContext.Provider value={value}>{children}</HashpackContext.Provider>;
};

export function useHashpack() {
  const ctx = useContext(HashpackContext);
  if (!ctx) throw new Error('useHashpack must be used within HashpackProvider');
  return ctx;
}


