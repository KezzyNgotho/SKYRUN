// Global type declarations for window object extensions
declare global {
  interface Window {
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    callStacksFinalize: () => Promise<any>;
    callStacksClaim: () => Promise<any>;
    callStacksBuyLife: () => Promise<any>;
    getWalletStatus: () => { connected: boolean; address: string | null; balance: number | null };
    wallet: any;
    reactWalletFunctions: {
      connectWallet: () => Promise<void>;
      disconnectWallet: () => Promise<void>;
      submitGameScore: (score: number) => Promise<any>;
      claimQuestReward: (questId: number) => Promise<any>;
      buyLifeLine: () => Promise<any>;
      getWalletStatus: () => { connected: boolean; address: string | null; balance: number | null };
    };
    showWalletStatus: () => any;
    debugWalletDetection: () => void;
    testContractIntegration: () => Promise<void>;
    initializeContractIntegration: () => Promise<void>;
    debugWallet: () => { connected: boolean; accountId?: string; status: number; hasHashConnect: boolean };
    clearWalletConnectData: () => Promise<void>;
    openWalletSettings: () => void;
    testContractCall: () => Promise<void>;
    testContractInitialization: () => Promise<void>;
    testSimpleContractCall: () => Promise<any>;
    testExactFormat: () => Promise<any>;
    testWalletReadiness: () => Promise<void>;
    simpleContractCall: (contractId: string, functionName: string, functionArgs: any[]) => Promise<any>;
    // Core game functions for HTML onclick handlers
    PlayButtonActivate: () => void;
    buyLifeLine: () => void;
    claimLastRun: () => void;
    finalizeGameScore: () => void;
    Replay: () => void;
    GoToHome: () => void;
    PauseToggle: () => void;
    StacksTransactions: {
      uintCV: (value: number) => any;
      stringUtf8CV: (value: string) => any;
      boolCV: (value: boolean) => any;
    };
    // Global variables for avoiding serialization issues
    currentGameScore: number;
    currentQuestId: number;
  }
}

export {};
