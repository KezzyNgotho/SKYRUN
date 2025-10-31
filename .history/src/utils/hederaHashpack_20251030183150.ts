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
 * SkyRun Hedera Contract Integration
 *
 * Following Hedera best practices for frontend dApps:
 * - WRITES: Use HashConnect + Hedera SDK for transaction signing via user's wallet
 * - READS: Use Mirror Node API (free, no credentials needed, frontend-safe)
 *
 * Why Mirror Node for reads?
 * - FREE (no HBAR cost)
 * - No operator account needed (SDK queries require private key - insecure for frontend)
 * - Official Hedera service
 * - Perfect for read-only contract queries
 *
 * Architecture:
 * - User signs transactions via HashPack wallet (secure)
 * - Contract queries via Mirror Node REST API (free & safe)
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
   * - Uses Mirror Node API (free, no credentials needed)
   * - Frontend-safe approach for read-only queries
   */
  async function getAvailableLives(): Promise<number> {
    if (!accountId) return 0;

    try {
      const { AccountId } = await import('@hashgraph/sdk');
      const userEvmAddress = AccountId.fromString(accountId).toSolidityAddress();
      
      // Encode the function call
      const iface = new ethers.Interface(['function getAvailableLives(address user) view returns (uint256)']);
      const data = iface.encodeFunctionData('getAvailableLives', [userEvmAddress]);
      
      // Call Mirror Node API
      const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/contracts/${SKYRUN_ADDRESSES.game}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, estimate: false })
      });
      
      if (!response.ok) {
        console.warn('Mirror Node not ready yet (contract may still be indexing)');
        return 0;
      }
      
      const result = await response.json();
      const hex = result.result;
      if (!hex) return 0;
      
      const decoded = iface.decodeFunctionResult('getAvailableLives', hex);
      return Number(decoded[0]);
    } catch (error) {
      console.error('Failed to get available lives:', error);
      return 0;
    }
  }

  /**
   * READ: getTokenBalance
   * - Uses Mirror Node API (free, no credentials needed)
   * - Frontend-safe approach for read-only queries
   */
  async function getTokenBalance(): Promise<number> {
    if (!accountId) return 0;

    try {
      const { AccountId } = await import('@hashgraph/sdk');
      const userEvmAddress = AccountId.fromString(accountId).toSolidityAddress();
      
      const iface = new ethers.Interface(['function getTokenBalance(address user) view returns (uint256)']);
      const data = iface.encodeFunctionData('getTokenBalance', [userEvmAddress]);
      
      const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/contracts/${SKYRUN_ADDRESSES.game}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, estimate: false })
      });
      
      if (!response.ok) {
        console.warn('Mirror Node not ready yet (contract may still be indexing)');
        return 0;
      }
      
      const result = await response.json();
      const hex = result.result;
      if (!hex) return 0;
      
      const decoded = iface.decodeFunctionResult('getTokenBalance', hex);
      return Number(decoded[0]);
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return 0;
    }
  }

  /**
   * READ: getUserStats
   * - Uses Mirror Node API (free, no credentials needed)
   * - Frontend-safe approach for read-only queries
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

    if (!accountId) return defaultStats;

    try {
      const { AccountId } = await import('@hashgraph/sdk');
      const userEvmAddress = AccountId.fromString(accountId).toSolidityAddress();
      
      const iface = new ethers.Interface([
        'function getUserStats(address user) view returns (uint256 totalGamesPlayed, uint256 totalScore, uint256 highScore, uint256 tokensEarned, uint256 level, uint256 lifelinesPurchased, uint256 availableLives)'
      ]);
      const data = iface.encodeFunctionData('getUserStats', [userEvmAddress]);
      
      const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/contracts/${SKYRUN_ADDRESSES.game}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, estimate: false })
      });
      
      if (!response.ok) {
        console.warn('Mirror Node not ready yet (contract may still be indexing)');
        return defaultStats;
      }
      
      const result = await response.json();
      const hex = result.result;
      if (!hex) return defaultStats;
      
      const decoded = iface.decodeFunctionResult('getUserStats', hex);
      const stats = {
        totalGamesPlayed: Number(decoded[0]),
        totalScore: Number(decoded[1]),
        highScore: Number(decoded[2]),
        tokensEarned: Number(decoded[3]),
        level: Number(decoded[4]),
        lifelinesPurchased: Number(decoded[5]),
        availableLives: Number(decoded[6]),
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
