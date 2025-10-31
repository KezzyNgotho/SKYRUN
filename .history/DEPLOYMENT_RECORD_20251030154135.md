# 🚀 SkyRun Contracts - Deployment Record

## Latest Deployment - Hedera Testnet

**Date:** December 2024
**Deployer:** 0xc772D45d8c54560078D3A11bf083047DBEEe6674

### Contract Addresses

| Contract | Address | Features |
|----------|---------|----------|
| **SkyRun Token** | `0x422653a1f38E3EcF2546f7D20B9554Dbc9Db4d56` | ERC-20 token for rewards |
| **SkyRun Game** | `0xCB1265714EF78ae848BBA5d8E922acF1c1700707` | Game contract with lifeline system |

### Contract Features

#### SkyRun Game Contract
✅ **Token Economy System**
- Players earn tokens based on score (score / 100)
- Token balance tracked: `tokensEarned - (lifelinesPurchased × lifelineCost)`
- Default lifeline cost: 10 tokens

✅ **Lifeline System**
- `buyLifeline()` - Purchase life with tokens (checks balance)
- `useLifeline()` - Consume a purchased life in-game
- `getAvailableLives(address)` - Check lives count
- `getTokenBalance(address)` - Check spendable token balance

✅ **Quest System**
- Default quest created: "First Score" (100 points, 50 token reward)
- `createQuest()` - Admin can create new quests
- `claimQuestReward()` - Players claim completed quests

✅ **Statistics Tracking**
- Total games played
- Total score & high score
- Tokens earned & spent
- Player level (auto-calculated)
- Lifelines purchased & available

### Initialization

✅ Token contract linked to game
✅ Game contract set as token minter
✅ Default quest created
✅ Ready for players!

### Network Details

- **Network:** Hedera Testnet
- **Chain ID:** 296
- **RPC URL:** https://testnet.hashio.io/api
- **Explorer:** https://hashscan.io/testnet

### Verification

You can verify the contracts on HashScan:
- Token: https://hashscan.io/testnet/contract/0x422653a1f38E3EcF2546f7D20B9554Dbc9Db4d56
- Game: https://hashscan.io/testnet/contract/0xCB1265714EF78ae848BBA5d8E922acF1c1700707

### Frontend Integration

✅ Contract addresses updated in `src/utils/skyrun-contracts.ts`
✅ Complete ABI included with all new functions
✅ React hooks ready for:
  - `buyLifeLine()`
  - `useLifeLine()`
  - `getAvailableLives()`
  - `getTokenBalance()`
  - `submitScore()`
  - `claimReward()`

### Testing Checklist

- [ ] Connect wallet with HashPack
- [ ] Play game and earn tokens
- [ ] Check token balance displays
- [ ] Buy lifeline with sufficient tokens
- [ ] Verify lifeline count increases
- [ ] Use lifeline in game
- [ ] Submit scores and earn more tokens
- [ ] Claim quest rewards

### Next Steps

1. **Refresh the app** - Contracts are now live!
2. **Play the game** - Earn tokens by playing
3. **Buy lives** - Spend tokens on lifelines
4. **Test full economy** - Verify token flow works

---

## Contract Upgrade Notes

### Changes from Previous Version

**Added:**
- `availableLives` field in Stats struct
- `buyLifeline()` with token balance checking
- `useLifeline()` for consuming lives
- `getAvailableLives(address)` view function
- `getTokenBalance(address)` view function
- `InsufficientTokenBalance` error
- `NoLivesAvailable` error

**Updated:**
- Stats struct now includes `availableLives`
- Lifeline purchases now check token balance
- Virtual token balance calculated correctly

### Migration from Old Contract

If you had a previous contract:
1. Old player data is NOT migrated (fresh start)
2. Players need to play to earn tokens again
3. New lifeline system requires token balance

---

**Deployment Successful! 🎉**

Your game now has a complete token economy with purchasable lifelines!

