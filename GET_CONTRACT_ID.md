# 🔍 Get Your Hedera Contract ID

## Quick Fix Needed!

The mirror node needs the **Hedera contract ID** (format `0.0.xxxxx`), but we only have the EVM address.

---

## 📝 Steps to Get Contract ID

### Step 1: Go to HashScan
Open this link:
```
https://hashscan.io/testnet/contract/0x3D047eFea4994106b4A7ad07746a23133c8D30DE
```

### Step 2: Copy the Contract ID
On the HashScan page, you'll see something like:
```
Contract ID: 0.0.5033629
```

Copy that number (the `0.0.xxxxx` part).

### Step 3: Update the Contract File

Open `src/utils/skyrun-contracts.ts` and update line 4:

**Change from:**
```typescript
gameContractId: "" // Will be filled with Hedera ID format
```

**To:**
```typescript
gameContractId: "0.0.YOUR_NUMBER_HERE" // Replace with actual ID from HashScan
```

### Step 4: Update the Query Functions

I'll provide code that uses this ID properly.

---

## 🚀 Alternative Quick Fix

**If you can't access HashScan right now**, try this temporary solution:

Run this in your browser console (F12) after connecting wallet and submitting a score:

```javascript
// Check the transaction receipt for the contract ID
// It should be in the last transaction you made
```

Or just tell me: **What was the full output when you ran the deployment script?**

The deployment output should have shown something like:
```
Token deployed: 0x...
Game deployed: 0x...
```

But also somewhere it might show:
```
Contract created: 0.0.xxxxx
```

---

Let me know the contract ID and I'll update the code!

