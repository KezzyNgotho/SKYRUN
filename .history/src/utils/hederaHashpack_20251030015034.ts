import { ContractExecuteTransaction, ContractFunctionParameters, ContractId, Client, Hbar } from '@hashgraph/sdk';
import { useHashpack } from '../contexts/HashpackContext';
import { SKYRUN_ADDRESSES } from './skyrun-contracts';

// NOTE: These are hooks-friendly wrappers; for non-React usage, refactor to accept topic/pairing.

export function useHederaContract() {
  const { accountId, connected } = useHashpack();
  if (!connected || !accountId) {
    return { client: null, accountId: null };
  }

  // Build a client without operator; signing is delegated to wallet via HashConnect
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
    const tx = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(400_000)
      .setFunction('submitGameScore', new ContractFunctionParameters().addUint256(integerScore))
      .setPayableAmount(new Hbar(0))
      .freezeWith(client);
    const bytes = await tx.toBytes();
    return await sendTransaction(bytes);
  }

  async function claimReward(questId: number) {
    if (!client || !accountId) throw new Error('Wallet not connected');
    const contractId = evmToContractId(SKYRUN_ADDRESSES.game);
    const tx = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(300_000)
      .setFunction('claimQuestReward', new ContractFunctionParameters().addUint256(questId))
      .freezeWith(client);
    const bytes = await tx.toBytes();
    return await sendTransaction(bytes);
  }

  async function buyLifeLine() {
    if (!client || !accountId) throw new Error('Wallet not connected');
    const contractId = evmToContractId(SKYRUN_ADDRESSES.game);
    
    // Get the lifeline cost (default 10 tokens, but can be fetched from contract)
    const lifelineCostHbar = new Hbar(0.1); // Small HBAR payment for gas
    
    const tx = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(350_000)
      .setFunction('buyLifeLine')
      .setPayableAmount(lifelineCostHbar)
      .freezeWith(client);
    const bytes = await tx.toBytes();
    return await sendTransaction(bytes);
  }

  return { submitScore, claimReward, buyLifeLine };
}


