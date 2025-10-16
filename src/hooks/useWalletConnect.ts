import { useWallet } from '../contexts/WalletContext';

/**
 * Custom hook for easy wallet operations
 * Provides convenient methods for common wallet interactions
 */
export const useWalletConnect = () => {
  const wallet = useWallet();

  const submitGameScore = async (score: number) => {
    if (!wallet.isConnected) {
      throw new Error('Wallet not connected');
    }

    const contractId = wallet.getContractId('QuestRewardsV2');
    if (!contractId) {
      throw new Error('QuestRewardsV2 contract not found');
    }

    return await wallet.callContract(contractId, 'submit-game-score', [score]);
  };

  const claimQuestReward = async (questId: number = 1) => {
    if (!wallet.isConnected) {
      throw new Error('Wallet not connected');
    }

    const contractId = wallet.getContractId('QuestRewardsV2');
    if (!contractId) {
      throw new Error('QuestRewardsV2 contract not found');
    }

    return await wallet.callContract(contractId, 'claim-quest-reward', [questId]);
  };

  const buyLifeLine = async () => {
    if (!wallet.isConnected) {
      throw new Error('Wallet not connected');
    }

    const contractId = wallet.getContractId('QuestRewardsV2');
    if (!contractId) {
      throw new Error('QuestRewardsV2 contract not found');
    }

    return await wallet.callContract(contractId, 'buy-lifeline', []);
  };

  const getShortAddress = (address?: string) => {
    const addr = address || wallet.address;
    if (!addr || addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (balance?: number | null) => {
    const bal = balance !== undefined ? balance : wallet.stxBalance;
    if (bal === null) return '0.00';
    return bal.toFixed(2);
  };

  return {
    ...wallet,
    // Convenience methods
    submitGameScore,
    claimQuestReward,
    buyLifeLine,
    getShortAddress,
    formatBalance,
    // Contract IDs
    contracts: {
      GameTokenV2: wallet.getContractId('GameTokenV2'),
      QuestRewardsV2: wallet.getContractId('QuestRewardsV2'),
      PlayerProfileV2: wallet.getContractId('PlayerProfileV2'),
    }
  };
};
