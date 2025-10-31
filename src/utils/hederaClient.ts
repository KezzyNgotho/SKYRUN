import { BrowserProvider, Contract } from 'ethers';
import { SKYRUN_ADDRESSES, SKYRUN_GAME_ABI } from './skyrun-contracts';

export async function getProvider(): Promise<BrowserProvider> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('No EVM wallet detected (e.g., MetaMask).');
  }
  const provider = new BrowserProvider((window as any).ethereum);
  await (window as any).ethereum.request?.({ method: 'eth_requestAccounts' });
  return provider;
}

export async function getSignerAddress(): Promise<string> {
  const provider = await getProvider();
  const signer = await provider.getSigner();
  return signer.address;
}

export async function getGameContract(): Promise<Contract> {
  const provider = await getProvider();
  const signer = await provider.getSigner();
  return new Contract(SKYRUN_ADDRESSES.game, SKYRUN_GAME_ABI, signer);
}

export async function submitScore(score: number) {
  const game = await getGameContract();
  const tx = await game.submitGameScore(score);
  return await tx.wait();
}

export async function claimReward(questId: number) {
  const game = await getGameContract();
  const tx = await game.claimQuestReward(questId);
  return await tx.wait();
}

export async function getUserStats(address?: string) {
  const provider = await getProvider();
  const signer = await provider.getSigner();
  const user = address || signer.address;
  const game = new Contract(SKYRUN_ADDRESSES.game, SKYRUN_GAME_ABI, provider);
  return await game.getUserStats(user);
}


