# 🎮 CoinQuest - API Documentation

## Overview

CoinQuest provides a comprehensive API for interacting with the game's smart contracts and blockchain functionality. This documentation covers all available functions, parameters, and return values.

## Base URL

- **Testnet**: `https://stacks-node-api.testnet.stacks.co`
- **Mainnet**: `https://stacks-node-api.mainnet.stacks.co`

## Authentication

All API calls require wallet authentication through the Stacks Connect library or direct wallet integration.

## Smart Contract APIs

### QuestReward Contract

**Contract Address**: `ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.QuestReward`

#### submit-game-score

Submit a game score and earn tokens based on performance.

```typescript
interface SubmitScoreParams {
  score: number; // Game score (uint)
}

interface SubmitScoreResult {
  success: boolean;
  txId?: string;
  error?: string;
}
```

**Example Usage**:
```javascript
const result = await wallet.callContract(
  'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.QuestReward',
  'submit-game-score',
  [100]
);
```

**Response**:
```json
{
  "success": true,
  "txId": "0x1234567890abcdef..."
}
```

#### claim-quest-reward

Claim rewards for completed quests.

```typescript
interface ClaimRewardParams {
  questId: number; // Quest identifier (uint)
}

interface ClaimRewardResult {
  success: boolean;
  txId?: string;
  tokensEarned?: number;
  error?: string;
}
```

**Example Usage**:
```javascript
const result = await wallet.callContract(
  'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.QuestReward',
  'claim-quest-reward',
  [1]
);
```

#### buy-lifeline

Purchase an extra life using tokens.

```typescript
interface BuyLifelineResult {
  success: boolean;
  txId?: string;
  tokensSpent?: number;
  error?: string;
}
```

**Example Usage**:
```javascript
const result = await wallet.callContract(
  'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.QuestReward',
  'buy-lifeline',
  []
);
```

#### initialize-with-game-token

Initialize the contract with GameToken integration.

```typescript
interface InitializeResult {
  success: boolean;
  txId?: string;
  error?: string;
}
```

**Example Usage**:
```javascript
const result = await wallet.callContract(
  'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.QuestReward',
  'initialize-with-game-token',
  []
);
```

### GameToken Contract

**Contract Address**: `ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.GameTokenR`

#### mint-tokens

Mint new tokens for rewards.

```typescript
interface MintTokensParams {
  recipient: string; // Stacks address (principal)
  amount: number;    // Token amount (uint)
}

interface MintTokensResult {
  success: boolean;
  txId?: string;
  error?: string;
}
```

#### transfer

Transfer tokens between addresses.

```typescript
interface TransferParams {
  recipient: string; // Recipient address (principal)
  amount: number;   // Transfer amount (uint)
}

interface TransferResult {
  success: boolean;
  txId?: string;
  error?: string;
}
```

### PlayerProfile Contract

**Contract Address**: `ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.PlayerProf`

#### update-stats

Update player statistics.

```typescript
interface UpdateStatsParams {
  totalGames: number;
  totalScore: number;
  highScore: number;
  level: number;
}

interface UpdateStatsResult {
  success: boolean;
  txId?: string;
  error?: string;
}
```

## Wallet API

### Connection Functions

#### connectWallet

Connect to a Stacks wallet.

```typescript
interface ConnectWalletResult {
  success: boolean;
  address?: string;
  error?: string;
}
```

**Example Usage**:
```javascript
const result = await window.connectWallet();
if (result.success) {
  console.log('Connected to:', result.address);
}
```

#### disconnectWallet

Disconnect the current wallet.

```typescript
interface DisconnectWalletResult {
  success: boolean;
}
```

#### getWalletStatus

Get current wallet connection status.

```typescript
interface WalletStatus {
  connected: boolean;
  address: string | null;
  balance: number | null;
  isConnecting: boolean;
  error: string | null;
}
```

**Example Usage**:
```javascript
const status = window.getWalletStatus();
console.log('Wallet status:', status);
```

## Game API

### Score Management

#### submitScore

Submit a game score to the blockchain.

```typescript
interface SubmitScoreParams {
  score: number;
}

interface SubmitScoreResult {
  success: boolean;
  txId?: string;
  tokensEarned?: number;
  error?: string;
}
```

**Example Usage**:
```javascript
const result = await window.callStacksFinalize([100]);
console.log('Score submitted:', result);
```

#### claimReward

Claim quest rewards.

```typescript
interface ClaimRewardParams {
  questId: number;
}

interface ClaimRewardResult {
  success: boolean;
  txId?: string;
  tokensEarned?: number;
  error?: string;
}
```

**Example Usage**:
```javascript
const result = await window.callStacksClaim([1]);
console.log('Reward claimed:', result);
```

#### buyLife

Purchase an extra life.

```typescript
interface BuyLifeResult {
  success: boolean;
  txId?: string;
  tokensSpent?: number;
  error?: string;
}
```

**Example Usage**:
```javascript
const result = await window.callStacksBuyLife([]);
console.log('Life purchased:', result);
```

## Utility Functions

### Contract Testing

#### testContractIntegration

Test contract integration and functionality.

```typescript
interface TestResult {
  success: boolean;
  contracts: {
    GameTokenR: string | null;
    QuestReward: string | null;
    PlayerProf: string | null;
  };
  errors: string[];
}
```

**Example Usage**:
```javascript
const result = await window.testContractIntegration();
console.log('Test results:', result);
```

#### initializeContractIntegration

Initialize contract integration with GameToken.

```typescript
interface InitializeResult {
  success: boolean;
  txId?: string;
  error?: string;
}
```

**Example Usage**:
```javascript
const result = await window.initializeContractIntegration();
console.log('Initialization:', result);
```

### Debug Functions

#### debugWalletDetection

Debug wallet detection and available providers.

```typescript
interface DebugResult {
  availableWallets: string[];
  detectedProviders: string[];
  connectionStatus: string;
}
```

**Example Usage**:
```javascript
window.debugWalletDetection();
// Outputs debug information to console
```

## Error Handling

### Common Error Types

```typescript
interface APIError {
  code: string;
  message: string;
  details?: any;
}

// Common error codes:
// - WALLET_NOT_CONNECTED
// - CONTRACT_NOT_FOUND
// - TRANSACTION_FAILED
// - INSUFFICIENT_BALANCE
// - NETWORK_ERROR
```

### Error Handling Example

```javascript
try {
  const result = await window.callStacksFinalize([100]);
  if (result.success) {
    console.log('Success:', result.txId);
  } else {
    console.error('Error:', result.error);
  }
} catch (error) {
  console.error('Exception:', error.message);
}
```

## Rate Limiting

- **Contract Calls**: 10 requests per minute per wallet
- **Balance Queries**: 60 requests per minute per IP
- **Transaction Submissions**: 5 requests per minute per wallet

## Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Server Error |

## SDK Examples

### React Hook Usage

```typescript
import { useWallet } from './contexts/WalletContext';

function GameComponent() {
  const wallet = useWallet();
  
  const handleSubmitScore = async (score: number) => {
    if (!wallet.isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    try {
      const result = await wallet.callContract(
        wallet.getContractId('QuestReward'),
        'submit-game-score',
        [score]
      );
      
      console.log('Score submitted:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (
    <button onClick={() => handleSubmitScore(100)}>
      Submit Score
    </button>
  );
}
```

### Direct API Usage

```javascript
// Check wallet status
const status = window.getWalletStatus();
if (!status.connected) {
  await window.connectWallet();
}

// Submit score
const result = await window.callStacksFinalize([100]);
console.log('Result:', result);

// Claim reward
const claimResult = await window.callStacksClaim([1]);
console.log('Claim result:', claimResult);
```

## Testing

### Test Environment

Use the testnet environment for development and testing:

```javascript
// Testnet configuration
const TESTNET_CONFIG = {
  network: 'testnet',
  contractAddresses: {
    QuestReward: 'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.QuestReward',
    GameTokenR: 'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.GameTokenR',
    PlayerProf: 'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.PlayerProf'
  }
};
```

### Test Functions

```javascript
// Test contract integration
await window.testContractIntegration();

// Test wallet connection
await window.connectWallet();

// Test score submission
await window.callStacksFinalize([100]);
```

## Support

For API support and questions:

- **Documentation**: [docs.coinquest.com/api](https://docs.coinquest.com/api)
- **Discord**: [discord.gg/coinquest](https://discord.gg/coinquest)
- **Email**: api-support@coinquest.com
- **GitHub Issues**: [github.com/KezzyNgotho/coinQuest/issues](https://github.com/KezzyNgotho/coinQuest/issues)
