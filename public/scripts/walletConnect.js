// coinQuest – Stacks Wallet Integration (Testnet-ready)
// DISABLED - Using React wallet system instead

console.log('⚠️ Legacy wallet system disabled - using React wallet system');

const USE_TESTNET = true; // ensure we prefer testnet addresses and APIs

// Stacks contracts from deployments/Testnet.toml
// Contract IDs on Stacks are of the form ADDRESS.CONTRACT_NAME
const STACKS_DEPLOYER = 'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1';
const STACKS_CONTRACTS = {
  CoinQuestToken: `${STACKS_DEPLOYER}.CoinQuestToken`,
  CoinQuestGame: `${STACKS_DEPLOYER}.CoinQuestGame`,
};

function getStacksContractId(name) {
  return STACKS_CONTRACTS[name] || null;
}

let account = null; // STX address (testnet/mainnet per USE_TESTNET)
let stxBalance = null; // in STX
let userSession = null;

function notify(message) {
  try {
    const el = document.getElementById('walletStatusText');
    if (el) el.textContent = message;
  } catch (_) {}
  try { console.warn('[wallet]', message); } catch (_) {}
}

function shorten(addr) {
  return addr && addr.length > 10 ? addr.slice(0, 6) + '...' + addr.slice(-4) : addr;
}

function updateWalletAreaDisplay() {
  // DISABLED - Using React wallet system instead
  console.log('⚠️ Legacy wallet updateWalletAreaDisplay disabled - using React system');
  return;
}

function updateStatus() {
  // DISABLED - Using React wallet system instead
  console.log('⚠️ Legacy wallet updateStatus disabled - using React system');
  return;
}

async function refreshStxBalance(addr) {
  // DISABLED - Using React wallet system instead
  console.log('⚠️ Legacy wallet refreshStxBalance disabled - using React system');
  return;
}

function getAddrFromUserData(userData) {
  return null; // Disabled
}

function extractStxAddress(resp) {
  return null; // Disabled
}

async function connectWallet() {
  // DISABLED - Using React wallet system instead
  console.log('⚠️ Legacy wallet connectWallet disabled - using React system');
  
  // Redirect to React wallet system
  if (typeof window.connectWallet === 'function') {
    await window.connectWallet();
        return;
      }
  
        return;
      }

function disconnectWallet() {
  // DISABLED - Using React wallet system instead
  console.log('⚠️ Legacy wallet disconnectWallet disabled - using React system');
  
  // Redirect to React wallet system
  if (typeof window.disconnectWallet === 'function') {
    window.disconnectWallet();
    return;
  }
  
    return;
  }

// Contract call functions
async function callContract(contractId, functionName, functionArgs) {
  // DISABLED - Using React wallet system instead
  console.log('⚠️ Legacy contract calls disabled - using React system');
  return;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 CoinQuest wallet system initializing...');
  
  // Check if React wallet system is available
  if (typeof window.connectWallet === 'function') {
    console.log('✅ React wallet system detected - legacy system disabled');
    return;
  }
  
  console.log('⚠️ No React wallet system found - legacy system disabled');
});

// Export disabled functions globally
window.connectWallet = connectWallet;
window.disconnectWallet = disconnectWallet;
window.updateWalletAreaDisplay = updateWalletAreaDisplay;
window.updateStatus = updateStatus;
window.refreshStxBalance = refreshStxBalance;
window.getAddrFromUserData = getAddrFromUserData;
window.getStacksContractId = getStacksContractId;
window.notify = notify;
window.shorten = shorten;