import React, { useEffect, useRef } from 'react';
import { HashpackProvider, useHashpack } from './contexts/HashpackContext';
import { useSkyRunActions } from './utils/hederaHashpack';
import './App.css';
import { HederaActions } from './components/HederaActions';

// Bridge component to expose wallet functions to game.js
const WalletBridge: React.FC = () => {
  const { connected, accountId, connect, disconnect } = useHashpack();
  const { submitScore, claimReward, buyLifeLine } = useSkyRunActions();
  
  // Use ref to always get latest values without closure issues
  const walletStateRef = useRef({ connected, accountId });
  
  // Update ref whenever values change
  useEffect(() => {
    walletStateRef.current = { connected, accountId };
    console.log('🔄 Wallet state updated in ref:', { connected, accountId });
  }, [connected, accountId]);

  useEffect(() => {
    // Expose wallet status and functions to game.js
    window.reactWalletFunctions = {
      getWalletStatus: () => {
        // ALWAYS get latest values from ref to avoid closure issues
        const { connected: isConnected, accountId: account } = walletStateRef.current;
        const status = {
          connected: isConnected,
          address: account || null,
          balance: null // Can be fetched from Hedera if needed
        };
        console.log('📊 getWalletStatus called, returning:', status);
        console.log('📊 Ref values:', walletStateRef.current);
        return status;
      },
      connectWallet: connect,
      disconnectWallet: disconnect,
      submitGameScore: submitScore,
      claimQuestReward: claimReward,
      buyLifeLine: buyLifeLine
    };

    console.log('✅ Wallet bridge functions exposed to game.js (using ref for latest values)');

    // Update UI based on wallet connection
    const updateWalletUI = () => {
      // Get latest values from ref
      const { connected, accountId } = walletStateRef.current;
      
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

      // Update wallet status indicator and text
      const statusIndicator = document.getElementById('walletStatusIndicator');
      const statusText = document.getElementById('walletStatusText');
      const walletAddressText = document.getElementById('walletAddressText');
      
      if (statusIndicator) {
        statusIndicator.className = connected ? 'wallet-status-indicator connected' : 'wallet-status-indicator disconnected';
      }
      
      if (statusText) {
        statusText.textContent = connected ? 'Connected' : 'Disconnected';
      }
      
      if (walletAddressText && connected && accountId) {
        walletAddressText.textContent = `${accountId.substring(0, 8)}...${accountId.substring(accountId.length - 6)}`;
      } else if (walletAddressText) {
        walletAddressText.textContent = '';
      }

      // Update connect wallet buttons
      const connectButtons = document.querySelectorAll('.connectButton');
      connectButtons.forEach((btn) => {
        const buttonEl = btn as HTMLElement;
        if (connected) {
          // When connected, update button appearance and text
          buttonEl.classList.remove('walletDisconnected');
          buttonEl.classList.add('walletConnected');
          const walletText = buttonEl.querySelector('.walletText');
          if (walletText) {
            walletText.textContent = accountId ? `${accountId.substring(0, 4)}...${accountId.substring(accountId.length - 4)}` : 'Connected';
          }
        } else {
          // When disconnected, show connect button
          buttonEl.classList.remove('walletConnected');
          buttonEl.classList.add('walletDisconnected');
          buttonEl.style.display = 'flex';
          const walletText = buttonEl.querySelector('.walletText');
          if (walletText) {
            walletText.textContent = 'Connect Wallet';
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
