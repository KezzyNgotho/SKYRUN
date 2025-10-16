// Global type declarations for window object extensions
declare global {
  interface Window {
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    callStacksFinalize: (fnArgs: any[]) => Promise<any>;
    callStacksClaim: (fnArgs: any[]) => Promise<any>;
    callStacksBuyLife: (fnArgs: any[]) => Promise<any>;
    getWalletStatus: () => { connected: boolean; address: string | null; balance: number | null };
    wallet: any;
    reactWalletFunctions: {
      connectWallet: () => Promise<{ success: boolean; error?: string }>;
      disconnectWallet: () => void;
      submitGameScore: (score: number) => Promise<any>;
      claimQuestReward: (questId: number) => Promise<any>;
      buyLifeLine: () => Promise<any>;
      getWalletStatus: () => { connected: boolean; address: string | null; balance: number | null };
    };
    showWalletStatus: () => any;
    debugWalletDetection: () => void;
    testContractIntegration: () => Promise<void>;
    checkWalletConnection: () => boolean;
  }
}

export {};
