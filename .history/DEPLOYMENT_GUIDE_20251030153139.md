# 🚀 SkyRun Game - Deployment & Testing Guide

## ✅ What Was Built

### **Smart Contract Features:**
1. **Token Economy**
   - Players earn tokens by playing (score / 100 = tokens)
   - Tokens tracked in `tokensEarned`
   - Virtual balance = `tokensEarned - (lifelinesPurchased × lifelineCost)`

2. **Lifeline System**
   - **Buy Life**: Costs 10 tokens (configurable)
   - **Check Balance**: View available tokens
   - **Use Life**: Consume a purchased life in-game
   - **Track Lives**: See how many lives available

3. **New Functions Added:**
   - `buyLifeline()` - Purchase a life with tokens (checks balance!)
   - `useLifeline()` - Use a life during gameplay
   - `getAvailableLives(address)` - Check lives count
   - `getTokenBalance(address)` - Check token balance

### **Frontend Integration:**
- All functions exposed through React hooks
- Wallet connection with HashPack
- Transaction signing with Hedera SDK
- Real-time UI updates

---

## 📋 Step-by-Step Deployment

### **Step 1: Deploy Updated Contract**

1. **Compile the contract:**
   ```bash
   cd hedera/contracts
   # Compile SkyRunGame.sol
   ```

2. **Deploy to Hedera Testnet:**
   - Use Hedera CLI or your deployment script
   - Save the new contract ID
   - Update `src/utils/skyrun-contracts.ts` with new address

3. **Initialize Contract:**
   ```solidity
   // On deployment, contract is initialized with token address
   // Default lifelineCost = 10 ether (10 tokens)
   ```

### **Step 2: Update Frontend Contract Address**

In `src/utils/skyrun-contracts.ts`:
```typescript
export const SKYRUN_ADDRESSES = {
  token: "YOUR_TOKEN_ADDRESS",
  game: "YOUR_NEW_GAME_CONTRACT_ADDRESS" // ← Update this
};
```

### **Step 3: Test the System**

#### **3.1 Play & Earn Tokens**
```
1. Play the game
2. Submit score (e.g., 1000)
3. Contract mints: 1000 / 100 = 10 tokens
4. Check balance: getTokenBalance() → 10 tokens
```

#### **3.2 Buy a Life**
```
1. Click "Buy Life"
2. Contract checks: Do you have 10+ tokens?
   ✅ Yes → Purchase succeeds
   ❌ No → "InsufficientTokenBalance" error
3. If success:
   - lifelinesPurchased += 1
   - availableLives += 1
   - Virtual balance -= 10
```

#### **3.3 Use a Life in Game**
```javascript
// In game.js, when player dies:
if (window.reactWalletFunctions) {
  const lives = await window.reactWalletFunctions.getAvailableLives();
  if (lives > 0) {
    await window.reactWalletFunctions.useLifeLine();
    // Continue game!
  }
}
```

---

## 🎮 Game Integration

### **Add to game.js:**

```javascript
// Check lives when player dies
async function onPlayerDeath() {
  if (!window.reactWalletFunctions) return;
  
  try {
    const lives = await window.reactWalletFunctions.getAvailableLives();
    
    if (lives > 0) {
      // Show "Use Life?" popup
      const use = confirm(`You have ${lives} lives. Use one to continue?`);
      
      if (use) {
        await window.reactWalletFunctions.useLifeLine();
        // Reset player position and continue
        resetPlayer();
        return;
      }
    }
    
    // No lives or declined - game over
    showGameOver();
  } catch (error) {
    console.error('Life system error:', error);
    showGameOver();
  }
}

// Display token balance in UI
async function updateTokenDisplay() {
  if (!window.reactWalletFunctions) return;
  
  const balance = await window.reactWalletFunctions.getTokenBalance();
  document.getElementById('tokenBalance').textContent = balance;
}
```

---

## 💰 Token Economy Balance

### **Default Settings:**
- **Earn Rate**: 1 token per 100 score
- **Life Cost**: 10 tokens
- **Example**: Score 1000 → Get 10 tokens → Buy 1 life

### **Adjust for Your Game:**

```solidity
// In contract, owner can change:
setLifelineCost(5 ether);  // Make lives cheaper

// Or modify earn rate in _calculateTokensForScore():
function _calculateTokensForScore(uint256 score) internal pure returns (uint256) {
    return score / 50;  // 1 token per 50 score (more generous)
}
```

---

## 🔍 Testing Checklist

- [ ] Deploy contract to testnet
- [ ] Update contract address in frontend
- [ ] Connect wallet with HashPack
- [ ] Play game and earn tokens
- [ ] Check token balance displays correctly
- [ ] Try buying life with insufficient tokens (should fail)
- [ ] Earn enough tokens and buy life (should succeed)
- [ ] Check available lives count
- [ ] Use a life in game
- [ ] Verify life count decreased
- [ ] Test full game loop with lives

---

## 📊 Contract Functions Reference

### **Player Functions:**
| Function | Purpose | Cost |
|----------|---------|------|
| `submitGameScore(uint256)` | Submit score, earn tokens | Gas only |
| `buyLifeline()` | Buy a life | 10 tokens |
| `useLifeline()` | Use a life in game | Gas only |
| `claimQuestReward(uint256)` | Claim quest rewards | Gas only |

### **View Functions:**
| Function | Returns | Purpose |
|----------|---------|---------|
| `getUserStats(address)` | Full stats | All player data |
| `getAvailableLives(address)` | uint256 | Lives count |
| `getTokenBalance(address)` | uint256 | Spendable tokens |
| `getTotalQuests()` | uint256 | Total quests |
| `lifelineCost()` | uint256 | Cost to buy life |

---

## 🎯 Next Steps

1. **Deploy the updated contract**
2. **Update the contract address**
3. **Test the full flow**
4. **Integrate lives into game logic**
5. **Add UI for token balance and lives**
6. **Create quests for more ways to earn tokens**

---

## 🚨 Important Notes

- **Testnet Only**: Use Hedera testnet for testing
- **Free HBAR**: Get testnet HBAR from faucet for gas fees
- **Token Balance**: Tokens are virtual (tracked in contract state)
- **Lives System**: Lives must be used from game.js
- **Error Handling**: Contract will revert if insufficient tokens

---

## 📞 Need Help?

- Contract errors? Check Hedera explorer
- Wallet issues? Reconnect HashPack
- Balance wrong? Check `getUserStats()` for raw data

**Your game now has a complete economy system!** 🎉

