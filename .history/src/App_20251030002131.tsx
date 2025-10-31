import React, { useEffect } from 'react';
import { HashpackProvider, useHashpack } from './contexts/HashpackContext';
import { useSkyRunActions } from './utils/hederaHashpack';
import './App.css';
import { HederaActions } from './components/HederaActions';

// Bridge component to expose wallet functions to game.js
const WalletBridge: React.FC = () => {
  const { connected, accountId, connect, disconnect } = useHashpack();
  const { submitScore, claimReward, buyLifeLine } = useSkyRunActions();

  useEffect(() => {
    // Expose wallet status and functions to game.js
    window.reactWalletFunctions = {
      getWalletStatus: () => ({
        connected,
        address: accountId || null,
        balance: null // Can be fetched from Hedera if needed
      }),
      connectWallet: connect,
      disconnectWallet: disconnect,
      submitGameScore: submitScore,
      claimQuestReward: claimReward,
      buyLifeLine: buyLifeLine
    };

    console.log('✅ Wallet bridge functions exposed to game.js');
    console.log('Wallet status:', connected ? `Connected (${accountId})` : 'Disconnected');

    // Update UI based on wallet connection
    if (connected) {
      // Hide connect wallet button, show wallet address
      const connectBtn = document.getElementById('connectWallet');
      if (connectBtn) {
        connectBtn.style.display = 'none';
      }
      
      // Show wallet info if element exists
      const walletInfo = document.getElementById('walletInfo');
      if (walletInfo) {
        walletInfo.textContent = `Connected: ${accountId?.substring(0, 8)}...`;
        walletInfo.style.display = 'block';
      }
    } else {
      // Show connect wallet button
      const connectBtn = document.getElementById('connectWallet');
      if (connectBtn) {
        connectBtn.style.display = 'block';
      }
      
      // Hide wallet info
      const walletInfo = document.getElementById('walletInfo');
      if (walletInfo) {
        walletInfo.style.display = 'none';
      }
    }
  }, [connected, accountId, connect, disconnect, submitScore, claimReward, buyLifeLine]);

  return null;
};

function App() {
  // Debug logging
  useEffect(() => {
    console.log('🚀 SkyRun App component mounted');
  }, []);

  return (
    <HashpackProvider>
      <WalletBridge />
      <div className="App">
        {/* All game functionality handled by main game.js - no React UI needed */}
        {/* Show test actions only in development mode */}
        {import.meta.env.DEV && <HederaActions />}
      </div>
    </HashpackProvider>
  );
}

export default App;
