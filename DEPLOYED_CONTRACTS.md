# Deployed Contracts - CoinQuest React

## Contract Addresses (Stacks Testnet)

**Deployer:** `ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1`

| Contract Name | Contract Address | Purpose |
|---------------|-----------------|---------|
| **GameTokenR** | `ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.GameTokenR` | ERC20-like token for in-game rewards |
| **QuestReward** | `ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.QuestReward` | Quest management and reward distribution |
| **PlayerProf** | `ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.PlayerProf` | Player statistics and profile management |
| **NFTBadgeR** | `ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.NFTBadgeR` | NFT badges for achievements |
| **QuestManag** | `ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.QuestManag` | Quest management system |
| **RewardToke** | `ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.RewardToke` | Reward token distribution |
| **SavingsVau** | `ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.SavingsVau` | Savings vault for players |

## Transaction IDs

- **GameTokenR**: `8815b5f70acd7d0e42fcf74627f6...`
- **NFTBadgeR**: `ec71519c6a5edff6808cf982efba...`
- **PlayerProf**: `8f448e36c167e7febfa36d582a28...`
- **QuestManag**: `7b4066a40e31c8195d63e24f3461...`
- **QuestReward**: `2f45e0db7969bc73851e23fa2ac1...`
- **RewardToke**: `8e10d8a9433722ebffbb115fcba8...`
- **SavingsVau**: `cd088fc57ee5378e3a5f02d49306...`

## Integration Status

✅ **Contracts Deployed** - All contracts successfully deployed to Stacks Testnet
✅ **Code Updated** - Application code updated to use correct contract addresses
✅ **Wallet Integration** - React wallet context configured with new contract addresses

## Next Steps

1. **Test Contract Integration** - Use `window.testContractIntegration()` in browser console
2. **Test Game Features** - Verify "Save Me", "Claim Reward", and "End Game" functionality
3. **Monitor Transactions** - Check Stacks Explorer for transaction confirmations
4. **Deploy to Production** - When ready, deploy to Stacks Mainnet

## Useful Links

- **Stacks Explorer**: https://explorer.stacks.co/?chain=testnet
- **Testnet Faucet**: https://explorer.stacks.co/sandbox/faucet
- **Contract Explorer**: https://explorer.stacks.co/txid/[TRANSACTION_ID]

## Testing Commands

```javascript
// Test wallet connection
window.connectWallet()

// Test contract integration
window.testContractIntegration()

// Test game score submission
window.callStacksFinalize([100])

// Test reward claiming
window.callStacksClaim([1])

// Test life purchase
window.callStacksBuyLife([])
```

---
*Deployed on: $(date)*
*Network: Stacks Testnet*
