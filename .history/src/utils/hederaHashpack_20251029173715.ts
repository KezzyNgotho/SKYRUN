import { ContractExecuteTransaction, ContractFunctionParameters, ContractId, Client, Hbar } from '@hashgraph/sdk';
import { useHashpack } from '../contexts/HashpackContext';
import { SKYRUN_ADDRESSES } from './skyrun-contracts';

// NOTE: These are hooks-friendly wrappers; for non-React usage, refactor to accept topic/pairing.

export function useHederaContract() {
  const { accountId, connected } = useHashpack();
  if (!connected || !accountId) throw new Error('HashPack not connected');

  // Build a client without operator; signing is delegated to wallet via HashConnect
  const client = Client.forTestnet();
  return { client, accountId };
}

export function evmToContractId(evmAddress: string): ContractId {
  return ContractId.fromEvmAddress(0, 0, evmAddress);
}

export function useSkyRunActions() {
  const { client } = useHederaContract();
  const { sendTransaction } = useHashpack();

  async function submitScore(score: number) {
    const contractId = evmToContractId(SKYRUN_ADDRESSES.game);
    const tx = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(400_000)
      .setFunction('submitGameScore', new ContractFunctionParameters().addUint256(score))
      .setPayableAmount(new Hbar(0))
      .freezeWith(client);
    const bytes = await tx.toBytes();
    return await sendTransaction(bytes);
  }

  async function claimReward(questId: number) {
    const contractId = evmToContractId(SKYRUN_ADDRESSES.game);
    const tx = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(300_000)
      .setFunction('claimQuestReward', new ContractFunctionParameters().addUint256(questId))
      .freezeWith(client);
    const bytes = await tx.toBytes();
    return await sendTransaction(bytes);
  }

  return { submitScore, claimReward };
}


