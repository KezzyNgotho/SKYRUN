import {
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
  Client,
  Hbar,
} from "@hashgraph/sdk";
import { useHashpack } from "../contexts/HashpackContext";
import { SKYRUN_ADDRESSES } from "./skyrun-contracts";
import { ethers } from "ethers";

/**
 * Hardened SkyRun contract helpers
 *
 * - Writes: use Hashpack (sendTransaction) with Hedera ContractId (0.0.x) created from EVM address
 * - Reads: use Mirror Node EVM /call endpoint (requires EVM address, not 0.0.x).
 *          We include retries / indexing wait and robust decoding with ethers ABI.
 *
 * NOTE:
 * - This module assumes useHashpack() provides `sendTransaction(tx)` (which accepts ContractExecuteTransaction).
 * - Mirror Node indexing can take 20-120s after deployment — reads handle that gracefully.
 */

export function useHederaContract() {
  const { accountId, connected } = useHashpack();
  if (!connected || !accountId) {
    return { client: null, accountId: null };
  }

  // Client for testnet (no operator set; we use wallet for signing when needed)
  const client = Client.forTestnet();
  client.setMaxQueryPayment(new Hbar(1)); // default max for any SDK queries you might call
  return { client, accountId };
}

/**
 * Convert EVM address string -> Hedera ContractId (0.0.x).
 * Useful for building ContractExecuteTransaction objects for HashPack signing.
 */
export function evmToContractId(evmAddress: string): ContractId {
  // ContractId.fromEvmAddress expects (shard, realm, evmAddress)
  return ContractId.fromEvmAddress(0, 0, evmAddress);
}

/**
 * Small helper: convert Hedera accountId (0.0.x or shard.realm.num) to solidity address (0x...)
 */
async function accountIdToEvmAddress(accountId: string) {
  // uses AccountId.fromString(...).toSolidityAddress()
  const { AccountId: AccountIdClass } = await import("@hashgraph/sdk");
  try {
    return AccountIdClass.fromString(accountId).toSolidityAddress();
  } catch (err) {
    console.warn("Failed converting accountId to evm address:", accountId, err);
    throw err;
  }
}

/**
 * Mirror Node EVM /call wrapper with retry/indexing wait.
 * - contractEvmAddress: e.g. "0x3D04...".
 * - data: hex string "0x..."
 * - fromEvmAddress: caller (solidity) address used as msg.sender
 * Returns parsed JSON from mirror node on success or throws.
 */
async function mirrorNodeCallWithRetry(
  contractEvmAddress: string,
  data: string,
  fromEvmAddress: string,
  timeoutMs = 90_000, // total wait time before giving up
  pollIntervalMs = 2500
) {
  const endpoint = `https://testnet.mirrornode.hedera.com/api/v1/contracts/${contractEvmAddress}/call`;

  const start = Date.now();
  let lastError: Error | null = null;

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, estimate: false, from: fromEvmAddress }),
      });

      if (response.status === 404) {
        // Contract not found yet (likely not indexed). Retry until timeout.
        lastError = new Error("Mirror node returned 404 (contract not indexed on testnet yet)");
        // Wait and retry
        await new Promise((r) => setTimeout(r, pollIntervalMs));
        continue;
      }

      // For other non-ok statuses just surface the error
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Mirror node /call error ${response.status}: ${text}`);
      }

      const json = await response.json();
      return json;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // For network errors or other intermittent issues, wait and retry
      await new Promise((r) => setTimeout(r, pollIntervalMs));
      continue;
    }
  }

  // After timeout:
  throw lastError ?? new Error("Mirror node call failed (timeout)");
}

/**
 * Use your Hashpack context's sendTransaction to submit ContractExecuteTransaction
 * This wrapper logs and normalizes responses
 */
export function useSkyRunActions() {
  const { client, accountId } = useHederaContract();
  const { sendTransaction } = useHashpack(); // expects tx: ContractExecuteTransaction

  async function submitScore(score: number) {
    if (!client || !accountId) throw new Error("Wallet not connected");

    const integerScore = Math.floor(Math.abs(score));
    if (!Number.isFinite(integerScore) || integerScore < 0) {
      throw new Error(`Invalid score value: ${score}. Must be a non-negative number.`);
    }

    console.log("📤 Submitting score:", integerScore, "for account:", accountId);

    const contractId = evmToContractId(SKYRUN_ADDRESSES.game);

    const tx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(400_000)
      .setFunction("submitGameScore", new ContractFunctionParameters().addUint256(integerScore))
      .setPayableAmount(new Hbar(0));

    return await sendTransaction(tx);
  }

  async function claimReward(questId: number) {
    if (!client || !accountId) throw new Error("Wallet not connected");

    const integerQuestId = Math.floor(Math.abs(questId));
    if (!Number.isFinite(integerQuestId) || integerQuestId < 0) {
      throw new Error(`Invalid quest ID: ${questId}. Must be a non-negative integer.`);
    }

    console.log("🎁 Claiming reward for quest:", integerQuestId, "for account:", accountId);

    const contractId = evmToContractId(SKYRUN_ADDRESSES.game);

    const tx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(300_000)
      .setFunction("claimQuestReward", new ContractFunctionParameters().addUint256(integerQuestId));

    return await sendTransaction(tx);
  }

  async function buyLifeLine() {
    if (!client || !accountId) throw new Error("Wallet not connected");

    console.log("💰 Buying lifeline for account:", accountId);

    const contractId = evmToContractId(SKYRUN_ADDRESSES.game);
    
    const tx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(250_000)
      .setFunction("buyLifeline"); // no params

    return await sendTransaction(tx);
  }

  async function useLifeLine() {
    if (!client || !accountId) throw new Error("Wallet not connected");

    console.log("🎮 Using lifeline for account:", accountId);

    const contractId = evmToContractId(SKYRUN_ADDRESSES.game);

    const tx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(100_000)
      .setFunction("useLifeline");

    return await sendTransaction(tx);
  }

  /**
   * READ: getAvailableLives
   * - Uses Hedera SDK ContractCallQuery (proper way to query Hedera contracts)
   * - Works immediately, no waiting for Mirror Node indexing
   */
  async function getAvailableLives(): Promise<number> {
    if (!accountId || !client) return 0;

    try {
      const { ContractCallQuery, ContractFunctionParameters, AccountId } = await import('@hashgraph/sdk');
      
      // Convert user's Hedera account to EVM address for contract parameter
      const userEvmAddress = AccountId.fromString(accountId).toSolidityAddress();
      const contractId = evmToContractId(SKYRUN_ADDRESSES.game);
      
      console.log('📖 Reading getAvailableLives via Hedera SDK for:', accountId);
      
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100_000)
        .setFunction('getAvailableLives', new ContractFunctionParameters().addAddress(userEvmAddress));
      
      const result = await query.execute(client);
      const lives = result.getUint256(0);
      const value = typeof lives === 'number' ? lives : Number(lives);
      
      console.log('✅ Got available lives:', value);
      return value;
    } catch (error) {
      console.error('Failed to get available lives:', error);
      return 0;
    }
  }

  /**
   * READ: getTokenBalance
   * - Uses Hedera SDK ContractCallQuery (proper way to query Hedera contracts)
   * - Works immediately, no waiting for Mirror Node indexing
   */
  async function getTokenBalance(): Promise<number> {
    if (!accountId || !client) return 0;

    try {
      const { ContractCallQuery, ContractFunctionParameters, AccountId } = await import('@hashgraph/sdk');
      
      const userEvmAddress = AccountId.fromString(accountId).toSolidityAddress();
      const contractId = evmToContractId(SKYRUN_ADDRESSES.game);
      
      console.log('📖 Reading getTokenBalance via Hedera SDK for:', accountId);
      
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100_000)
        .setFunction('getTokenBalance', new ContractFunctionParameters().addAddress(userEvmAddress));
      
      const result = await query.execute(client);
      const balance = result.getUint256(0);
      const value = typeof balance === 'number' ? balance : Number(balance);
      
      console.log('✅ Got token balance:', value);
      return value;
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return 0;
    }
  }

  /**
   * READ: getUserStats
   * - Uses Hedera SDK ContractCallQuery (proper way to query Hedera contracts)
   * - Works immediately, no waiting for Mirror Node indexing
   */
  async function getUserStats() {
    const defaultStats = {
      totalGamesPlayed: 0,
      totalScore: 0,
      highScore: 0,
      tokensEarned: 0,
      level: 0,
      lifelinesPurchased: 0,
      availableLives: 0,
    };

    if (!accountId || !client) return defaultStats;

    try {
      const { ContractCallQuery, ContractFunctionParameters, AccountId } = await import('@hashgraph/sdk');
      
      const userEvmAddress = AccountId.fromString(accountId).toSolidityAddress();
      const contractId = evmToContractId(SKYRUN_ADDRESSES.game);
      
      console.log('📖 Reading getUserStats via Hedera SDK for:', accountId);
      
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100_000)
        .setFunction('getUserStats', new ContractFunctionParameters().addAddress(userEvmAddress));
      
      const result = await query.execute(client);
      
      // Decode the Stats struct (7 uint256 values)
      const stats = {
        totalGamesPlayed: Number(result.getUint256(0)),
        totalScore: Number(result.getUint256(1)),
        highScore: Number(result.getUint256(2)),
        tokensEarned: Number(result.getUint256(3)),
        level: Number(result.getUint256(4)),
        lifelinesPurchased: Number(result.getUint256(5)),
        availableLives: Number(result.getUint256(6)),
      };

      console.log("📊 Fetched user stats:", stats);
      return stats;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return defaultStats;
    }
  }

  return {
    submitScore,
    claimReward,
    buyLifeLine,
    useLifeLine,
    getAvailableLives,
    getTokenBalance,
    getUserStats,
  };
}

export default useSkyRunActions;
