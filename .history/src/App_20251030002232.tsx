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
    const updateWalletUI = () => {
      // Update all wallet status elements
      const walletStatusElements = document.querySelectorAll('#walletStatus, .walletStatus, #walletRewardStatus');
      walletStatusElements.forEach(el => {
        if (el) {
          el.textContent = connected 
            ? `Connected: ${accountId?.substring(0, 6)}...${accountId?.substring(accountId.length - 4)}` 
            : 'Not Connected';
          el.className = connected ? 'walletStatus connected' : 'walletStatus disconnected';
        }
      });

      // Update connect wallet buttons
      const connectButtons = document.querySelectorAll('.connectButton, button[onclick*="connectWallet"]');
      connectButtons.forEach((btn) => {
        if (connected) {
          // Hide or disable connect buttons when connected
          const buttonEl = btn as HTMLElement;
          if (buttonEl.classList.contains('connectButton')) {
            buttonEl.style.display = 'none';
          }
        } else {
          // Show connect buttons when disconnected
          const buttonEl = btn as HTMLElement;
          if (buttonEl.classList.contains('connectButton')) {
            buttonEl.style.display = 'flex';
          }
        }
      });

      // Enable/disable claim and buy buttons based on connection
      const claimBtn = document.getElementById('claimLastRunBtn');
      if (claimBtn) {
        (claimBtn as HTMLButtonElement).disabled = !connected;
        claimBtn.style.opacity = connected ? '1' : '0.5';
      }

      const saveBtn = document.getElementById('saveButton');
      if (saveBtn) {
        (saveBtn as HTMLButtonElement).disabled = !connected;
        saveBtn.style.opacity = connected ? '1' : '0.7';
      }

      // Update reward status texts
      const rewardStatusElements = document.querySelectorAll('.rewardStatus');
      rewardStatusElements.forEach(el => {
        if (el.textContent === 'Ready to claim' || el.textContent === 'Requires wallet connection') {
          el.textContent = connected ? 'Ready to claim' : 'Requires wallet connection';
        }
      });

      console.log(`🔄 Wallet UI updated - ${connected ? 'Connected' : 'Disconnected'}`);
    };

    updateWalletUI();
    
    // Also update UI when DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateWalletUI);
    } else {
      setTimeout(updateWalletUI, 100); // Small delay to ensure game UI is ready
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
