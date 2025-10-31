import { ContractExecuteTransaction, ContractFunctionParameters, ContractId, Client, Hbar } from '@hashgraph/sdk';
import { useHashpack } from '../contexts/HashpackContext';
import { SKYRUN_ADDRESSES } from './skyrun-contracts';

// NOTE: These are hooks-friendly wrappers; for non-React usage, refactor to accept topic/pairing.

export function useHederaContract() {
  const { accountId, connected } = useHashpack();
  if (!connected || !accountId) {
    return { client: null, accountId: null };
  }

  // Build a client for testnet
  // For queries, we set a default max query payment but no operator (wallet signs transactions)
  const client = Client.forTestnet();
  client.setMaxQueryPayment(new Hbar(1)); // Set default max query payment for read operations
  
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
    if (!accountId) return 0;
    
    try {
      // Use mirror node API for free read-only queries
      const { AccountId } = await import('@hashgraph/sdk');
      const evmAddress = AccountId.fromString(accountId).toSolidityAddress();
      
      // Import ethers for ABI encoding
      const { ethers } = await import('ethers');
      
      // Create interface for the function
      const iface = new ethers.Interface([
        'function getAvailableLives(address user) view returns (uint256)'
      ]);
      
      // Encode the function call
      const data = iface.encodeFunctionData('getAvailableLives', [evmAddress]);
      
      // Convert EVM address to Contract ID for mirror node
      const contractId = evmToContractId(SKYRUN_ADDRESSES.game);
      const contractIdString = `${contractId.shard}.${contractId.realm}.${contractId.num}`;
      
      const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/contracts/${contractIdString}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, estimate: false })
      });
      
      const result = await response.json();
      if (result.result) {
        const decoded = iface.decodeFunctionResult('getAvailableLives', result.result);
        return Number(decoded[0]);
      }
      return 0;
    } catch (error) {
      console.error('Failed to get available lives:', error);
      return 0;
    }
  }
  
  async function getTokenBalance() {
    if (!accountId) return 0;
    
    try {
      // Use mirror node API for free read-only queries
      const { AccountId } = await import('@hashgraph/sdk');
      const evmAddress = AccountId.fromString(accountId).toSolidityAddress();
      
      // Import ethers for ABI encoding
      const { ethers } = await import('ethers');
      
      // Create interface for the function
      const iface = new ethers.Interface([
        'function getTokenBalance(address user) view returns (uint256)'
      ]);
      
      // Encode the function call
      const data = iface.encodeFunctionData('getTokenBalance', [evmAddress]);
      
      const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/contracts/${SKYRUN_ADDRESSES.game}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, estimate: false })
      });
      
      const result = await response.json();
      if (result.result) {
        const decoded = iface.decodeFunctionResult('getTokenBalance', result.result);
        return Number(decoded[0]);
      }
      return 0;
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return 0;
    }
  }
  
  async function getUserStats() {
    if (!accountId) {
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
    
    try {
      // Use mirror node API for free read-only queries
      const { AccountId } = await import('@hashgraph/sdk');
      const evmAddress = AccountId.fromString(accountId).toSolidityAddress();
      
      // Import ethers for ABI encoding
      const { ethers } = await import('ethers');
      
      // Create interface for the function
      const iface = new ethers.Interface([
        'function getUserStats(address user) view returns (uint256 totalGamesPlayed, uint256 totalScore, uint256 highScore, uint256 tokensEarned, uint256 level, uint256 lifelinesPurchased, uint256 availableLives)'
      ]);
      
      // Encode the function call
      const data = iface.encodeFunctionData('getUserStats', [evmAddress]);
      
      const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/contracts/${SKYRUN_ADDRESSES.game}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, estimate: false })
      });
      
      const result = await response.json();
      if (result.result) {
        const decoded = iface.decodeFunctionResult('getUserStats', result.result);
        
        const stats = {
          totalGamesPlayed: Number(decoded[0]),
          totalScore: Number(decoded[1]),
          highScore: Number(decoded[2]),
          tokensEarned: Number(decoded[3]),
          level: Number(decoded[4]),
          lifelinesPurchased: Number(decoded[5]),
          availableLives: Number(decoded[6])
        };
        
        console.log('📊 Fetched user stats from blockchain:', stats);
        return stats;
      }
      
      return {
        totalGamesPlayed: 0,
        totalScore: 0,
        highScore: 0,
        tokensEarned: 0,
        level: 0,
        lifelinesPurchased: 0,
        availableLives: 0
      };
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


