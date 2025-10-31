import { ContractExecuteTransaction, ContractFunctionParameters, ContractId, Client, Hbar, TransactionId, AccountId } from '@hashgraph/sdk';
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
    
    // Create transaction WITHOUT TransactionId - let freezeWith generate it to avoid expiry
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
    
    // Create transaction WITHOUT TransactionId - let freezeWith generate it to avoid expiry
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
    
    // Get the lifeline cost (default 10 tokens, but can be fetched from contract)
    const lifelineCostHbar = new Hbar(0.1); // Small HBAR payment for gas
    
    // Create transaction WITHOUT TransactionId - let freezeWith generate it to avoid expiry
    const tx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(350_000)
      .setFunction('buyLifeLine')
      .setPayableAmount(lifelineCostHbar);
      
    // Pass transaction object directly (no bytes conversion needed!)
    return await sendTransaction(tx);
  }

  return { submitScore, claimReward, buyLifeLine };
}


