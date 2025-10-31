import { ContractExecuteTransaction, ContractCallQuery, ContractFunctionParameters, ContractId, Client, Hbar } from '@hashgraph/sdk';
import { useHashpack } from '../contexts/HashpackContext';
import { SKYRUN_ADDRESSES } from './skyrun-contracts';

// NOTE: These are hooks-friendly wrappers; for non-React usage, refactor to accept topic/pairing.

export function useHederaContract() {
  const { accountId, connected } = useHashpack();
  if (!connected || !accountId) {
    return { client: null, accountId: null };
  }

  // Build a client for testnet without operator; signing is delegated to wallet via HashConnect
  const client = Client.forTestnet();
  return { client, accountId };
}

export function evmToContractId(evmAddress: string): ContractId {
  return ContractId.fromEvmAddress(0, 0, evmAddress);
}

export function useSkyRunActions() {
  const { client, accountId } = useHederaContract();
  const { sendTransaction } = useHashpack();

  async function submitScore(score: number) {
    if (!client || !accountId) throw new Error('Wallet not connected');
    
    // Ensure score is a valid integer (no decimals)
    const integerScore = Math.floor(Math.abs(score));
    
    if (!Number.isFinite(integerScore) || integerScore < 0) {
      throw new Error(`Invalid score value: ${score}. Must be a positive number.`);
    }
    
    console.log('📤 Submitting score:', integerScore, 'for account:', accountId);
    
    const contractId = evmToContractId(SKYRUN_ADDRESSES.game);
    
    // Create transaction WITHOUT TransactionId - will be set right before freezing
    const tx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(400_000)
      .setFunction('submitGameScore', new ContractFunctionParameters().addUint256(integerScore))
      .setPayableAmount(new Hbar(0));
      
    // Pass transaction object directly (no bytes conversion needed!)
    return await sendTransaction(tx);
  }

  async function claimReward(questId: number) {
    if (!client || !accountId) throw new Error('Wallet not connected');
    
    // Ensure questId is a valid integer
    const integerQuestId = Math.floor(Math.abs(questId));
    
    if (!Number.isFinite(integerQuestId) || integerQuestId < 0) {
      throw new Error(`Invalid quest ID: ${questId}. Must be a positive number.`);
    }
    
    console.log('🎁 Claiming reward for quest:', integerQuestId, 'for account:', accountId);
    
    const contractId = evmToContractId(SKYRUN_ADDRESSES.game);
    
    // Create transaction WITHOUT TransactionId - will be set right before freezing
    const tx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(300_000)
      .setFunction('claimQuestReward', new ContractFunctionParameters().addUint256(integerQuestId));
      
    // Pass transaction object directly (no bytes conversion needed!)
    return await sendTransaction(tx);
  }

  async function buyLifeLine() {
    if (!client || !accountId) throw new Error('Wallet not connected');
    
    console.log('💰 Buying lifeline for account:', accountId);
    
    const contractId = evmToContractId(SKYRUN_ADDRESSES.game);
    
    // NOTE: buyLifeline() in contract doesn't require payment
    // It just increments the counter in userStats
    // The actual token cost would need to be implemented in the contract
    
    // Create transaction WITHOUT TransactionId - will be set right before freezing
    const tx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(250_000)
      .setFunction('buyLifeline'); // No parameters needed
      
    // Pass transaction object directly (no bytes conversion needed!)
    return await sendTransaction(tx);
  }

  async function useLifeLine() {
    if (!client || !accountId) throw new Error('Wallet not connected');
    
    console.log('🎮 Using lifeline for account:', accountId);
    
    const contractId = evmToContractId(SKYRUN_ADDRESSES.game);
    
    // Create transaction to use a lifeline
    const tx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(100_000)
      .setFunction('useLifeline');
      
    return await sendTransaction(tx);
  }
  
  async function getAvailableLives() {
    if (!client || !accountId) return 0;
    
    const contractId = evmToContractId(SKYRUN_ADDRESSES.game);
    
    try {
      // Convert Hedera accountId (0.0.xxxx) to EVM address (0x...)
      const { AccountId } = await import('@hashgraph/sdk');
      const evmAddress = AccountId.fromString(accountId).toSolidityAddress();
      
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100_000)
        .setFunction('getAvailableLives', new ContractFunctionParameters().addAddress(evmAddress));
      
      const result = await query.execute(client);
      const lives = result.getUint256(0);
      return typeof lives === 'number' ? lives : lives.toNumber();
    } catch (error) {
      console.error('Failed to get available lives:', error);
      return 0;
    }
  }
  
  async function getTokenBalance() {
    if (!client || !accountId) return 0;
    
    const contractId = evmToContractId(SKYRUN_ADDRESSES.game);
    
    try {
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100_000)
        .setFunction('getTokenBalance', new ContractFunctionParameters().addAddress(accountId));
      
      const result = await query.execute(client);
      const balance = result.getUint256(0);
      return typeof balance === 'number' ? balance : balance.toNumber();
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return 0;
    }
  }
  
  async function getUserStats() {
    if (!client || !accountId) {
      return {
        totalGamesPlayed: 0,
        totalScore: 0,
        highScore: 0,
        tokensEarned: 0,
        level: 0,
        lifelinesPurchased: 0,
        availableLives: 0
      };
    }
    
    const contractId = evmToContractId(SKYRUN_ADDRESSES.game);
    
    try {
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100_000)
        .setFunction('getUserStats', new ContractFunctionParameters().addAddress(accountId));
      
      const result = await query.execute(client);
      
      // The result is a tuple (struct) with all stats - convert all to numbers
      const toNumber = (val: number | { toNumber: () => number }): number => typeof val === 'number' ? val : val.toNumber();
      
      const stats = {
        totalGamesPlayed: toNumber(result.getUint256(0)),
        totalScore: toNumber(result.getUint256(1)),
        highScore: toNumber(result.getUint256(2)),
        tokensEarned: toNumber(result.getUint256(3)),
        level: toNumber(result.getUint256(4)),
        lifelinesPurchased: toNumber(result.getUint256(5)),
        availableLives: toNumber(result.getUint256(6))
      };
      
      console.log('📊 Fetched user stats from blockchain:', stats);
      return stats;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return {
        totalGamesPlayed: 0,
        totalScore: 0,
        highScore: 0,
        tokensEarned: 0,
        level: 0,
        lifelinesPurchased: 0,
        availableLives: 0
      };
    }
  }

  return { 
    submitScore, 
    claimReward, 
    buyLifeLine, 
    useLifeLine,
    getAvailableLives,
    getTokenBalance,
    getUserStats
  };
}


