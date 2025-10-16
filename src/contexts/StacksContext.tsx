import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';

const USE_TESTNET = true;

// Stacks contracts from deployments/Testnet.toml
const STACKS_DEPLOYER = 'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1';
const STACKS_CONTRACTS = {
  GameTokenV2: `${STACKS_DEPLOYER}.GameTokenV2`,
  QuestRewardsV2: `${STACKS_DEPLOYER}.QuestRewardsV2`,
  PlayerProfileV2: `${STACKS_DEPLOYER}.PlayerProfileV2`,
};

interface StacksContextType {
  userSession: UserSession | null;
  account: string | null;
  stxBalance: number | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  callContract: (contractId: string, functionName: string, functionArgs: any[]) => Promise<any>;
  getContractId: (name: string) => string | null;
}

const StacksContext = createContext<StacksContextType | undefined>(undefined);

export const useStacks = () => {
  const context = useContext(StacksContext);
  if (!context) {
    throw new Error('useStacks must be used within a WalletStacksProvider');
  }
  return context;
};

interface StacksProviderProps {
  children: ReactNode;
}

// Helper to get a Stacks network instance without static ESM named imports
async function createStacksNetwork(): Promise<any | null> {
  try {
    const mod: any = await import('@stacks/network');
    const NetworkCtor = (USE_TESTNET ? (mod.StacksTestnet || mod.default?.StacksTestnet) : (mod.StacksMainnet || mod.default?.StacksMainnet));
    if (typeof NetworkCtor === 'function') {
      return new NetworkCtor();
    }
    // Fallback shape for openContractCall if constructors not exposed
    return USE_TESTNET
      ? { coreApiUrl: 'https://stacks-node-api.testnet.stacks.co' }
      : { coreApiUrl: 'https://stacks-node-api.mainnet.stacks.co' };
  } catch (_) {
    return USE_TESTNET
      ? { coreApiUrl: 'https://stacks-node-api.testnet.stacks.co' }
      : { coreApiUrl: 'https://stacks-node-api.mainnet.stacks.co' };
  }
}

export const WalletStacksProvider: React.FC<StacksProviderProps> = ({ children }) => {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [stxBalance, setStxBalance] = useState<number | null>(null);

  const getAddrFromUserData = (userData: any) => {
    const profile = userData?.profile || {};
    return USE_TESTNET
      ? (profile.stxAddress?.testnet || profile.stxAddress?.mainnet)
      : (profile.stxAddress?.mainnet || profile.stxAddress?.testnet);
  };

  const refreshBalance = async (addr?: string) => {
    const address = addr || account;
    if (!address) {
      setStxBalance(null);
      return;
    }

    try {
      const base = USE_TESTNET ? 'https://stacks-node-api.testnet.stacks.co' : 'https://stacks-node-api.mainnet.stacks.co';
      const resp = await fetch(`${base}/v2/accounts/${address}`);
      if (!resp.ok) throw new Error('balance http ' + resp.status);
      const data = await resp.json();
      const micro = Number(data.balance || 0);
      setStxBalance(micro / 1_000_000);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setStxBalance(null);
    }
  };

  const connectWallet = async () => {
    try {
      // Try direct providers first
      const leather = (window as any).StacksProvider || (window as any).LeatherProvider;
      if (leather) {
        let resp = null as any;
        try { if (typeof leather.request === 'function') resp = await leather.request({ method: 'stx_requestAccounts' }); } catch(_){ }
        if (!resp) { try { if (typeof leather.connect === 'function') resp = await leather.connect(); } catch(_){ } }
        if (!resp) { try { if (typeof leather.getAddresses === 'function') resp = await leather.getAddresses(); } catch(_){ } }
        if (!resp && typeof leather.requestAccounts === 'function') { try { resp = await leather.requestAccounts(); } catch(_){ } }
        const addr = extractStxAddress(resp);
        if (addr) {
          setAccount(addr);
          await refreshBalance(addr);
          return;
        }
      }

      // Fallback to Stacks Connect
      const appConfig = new AppConfig(['store_write', 'publish_data']);
      const session = new UserSession({ appConfig });
      
      await new Promise<void>((resolve, reject) => {
        showConnect({
          appDetails: { name: 'coinQuest', icon: `${window.location.origin}/favicon-32x32.png` },
          userSession: session,
          onFinish: () => {
            try {
              const userData = session.loadUserData();
              const addr = getAddrFromUserData(userData);
              setUserSession(session);
              setAccount(addr);
              if (addr) refreshBalance(addr);
              resolve();
            } catch (e) { reject(e); }
          },
          onCancel: () => reject(new Error('User canceled')),
        });
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    try { if (userSession?.isUserSignedIn?.()) { userSession.signUserOut(); } } catch (_) {}
    setUserSession(null);
    setAccount(null);
    setStxBalance(null);
  };

  const extractStxAddress = (resp: any) => {
    try {
      if (resp?.addresses && Array.isArray(resp.addresses) && resp.addresses.length) {
        const byType = resp.addresses.find((a: any) => a?.address && typeof a.address === 'string');
        return byType?.address;
      }
      if (Array.isArray(resp)) {
        const first = resp[0];
        if (first && typeof first.address === 'string') return first.address;
        if (typeof first === 'string') return first;
      }
      if (resp?.address && typeof resp.address === 'string') return resp.address;
      if (resp && typeof resp === 'string') return resp;
    } catch(_) {}
    return null;
  };

  const callContract = async (contractId: string, functionName: string, functionArgs: any[]) => {
    if (!userSession?.isUserSignedIn?.()) {
      throw new Error('Wallet not connected');
    }
    const { openContractCall } = await import('@stacks/connect');
    const network = await createStacksNetwork();

    return new Promise((resolve, reject) => {
      openContractCall({
        userSession,
        contractAddress: contractId.split('.')[0],
        contractName: contractId.split('.')[1],
        functionName,
        functionArgs,
        network,
        postConditionMode: 1,
        onFinish: resolve,
        onCancel: () => reject(new Error('User canceled')),
      });
    });
  };

  const getContractId = (name: string) => {
    return STACKS_CONTRACTS[name as keyof typeof STACKS_CONTRACTS] || null;
  };

  useEffect(() => {
    const appConfig = new AppConfig(['store_write', 'publish_data']);
    const session = new UserSession({ appConfig });
    
    if (session.isSignInPending()) {
      session.handlePendingSignIn().then(() => {
        if (session.isUserSignedIn()) {
          const userData = session.loadUserData();
          const addr = getAddrFromUserData(userData);
          setUserSession(session);
          setAccount(addr);
          if (addr) refreshBalance(addr);
        }
      });
    } else if (session.isUserSignedIn()) {
      const userData = session.loadUserData();
      const addr = getAddrFromUserData(userData);
      setUserSession(session);
      setAccount(addr);
      if (addr) refreshBalance(addr);
    }
  }, []);

  const value: StacksContextType = {
    userSession,
    account,
    stxBalance,
    isConnected: !!account,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    callContract,
    getContractId,
  };

  return (
    <StacksContext.Provider value={value}>
      {children}
    </StacksContext.Provider>
  );
};
