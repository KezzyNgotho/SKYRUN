// Wallet context type definitions
export interface UserSession {
  isUserSignedIn: () => boolean;
  userData?: {
    profile: {
      stxAddress: {
        testnet: string;
        mainnet: string;
      };
    };
  };
}

export interface WalletState {
  userSession: UserSession | null;
  address: string | null;
  walletAddress: string | null; // Alias for address
  stxBalance: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface WalletActions {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: (address: string) => Promise<void>;
  callContract: (contractId: string, functionName: string, functionArgs: any[]) => Promise<any>;
  getContractId: (name: string) => string | null;
  checkWalletConnection: () => {
    hasAddress: boolean;
    hasUserSession: boolean;
    hasXverse: boolean;
    hasLeather: boolean;
    isStacksConnected: boolean;
    isConnected: boolean;
    overallConnected: boolean;
  };
}

export type WalletContextType = WalletState & WalletActions;
