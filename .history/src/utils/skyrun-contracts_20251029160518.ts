export const SKYRUN_ADDRESSES = {
  token: "0x27E96fD16562a7f91A327e7A53056e911F66DdA0",
  game: "0x29521aABec4FBfE3d540B2a522776AeF80aC97f9"
};

export const SKYRUN_GAME_ABI = [
  {
    "inputs": [{"internalType":"uint256","name":"score","type":"uint256"}],
    "name":"submitGameScore","outputs":[],"stateMutability":"nonpayable","type":"function"
  },
  {
    "inputs": [{"internalType":"uint256","name":"questId","type":"uint256"}],
    "name":"claimQuestReward","outputs":[],"stateMutability":"nonpayable","type":"function"
  },
  {
    "inputs": [{"internalType":"address","name":"user","type":"address"}],
    "name":"getUserStats","outputs":[{"components":[{"internalType":"uint256","name":"totalGamesPlayed","type":"uint256"},{"internalType":"uint256","name":"totalScore","type":"uint256"},{"internalType":"uint256","name":"highScore","type":"uint256"},{"internalType":"uint256","name":"tokensEarned","type":"uint256"},{"internalType":"uint256","name":"level","type":"uint256"},{"internalType":"uint256","name":"lifelinesPurchased","type":"uint256"}],"internalType":"struct SkyRunGame.Stats","name":"","type":"tuple"}],"stateMutability":"view","type":"function"
  }
];


