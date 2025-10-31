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

export async function executeSubmitScore(client: Client, topic: string, pairing: any, accountId: string, score: number) {
  const contractId = evmToContractId(SKYRUN_ADDRESSES.game);
  const tx = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(400_000)
    .setFunction('submitGameScore', new ContractFunctionParameters().addUint256(score))
    .setPayableAmount(new Hbar(0));

  // The actual signing & sending via HashConnect should be implemented here.
  // Placeholder: throw to indicate where wallet signing is needed.
  throw new Error('HashConnect signing pipeline not implemented in this scaffold');
}


