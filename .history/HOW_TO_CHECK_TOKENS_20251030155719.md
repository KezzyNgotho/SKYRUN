# 🪙 How to Check Your Game Tokens

## The Problem You Had

The `CONTRACT_REVERT_EXECUTED` error happens because **you don't have enough game tokens to buy a lifeline yet**.

The lifeline costs **10 tokens**, and you earn tokens by playing the game:
- **1 token = 100 points**
- **10 tokens = 1000 points**

## ✅ Step-by-Step Solution

### 1. Refresh Your Browser

**IMPORTANT:** You need to refresh to load the new contract addresses!

```
Press: Ctrl + Shift + R (Windows/Linux)
       Cmd + Shift + R (Mac)
```

### 2. Connect Your Wallet

Make sure your HashPack wallet is connected to the game.

### 3. Check Your Current Token Balance

Open the browser console (`F12` or right-click → Inspect → Console`) and run:

```javascript
await checkGameTokens()
```

This will show you:
- 🪙 How many tokens you have
- ❤️ How many lives you have
- 💰 How much a lifeline costs
- ✅ Whether you can afford a lifeline

**Example output:**
```
🪙 Token Balance: 0
❤️ Available Lives: 0
💰 Lifeline Cost: 10 tokens
✅ Can Buy Lifeline: false
📊 Need to earn: 10 more tokens
🎮 Score needed: 1000 points
```

### 4. Play the Game to Earn Tokens

1. Click "Play" and play the game
2. Score at least **1000 points** (this earns you 10 tokens)
3. When the game ends, submit your score
4. Your tokens will be credited to your account

### 5. Verify Your Tokens

Run the check command again:

```javascript
await checkGameTokens()
```

You should now see:
```
🪙 Token Balance: 10 (or more)
✅ Can Buy Lifeline: true
```

### 6. Buy a Lifeline

Now when you click "Buy Life" in the game, it should work! ✅

---

## 🐛 What Was Fixed

### Bug #1: Unit Mismatch (FIXED ✅)
The original contract had a critical bug where lifelines cost `10 ether` (10,000,000,000,000,000,000 wei) instead of `10` tokens. This made lifelines impossibly expensive.

**Fixed in 2nd deployment:**
- Old: `uint256 public lifelineCost = 10 ether;`
- New: `uint256 public lifelineCost = 10;`

### New Features Added:
1. ✅ Token balance checker (`checkGameTokens()`)
2. ✅ Automatic balance check before buying lifeline
3. ✅ Helpful error messages with exact token requirements
4. ✅ Display of how many more points you need to score

---

## 📝 Quick Reference

| Action | Tokens Needed | Score Needed |
|--------|---------------|--------------|
| Buy 1 Lifeline | 10 tokens | 1,000 points |
| Buy 2 Lifelines | 20 tokens | 2,000 points |
| Buy 5 Lifelines | 50 tokens | 5,000 points |

**Token Formula:** `tokens = score / 100`

---

## 🎮 Game Economy

1. **Play the game** → Earn score
2. **Submit score** → Get tokens (score ÷ 100)
3. **Spend tokens** → Buy lifelines (10 tokens each)
4. **Use lifelines** → Continue playing when you die

**Example:**
- Play and score 2,500 points
- Submit score → Get 25 tokens
- Buy 2 lifelines (costs 20 tokens)
- You now have 5 tokens left and 2 lives

---

## 🆘 Troubleshooting

### "Still getting CONTRACT_REVERT_EXECUTED"
1. Make sure you refreshed the browser (hard refresh!)
2. Check your token balance: `await checkGameTokens()`
3. If balance is 0, play the game and submit a score first
4. Then try buying a lifeline again

### "checkGameTokens is not defined"
- You need to refresh the browser to load the new code

### "Failed to check token balance"
- Make sure your wallet is connected
- Check that you're on the Hedera Testnet

---

## 🎉 Ready to Play!

1. ✅ Contracts redeployed with bug fix
2. ✅ Frontend updated with new addresses
3. ✅ Token checker added
4. ✅ Balance validation before purchase

**Now refresh your browser and start earning tokens!** 🚀

