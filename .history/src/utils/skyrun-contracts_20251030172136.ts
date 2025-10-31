export const SKYRUN_ADDRESSES = {
  token: "0x8A15547fB4920691C18F89a88f6725469fa321fF", // msg.sender pattern deployment
  game: "0xA1F0dadfa6235A12C8644af1dC50e852d67e2e44",  // msg.sender pattern deployment
  gameContractId: "" // Will be filled with Hedera ID format (0.0.xxxxx) - get from HashScan
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
  
  // View Functions (using msg.sender pattern - no address parameter needed)
  {
    "inputs": [],
    "name":"getUserStats","outputs":[{"components":[{"internalType":"uint256","name":"totalGamesPlayed","type":"uint256"},{"internalType":"uint256","name":"totalScore","type":"uint256"},{"internalType":"uint256","name":"highScore","type":"uint256"},{"internalType":"uint256","name":"tokensEarned","type":"uint256"},{"internalType":"uint256","name":"level","type":"uint256"},{"internalType":"uint256","name":"lifelinesPurchased","type":"uint256"},{"internalType":"uint256","name":"availableLives","type":"uint256"}],"internalType":"struct SkyRunGame.Stats","name":"","type":"tuple"}],"stateMutability":"view","type":"function"
  },
  {
    "inputs": [],
    "name":"getAvailableLives","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"
  },
  {
    "inputs": [],
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


