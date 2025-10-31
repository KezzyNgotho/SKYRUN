export const SKYRUN_ADDRESSES = {
  token: "0x2049e3f8D742e64c6B2Fa845981377Fe49ebf8F9", // Fixed deployment (corrected lifeline cost)
  game: "0x3D047eFea4994106b4A7ad07746a23133c8D30DE"  // Fixed deployment (corrected lifeline cost)
};

export const SKYRUN_GAME_ABI = [
  // Game Functions
  {
    "inputs": [{"internalType":"uint256","name":"score","type":"uint256"}],
    "name":"submitGameScore","outputs":[],"stateMutability":"nonpayable","type":"function"
  },
  {
    "inputs": [{"internalType":"uint256","name":"questId","type":"uint256"}],
    "name":"claimQuestReward","outputs":[],"stateMutability":"nonpayable","type":"function"
  },
  {
    "inputs": [],
    "name":"buyLifeline","outputs":[],"stateMutability":"nonpayable","type":"function"
  },
  {
    "inputs": [],
    "name":"useLifeline","outputs":[],"stateMutability":"nonpayable","type":"function"
  },
  
  // View Functions
  {
    "inputs": [{"internalType":"address","name":"user","type":"address"}],
    "name":"getUserStats","outputs":[{"components":[{"internalType":"uint256","name":"totalGamesPlayed","type":"uint256"},{"internalType":"uint256","name":"totalScore","type":"uint256"},{"internalType":"uint256","name":"highScore","type":"uint256"},{"internalType":"uint256","name":"tokensEarned","type":"uint256"},{"internalType":"uint256","name":"level","type":"uint256"},{"internalType":"uint256","name":"lifelinesPurchased","type":"uint256"},{"internalType":"uint256","name":"availableLives","type":"uint256"}],"internalType":"struct SkyRunGame.Stats","name":"","type":"tuple"}],"stateMutability":"view","type":"function"
  },
  {
    "inputs": [{"internalType":"address","name":"user","type":"address"}],
    "name":"getAvailableLives","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"
  },
  {
    "inputs": [{"internalType":"address","name":"user","type":"address"}],
    "name":"getTokenBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"
  },
  {
    "inputs": [{"internalType":"uint256","name":"questId","type":"uint256"}],
    "name":"getQuest","outputs":[{"components":[{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint8","name":"questType","type":"uint8"},{"internalType":"uint256","name":"rewardAmount","type":"uint256"},{"internalType":"uint256","name":"targetScore","type":"uint256"},{"internalType":"bool","name":"active","type":"bool"}],"internalType":"struct SkyRunGame.Quest","name":"","type":"tuple"}],"stateMutability":"view","type":"function"
  },
  {
    "inputs": [{"internalType":"uint256","name":"questId","type":"uint256"},{"internalType":"address","name":"user","type":"address"}],
    "name":"getQuestProgress","outputs":[{"components":[{"internalType":"uint256","name":"progress","type":"uint256"},{"internalType":"bool","name":"completed","type":"bool"},{"internalType":"bool","name":"claimed","type":"bool"}],"internalType":"struct SkyRunGame.Progress","name":"","type":"tuple"}],"stateMutability":"view","type":"function"
  },
  {
    "inputs": [],
    "name":"getTotalQuests","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"
  },
  {
    "inputs": [],
    "name":"lifelineCost","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"
  },
  
  // Owner Functions (Admin only)
  {
    "inputs": [{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint8","name":"questType","type":"uint8"},{"internalType":"uint256","name":"rewardAmount","type":"uint256"},{"internalType":"uint256","name":"targetScore","type":"uint256"}],
    "name":"createQuest","outputs":[],"stateMutability":"nonpayable","type":"function"
  },
  {
    "inputs": [{"internalType":"uint256","name":"cost","type":"uint256"}],
    "name":"setLifelineCost","outputs":[],"stateMutability":"nonpayable","type":"function"
  },
  {
    "inputs": [{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"bool","name":"enabled","type":"bool"}],
    "name":"setHTSToken","outputs":[],"stateMutability":"nonpayable","type":"function"
  }
];


