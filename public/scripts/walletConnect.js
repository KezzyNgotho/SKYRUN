// coinQuest – Stacks Wallet Integration (Testnet-ready)

const USE_TESTNET = true; // ensure we prefer testnet addresses and APIs

// Stacks contracts from deployments/Testnet.toml
// Contract IDs on Stacks are of the form ADDRESS.CONTRACT_NAME
const STACKS_DEPLOYER = 'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1';
const STACKS_CONTRACTS = {
  GameTokenV2: `${STACKS_DEPLOYER}.GameTokenV2`,
  QuestRewardsV2: `${STACKS_DEPLOYER}.QuestRewardsV2`,
  PlayerProfileV2: `${STACKS_DEPLOYER}.PlayerProfileV2`,
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
  const walletArea = document.getElementById('walletArea');
  if (!walletArea) return;
  if (account) {
    walletArea.innerHTML = `
      <div class='connectButton walletConnected' onclick="disconnectWallet(); ${typeof clickSound !== 'undefined' ? 'clickSound.play()' : ''}">
        <img src="assets/gui/achives.png" alt=""> 
        <span class="walletText">${shorten(account)}</span>
        <span class="disconnectHint">(click to disconnect)</span>
      </div>`;
  } else {
    walletArea.innerHTML = `
      <div class='connectButton walletDisconnected' onclick="connectWallet(); ${typeof clickSound !== 'undefined' ? 'clickSound.play()' : ''}">
        <img src="assets/gui/achives.png" alt=""> 
        <span class="walletText">Connect Wallet</span>
        <span class="connectHint">(Stacks ${USE_TESTNET ? 'testnet' : 'mainnet'})</span>
      </div>`;
  }
}

function updateStatus() {
  const walletStatus = document.getElementById('walletStatus');
  const walletStatusText = document.getElementById('walletStatusText');
  const suffix = (typeof stxBalance === 'number') ? ` • ${stxBalance.toFixed(2)} STX` : '';
  if (account) {
    if (walletStatus) { walletStatus.textContent = `Connected: ${shorten(account)}${suffix}`; walletStatus.className = 'walletStatus connected'; }
    if (walletStatusText) { walletStatusText.textContent = `Connected: ${shorten(account)}${suffix}`; }
  } else {
    if (walletStatus) { walletStatus.textContent = 'Not Connected'; walletStatus.className = 'walletStatus disconnected'; }
    if (walletStatusText) { walletStatusText.textContent = 'Not Connected'; }
  }
}

async function refreshStxBalance(addr) {
  try {
    if (!addr) { stxBalance = null; updateStatus(); return; }
    const base = USE_TESTNET ? 'https://stacks-node-api.testnet.stacks.co' : 'https://stacks-node-api.mainnet.stacks.co';
    const resp = await fetch(`${base}/v2/accounts/${addr}`);
    if (!resp.ok) throw new Error('balance http ' + resp.status);
    const data = await resp.json();
    const micro = Number(data.balance || 0);
    stxBalance = micro / 1_000_000;
    updateStatus();
  } catch (_) { stxBalance = null; updateStatus(); }
}

function getAddrFromUserData(userData) {
  const profile = userData && userData.profile || {};
  return USE_TESTNET
    ? (profile.stxAddress && (profile.stxAddress.testnet || profile.stxAddress.mainnet))
    : (profile.stxAddress && (profile.stxAddress.mainnet || profile.stxAddress.testnet));
}

function ensureStacksAvailable() {
  return typeof window.StacksAuth !== 'undefined' && typeof window.StacksConnect !== 'undefined';
}

async function loadStacksLibs() {
  function add(src) {
    return new Promise(function(resolve, reject){
      var s = document.createElement('script');
      s.src = src; s.async = false; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  // Try current includes first
  if (ensureStacksAvailable()) return true;
  // Try unpkg
  try { await add('https://unpkg.com/@stacks/auth@latest/dist/index.umd.js'); } catch(_){}
  try { await add('https://unpkg.com/@stacks/connect@latest/dist/index.umd.js'); } catch(_){}
  if (ensureStacksAvailable()) return true;
  // Try jsDelivr
  try { await add('https://cdn.jsdelivr.net/npm/@stacks/auth/dist/index.umd.js'); } catch(_){}
  try { await add('https://cdn.jsdelivr.net/npm/@stacks/connect/dist/index.umd.js'); } catch(_){}
  if (ensureStacksAvailable()) return true;
  // Try JSPM
  try { await add('https://ga.jspm.io/npm:@stacks/auth@latest/dist/index.umd.js'); } catch(_){}
  try { await add('https://ga.jspm.io/npm:@stacks/connect@latest/dist/index.umd.js'); } catch(_){}
  return ensureStacksAvailable();
}

function initSession() {
  if (!ensureStacksAvailable()) return false;
  const { AppConfig, UserSession } = window.StacksAuth;
  const appConfig = new AppConfig(['store_write', 'publish_data']);
  userSession = new UserSession({ appConfig });
  return true;
}

async function handlePendingOrExistingSignIn() {
  if (!userSession) return;
  if (userSession.isSignInPending && userSession.isSignInPending()) {
    try {
      await userSession.handlePendingSignIn();
    } catch (_) {}
  }
  if (userSession.isUserSignedIn && userSession.isUserSignedIn()) {
    const userData = userSession.loadUserData();
    account = getAddrFromUserData(userData) || null;
    updateWalletAreaDisplay();
    updateStatus();
    if (account) refreshStxBalance(account);
  } else {
    account = null; stxBalance = null; updateWalletAreaDisplay(); updateStatus();
  }
}

function getStacksNetwork() {
  if (typeof window.StacksNetwork === 'undefined') return null;
  const { StacksMainnet, StacksTestnet } = window.StacksNetwork;
  return USE_TESTNET ? new StacksTestnet() : new StacksMainnet();
}

async function callContract(contractId, functionName, functionArgs) {
  if (!ensureStacksAvailable()) { notify('Wallet not ready'); return; }
  try {
    if (!userSession) { initSession(); }
    if (!userSession || !(userSession.isUserSignedIn && userSession.isUserSignedIn())) {
      // Attempt interactive connect (triggered from a user gesture path)
      if (typeof window.connectWallet === 'function') {
        await window.connectWallet();
      }
    }
  } catch(_) {}
  if (!userSession || !(userSession.isUserSignedIn && userSession.isUserSignedIn())) { notify('Wallet not ready'); return; }
  const net = getStacksNetwork();
  if (!net || typeof window.StacksTransactions === 'undefined') { notify('Stacks tx libs missing'); return; }
  const { openContractCall } = window.StacksConnect;
  const { tupleCV, uintCV, principalCV, stringUtf8CV, contractPrincipalCV, standardPrincipalCV } = window.StacksTransactions;
  const [address, name] = contractId.split('.');
  return new Promise(function(resolve, reject){
    openContractCall({
      userSession,
      contractAddress: address,
      contractName: name,
      functionName,
      functionArgs,
      network: net,
      postConditionMode: 1,
      onFinish: resolve,
      onCancel: function(){ reject(new Error('User canceled')); }
    });
  });
}

function extractStxAddress(resp) {
  try {
    // Leather
    if (resp && resp.addresses && Array.isArray(resp.addresses) && resp.addresses.length) {
      // Prefer testnet/mainnet based on USE_TESTNET
      const byType = resp.addresses.find(a => a && a.address && typeof a.address === 'string');
      return byType && byType.address;
    }
    // Xverse: may return array or object
    if (Array.isArray(resp)) {
      const first = resp[0];
      if (first && typeof first.address === 'string') return first.address;
      if (typeof first === 'string') return first;
    }
    if (resp && typeof resp.address === 'string') return resp.address;
    if (resp && typeof resp === 'string') return resp;
  } catch(_) {}
  return null;
}

async function connectWallet() {
  // Try direct providers first
  try {
    const leather = (window.StacksProvider || window.LeatherProvider);
    if (leather) {
      let resp = null;
      try { if (typeof leather.request === 'function') resp = await leather.request({ method: 'stx_requestAccounts' }); } catch(_){ }
      if (!resp) { try { if (typeof leather.connect === 'function') resp = await leather.connect(); } catch(_){ } }
      if (!resp) { try { if (typeof leather.getAddresses === 'function') resp = await leather.getAddresses(); } catch(_){ } }
      if (!resp && typeof leather.requestAccounts === 'function') { try { resp = await leather.requestAccounts(); } catch(_){ } }
      const addr = extractStxAddress(resp);
      if (addr) {
        account = addr;
        updateWalletAreaDisplay();
        updateStatus();
        await refreshStxBalance(account);
        return;
      }
    }
    if (window.XverseProviders && window.XverseProviders.stx && typeof window.XverseProviders.stx.request === 'function') {
      let resp = null;
      try { resp = await window.XverseProviders.stx.request('getAccounts'); } catch(_){ }
      if (!resp) { try { resp = await window.XverseProviders.stx.request({ method: 'getAccounts' }); } catch(_){ } }
      if (!resp) { try { resp = await window.XverseProviders.stx.request('getAddresses'); } catch(_){ } }
      const addr = extractStxAddress(resp);
      if (addr) {
        account = addr;
        updateWalletAreaDisplay();
        updateStatus();
        await refreshStxBalance(account);
        return;
      }
    }
  } catch(_){ }

  // Ensure Stacks libs loaded for popup path
  if (!ensureStacksAvailable()) {
    const ok = await loadStacksLibs();
    if (!ok) { notify('Stacks wallet not available in this environment'); return; }
  }
  if (!userSession && !initSession()) {
    notify('Failed to initialize wallet session');
    return;
  }
  const { showConnect } = window.StacksConnect;
  if (typeof showConnect !== 'function') {
    notify('Wallet UI not ready. Please reload.');
    return;
  }
  try {
    await new Promise((resolve, reject) => {
      showConnect({
        appDetails: { name: 'coinQuest', icon: (location.origin + '/fav/favicon-32x32.png') },
        userSession,
        onFinish: () => {
          try {
            const userData = userSession.loadUserData();
            account = getAddrFromUserData(userData) || null;
            updateWalletAreaDisplay();
            updateStatus();
            if (account) refreshStxBalance(account);
            resolve();
          } catch (e) { reject(e); }
        },
        onCancel: () => reject(new Error('User canceled')),
      });
    });
  } catch (_) {
    notify('Failed to connect wallet. Please try again.');
  }
}

function disconnectWallet() {
  try { if (userSession && userSession.isUserSignedIn && userSession.isUserSignedIn()) userSession.signUserOut(); } catch(_){}
  account = null; stxBalance = null;
  updateWalletAreaDisplay();
  updateStatus();
}

window.addEventListener('DOMContentLoaded', function() {
  if (initSession()) {
    handlePendingOrExistingSignIn();
  } else {
    updateWalletAreaDisplay();
    updateStatus();
  }

  // Expose simple helpers to call our contracts
  window.callStacksFinalize = async function(fnArgs){
    const id = getStacksContractId('QuestRewardsV2');
    if (!id) return;
    await callContract(id, 'submit-game-score', fnArgs);
  };
  window.callStacksClaim = async function(fnArgs){
    const id = getStacksContractId('QuestRewardsV2');
    if (!id) return;
    await callContract(id, 'claim-quest-reward', fnArgs);
  };
  window.callStacksBuyLife = async function(fnArgs){
    // If you add a lifeline function to a contract, set name here
    const id = getStacksContractId('QuestRewardsV2');
    if (!id) return;
    // Placeholder: no such function in QuestRewards now, so this is a no-op
    // await callContract(id, 'buy-lifeline', fnArgs);
  };
});

