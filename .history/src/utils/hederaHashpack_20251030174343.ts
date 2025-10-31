import {
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
  Client,
  Hbar,
  AccountId,
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
  let lastError: any = null;

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
      lastError = err;
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
   * - Attempts to call Mirror Node /call with msg.sender = player's solidity address
   * - Retries while Mirror Node hasn't indexed the contract (404) up to timeout
   * - Returns 0 on error/fallback
   */
  async function getAvailableLives(): Promise<number> {
    if (!accountId) return 0;

    try {
      const evmAddress = await accountIdToEvmAddress(accountId);
      const contractEvmAddress = SKYRUN_ADDRESSES.game;
      const iface = new ethers.Interface(["function getAvailableLives() view returns (uint256)"]);
      const data = iface.encodeFunctionData("getAvailableLives", []);

      const json = await mirrorNodeCallWithRetry(contractEvmAddress, data, evmAddress);
      // Mirror node returns something like { result: '0x...' } or { callResult: '0x...' }
      const hex = json.result ?? json.callResult ?? json.data ?? json.output;
      if (!hex) {
        console.warn("Mirror node call returned no result for getAvailableLives:", json);
        return 0;
      }
      const decoded = iface.decodeFunctionResult("getAvailableLives", hex);
      const val = decoded[0];
      // In ethers v6, decoded values are BigInt
      return Number(val);
    } catch (err) {
      console.error("Failed to get available lives:", err);
      return 0;
    }
  }

  /**
   * READ: getTokenBalance (same pattern)
   */
  async function getTokenBalance(): Promise<number> {
    if (!accountId) return 0;

    try {
      const evmAddress = await accountIdToEvmAddress(accountId);
      const contractEvmAddress = SKYRUN_ADDRESSES.game;
      const iface = new ethers.Interface(["function getTokenBalance() view returns (uint256)"]);
      const data = iface.encodeFunctionData("getTokenBalance", []);

      const json = await mirrorNodeCallWithRetry(contractEvmAddress, data, evmAddress);
      const hex = json.result ?? json.callResult ?? json.data ?? json.output;
      if (!hex) {
        console.warn("Mirror node call returned no result for getTokenBalance:", json);
        return 0;
      }
      const decoded = iface.decodeFunctionResult("getTokenBalance", hex);
      return Number(decoded[0]);
    } catch (err) {
      console.error("Failed to get token balance:", err);
      return 0;
    }
  }

  /**
   * READ: getUserStats
   * Returns normalized object. Attempts Mirror Node call with retries. If not indexed, returns defaults.
   */
  async function getUserStats() {
    if (!accountId) {
      return {
        totalGamesPlayed: 0,
        totalScore: 0,
        highScore: 0,
        tokensEarned: 0,
        level: 0,
        lifelinesPurchased: 0,
        availableLives: 0,
      };
    }

    try {
      const evmAddress = await accountIdToEvmAddress(accountId);
      const iface = new ethers.Interface([
        "function getUserStats() view returns (uint256 totalGamesPlayed, uint256 totalScore, uint256 highScore, uint256 tokensEarned, uint256 level, uint256 lifelinesPurchased, uint256 availableLives)",
      ]);
      const data = iface.encodeFunctionData("getUserStats", []);
      const contractEvmAddress = SKYRUN_ADDRESSES.game;

      const json = await mirrorNodeCallWithRetry(contractEvmAddress, data, evmAddress);

      const hex = json.result ?? json.callResult ?? json.data ?? json.output;
      if (!hex) {
        console.warn("Mirror node call returned no result for getUserStats:", json);
        return {
          totalGamesPlayed: 0,
          totalScore: 0,
          highScore: 0,
          tokensEarned: 0,
          level: 0,
          lifelinesPurchased: 0,
          availableLives: 0,
        };
      }

      const decoded = iface.decodeFunctionResult("getUserStats", hex);
      const stats = {
        totalGamesPlayed: Number(ethers.BigNumber.from(decoded[0]).toString()),
        totalScore: Number(ethers.BigNumber.from(decoded[1]).toString()),
        highScore: Number(ethers.BigNumber.from(decoded[2]).toString()),
        tokensEarned: Number(ethers.BigNumber.from(decoded[3]).toString()),
        level: Number(ethers.BigNumber.from(decoded[4]).toString()),
        lifelinesPurchased: Number(ethers.BigNumber.from(decoded[5]).toString()),
        availableLives: Number(ethers.BigNumber.from(decoded[6]).toString()),
      };

      console.log("📊 Fetched user stats from blockchain:", stats);
      return stats;
    } catch (error) {
      // If it's a 404 / not indexed, mirrorNodeCallWithRetry will throw after timeout — we return defaults
      console.error("Failed to get user stats:", error);
      return {
        totalGamesPlayed: 0,
        totalScore: 0,
        highScore: 0,
        tokensEarned: 0,
        level: 0,
        lifelinesPurchased: 0,
        availableLives: 0,
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
    getUserStats,
  };
}

export default useSkyRunActions;
