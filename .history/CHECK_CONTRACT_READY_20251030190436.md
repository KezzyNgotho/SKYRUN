# Check If Contract Is Ready

Run this in your **browser console** to check if Mirror Node has indexed your new contract:

```javascript
// Test if contract is indexed
async function checkContractReady() {
  const gameAddress = "0xb4d36AA7305e6fC1a9bDCa236274cCd130D1382b";
  
  console.log("🔍 Checking if contract is indexed on Mirror Node...");
  
  try {
    // Try to get contract info
    const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/contracts/${gameAddress}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ CONTRACT IS READY!");
      console.log("Contract ID:", data.contract_id);
      console.log("EVM Address:", data.evm_address);
      console.log("Created:", new Date(data.created_timestamp * 1000).toLocaleString());
      return true;
    } else if (response.status === 404) {
      console.log("⏰ Not indexed yet. Wait a bit longer...");
      console.log(`Status: ${response.status} - Mirror Node hasn't indexed this contract yet`);
      return false;
    } else {
      console.log("⚠️ Unexpected response:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Error checking contract:", error);
    return false;
  }
}

// Run the check
await checkContractReady();
```

---

## Quick Check

Paste this one-liner in console:

```javascript
await fetch('https://testnet.mirrornode.hedera.com/api/v1/contracts/0xb4d36AA7305e6fC1a9bDCa236274cCd130D1382b').then(r => r.ok ? console.log('✅ READY!') : console.log('⏰ Not ready yet, wait ~2 more minutes'))
```

---

## What to Expect

### If Ready (indexed):
```
✅ READY!
✅ CONTRACT IS READY!
Contract ID: 0.0.xxxxxxx
```

### If Not Ready Yet (still indexing):
```
⏰ Not indexed yet. Wait a bit longer...
Status: 404 - Mirror Node hasn't indexed this contract yet
```

---

## Then Try the Game!

Once you see "✅ READY!", you can:
1. Clear wallet session: `window.clearWalletConnectData()`
2. Reconnect wallet
3. Play and submit score!

