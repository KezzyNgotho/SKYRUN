# CoinQuest 🎮💰

A play-to-earn endless runner game built on Stacks blockchain with React frontend. Players can earn COINQ tokens by playing the game, completing quests, and participating in DeFi savings. Features seamless Xverse wallet integration and modern React UI.

## 🚀 Features

- **Play-to-Earn**: Earn COINQ tokens by playing the endless runner game
- **Quest System**: Complete quests to unlock rewards and achievements
- **DeFi Integration**: Save STX and earn yield through the SavingsVault
- **NFT Badges**: Collect unique badges for achievements
- **Xverse Wallet Integration**: Seamless wallet connection using Sats Connect
- **React Frontend**: Modern, responsive UI with TypeScript
- **Real-time Wallet Status**: Live balance and connection status
- **Contract Integration**: Direct blockchain interaction for all game actions

## 📋 Prerequisites

- **XVERSE Wallet**: Install [XVERSE Wallet](https://www.xverse.app/) browser extension
- **Modern Browser**: Chrome, Firefox, Safari, or Edge
- **Stacks Testnet STX**: Get testnet STX from the [faucet](https://explorer.stacks.co/sandbox/faucet)

## 🏗️ Smart Contracts

### Deployed Contracts (Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| **GameToken** | `ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.GameToken` | ERC20-like token for in-game rewards |
| **QuestRewards** | `ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.QuestRewards` | Quest management and reward distribution |

### Contract Functions

#### GameToken
- `transfer(amount, recipient)` - Transfer COINQ tokens
- `get-balance(owner)` - Get token balance
- `mint(recipient, amount)` - Mint new tokens (admin only)

#### QuestRewards
- `submit-game-score(score)` - Submit game score and earn tokens
- `claim-quest-reward(quest-id)` - Claim completed quest rewards
- `get-user-stats(user)` - Get player statistics
- `get-quest(quest-id)` - Get quest details

## 🎮 How to Play

1. **Connect Wallet**: Click "Connect Wallet" and authorize with XVERSE
2. **Play Game**: Use arrow keys or WASD to control your character
3. **Earn Tokens**: Collect coins and avoid obstacles to increase your score
4. **Submit Score**: Click "Claim Rewards" to submit your score to the blockchain
5. **Complete Quests**: Achieve milestones to unlock quest rewards
6. **View Stats**: Check your token balance and player statistics

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Clarinet (for smart contract development)

### Installation

```bash
# Clone the repository
git clone https://github.com/KezzyNgotho/coinQuest.git
cd coinQuest-react

# Install dependencies
npm install

# Start development server
npm run dev
```

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Wallet Integration**: Sats Connect + Stacks Connect
- **Blockchain**: Stacks (Clarity smart contracts)
- **Styling**: CSS3 + Modern UI components
- **Build Tool**: Vite for fast development and building

### Smart Contract Development

```bash
# Install Clarinet
curl -L https://clarinet.io/install.sh | bash

# Check contracts
clarinet check

# Run tests
clarinet test

# Deploy to testnet
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

## 🌐 Network Configuration

- **Network**: Stacks Testnet
- **RPC URL**: `https://stacks-node-api.testnet.stacks.co`
- **Explorer**: [Stacks Testnet Explorer](https://explorer.stacks.co/?chain=testnet)

## 🔧 Configuration

### Wallet Setup
1. Install [XVERSE Wallet](https://www.xverse.app/)
2. Create or import a wallet
3. Switch to Stacks Testnet
4. Get testnet STX from the [faucet](https://explorer.stacks.co/sandbox/faucet)

### Contract Integration
The React frontend automatically connects to the deployed contracts. Contract addresses are configured in `src/contexts/WalletContext.tsx`:

```typescript
const STACKS_CONTRACTS = {
  GameTokenV2: 'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.GameTokenV2',
  QuestRewardsV2: 'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.QuestRewardsV2',
  PlayerProfileV2: 'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.PlayerProfileV2',
};
```

### React Components

- **WalletContext**: Manages wallet connection and contract interactions
- **WalletButton**: Connect/disconnect wallet with modern UI
- **GameCanvas**: Renders the game and loads legacy scripts
- **ContractCallButton**: Reusable component for contract calls
- **WalletBridge**: Bridges React wallet with legacy game scripts

## 🎯 Game Controls

- **Arrow Keys** or **WASD**: Move character
- **Spacebar**: Jump
- **P**: Pause game
- **M**: Toggle mute

## 🏆 Quest System

Complete various quests to earn additional rewards:

- **First Score**: Score your first points
- **High Score**: Achieve a high score milestone
- **Daily Player**: Play multiple games
- **Token Collector**: Earn a certain amount of tokens

## 💰 Tokenomics

- **Token Symbol**: COINQ
- **Token Name**: CoinQuest Game Token
- **Decimals**: 6
- **Initial Supply**: 1,000,000 COINQ
- **Reward Rate**: 1 COINQ per 100 game points

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to your preferred hosting service
# (Vercel, Netlify, GitHub Pages, etc.)
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Smart Contract Deployment
```bash
# Deploy to testnet
clarinet deployments apply -p deployments/default.testnet-plan.yaml

# Deploy to mainnet (when ready)
clarinet deployments apply -p deployments/Mainnet.toml
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Submission

This project was built for the **Stacks Vibe Coding Hackathon** focusing on:
- AI-powered development with Cursor and Claude
- Stacks blockchain integration
- Play-to-earn gaming mechanics
- DeFi savings integration

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/KezzyNgotho/coinQuest/issues)
- **Discord**: Join the Stacks Discord for community support
- **Documentation**: [Stacks Documentation](https://docs.stacks.co/)

---

**Built with ❤️ for the Stacks ecosystem**