import {
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
  Client,
  Hbar,
} from "@hashgraph/sdk";
import { useHashpack } from "../contexts/HashpackContext";
import { SKYRUN_ADDRESSES } from "./skyrun-contracts";

/**
 * SkyRun Hedera Contract Integration
 *
 * Following Hedera best practices:
 * - Writes: Use HashConnect + Hedera SDK for transaction signing and submission
 * - Reads: Use Hedera SDK ContractCallQuery for immediate, reliable contract queries
 * - No Mirror Node dependencies - SDK handles everything directly on the network
 *
 * Benefits:
 * - Works immediately (no waiting for Mirror Node indexing)
 * - More reliable (direct blockchain queries)
 * - Simpler code (no ABI encoding/decoding needed)
 * - Better UX (instant results)
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
      
      // Use the existing client which already has setMaxQueryPayment configured
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100_000)
        .setFunction('getAvailableLives', new ContractFunctionParameters().addAddress(userEvmAddress));
      
      // Get the cost of the query first
      const cost = await query.getCost(client);
      console.log('Query cost:', cost.toString());
      
      // Execute with the exact cost
      const result = await query.setQueryPayment(cost).execute(client);
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
    if (!accountId) return 0;

    try {
      const { ContractCallQuery, ContractFunctionParameters, AccountId, Hbar, Client } = await import('@hashgraph/sdk');
      
      const userEvmAddress = AccountId.fromString(accountId).toSolidityAddress();
      const contractId = evmToContractId(SKYRUN_ADDRESSES.game);
      
      console.log('📖 Reading getTokenBalance via Hedera SDK for:', accountId);
      
      // Create a new client without operator for read-only queries
      const queryClient = Client.forTestnet();
      queryClient.setMaxQueryPayment(new Hbar(1)); // Set max payment client is willing to pay
      
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100_000)
        .setQueryPayment(new Hbar(0.1)) // Actual payment for this query
        .setFunction('getTokenBalance', new ContractFunctionParameters().addAddress(userEvmAddress));
      
      const result = await query.execute(queryClient);
      const balance = result.getUint256(0);
      const value = typeof balance === 'number' ? balance : Number(balance);
      
      queryClient.close(); // Clean up
      
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
      
      // Use the existing client which already has setMaxQueryPayment configured
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100_000)
        .setFunction('getUserStats', new ContractFunctionParameters().addAddress(userEvmAddress));
      
      // Get the cost of the query first
      const cost = await query.getCost(client);
      console.log('Query cost:', cost.toString());
      
      // Execute with the exact cost
      const result = await query.setQueryPayment(cost).execute(client);
      
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
