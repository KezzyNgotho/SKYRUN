import React, { useState, useEffect } from 'react';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import { WalletStatus } from './components/WalletStatus';
import { SubmitScoreButton, ClaimRewardButton, BuyLifeButton } from './components/ContractCallButton';
import './App.css';

// Component to expose wallet functions globally (must be inside WalletProvider)
const WalletBridge: React.FC = () => {
  const wallet = useWallet();
  
  useEffect(() => {
    // Add safety check inside useEffect
    if (!wallet) {
      console.warn('Wallet context not available yet');
      return;
    }

    // Expose connectWallet function globally for HTML onclick
    window.connectWallet = async () => {
      try {
        await wallet.connectWallet();
      } catch (error) {
        console.error('Wallet connection failed:', error);
      }
    };

    // Expose wallet functions globally for game.js compatibility
    window.callStacksFinalize = async function(fnArgs: any[]) {
      if (!wallet.isConnected) {
        console.warn('Wallet not connected for finalizeGameScore');
        return;
      }
      
      try {
        const score = fnArgs[0]?.value || fnArgs[0] || 0;
        const contractId = wallet.getContractId('QuestReward');
        if (!contractId) {
          throw new Error('QuestReward contract not found');
        }
        
        const result = await wallet.callContract(contractId, 'submit-game-score', [score]);
        console.log('Score submitted successfully:', result);
        return result;
      } catch (error) {
        console.error('Failed to submit score:', error);
        throw error;
      }
    };

    window.callStacksClaim = async function(fnArgs: any[]) {
      if (!wallet.isConnected) {
        console.warn('Wallet not connected for claimLastRun');
        return;
      }
      
      try {
        const questId = fnArgs[0]?.value || fnArgs[0] || 1;
        const contractId = wallet.getContractId('QuestReward');
        if (!contractId) {
          throw new Error('QuestReward contract not found');
        }
        
        const result = await wallet.callContract(contractId, 'claim-quest-reward', [questId]);
        console.log('Reward claimed successfully:', result);
        return result;
      } catch (error) {
        console.error('Failed to claim reward:', error);
        throw error;
      }
    };

    window.callStacksBuyLife = async function() {
      if (!wallet.isConnected) {
        console.warn('Wallet not connected for buyLifeLine');
        return;
      }
      
      try {
        const contractId = wallet.getContractId('QuestReward');
        if (!contractId) {
          throw new Error('QuestReward contract not found');
        }
        
        const result = await wallet.callContract(contractId, 'buy-lifeline', []);
        console.log('Life purchased successfully:', result);
        return result;
      } catch (error) {
        console.error('Failed to buy life:', error);
        throw error;
      }
    };

    // Update wallet status for game.js
    window.getWalletStatus = function() {
      return {
        connected: wallet.isConnected,
        address: wallet.address,
        balance: wallet.stxBalance
      };
    };

    // Expose wallet instance for debugging
    window.wallet = wallet;
    
    // Expose React wallet functions for the bridge
    window.reactWalletFunctions = {
      connectWallet: async () => {
        try {
          await wallet.connectWallet();
          return { success: true };
        } catch (error) {
          console.error('Wallet connection failed:', error);
          return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
      },
      disconnectWallet: wallet.disconnectWallet,
      submitGameScore: async (score: number) => {
        if (!wallet.isConnected) {
          throw new Error('Wallet not connected');
        }
        
        const contractId = wallet.getContractId('QuestReward');
        if (!contractId) {
          throw new Error('QuestReward contract not found');
        }
        
        console.log('🎮 Submitting game score:', score);
        return await wallet.callContract(contractId, 'submit-game-score', [score]);
      },
      claimQuestReward: async (questId: number) => {
        if (!wallet.isConnected) {
          throw new Error('Wallet not connected');
        }
        
        const contractId = wallet.getContractId('QuestReward');
        if (!contractId) {
          throw new Error('QuestReward contract not found');
        }
        
        console.log('🏆 Claiming quest reward:', questId);
        return await wallet.callContract(contractId, 'claim-quest-reward', [questId]);
      },
      buyLifeLine: async () => {
        if (!wallet.isConnected) {
          throw new Error('Wallet not connected');
        }
        
        const contractId = wallet.getContractId('QuestReward');
        if (!contractId) {
          throw new Error('QuestReward contract not found');
        }
        
        console.log('💾 Buying lifeline...');
        return await wallet.callContract(contractId, 'buy-lifeline', []);
      },
      getWalletStatus: () => {
        return {
          connected: wallet.isConnected,
          address: wallet.address,
          balance: wallet.stxBalance
        };
      }
    };
    
    // Update UI based on wallet connection state
    const updateWalletUI = () => {
      const connectButton = document.querySelector('.connectButton');
      const walletArea = document.querySelector('#walletArea');
      
      if (wallet.isConnected && wallet.address) {
        // Hide the original connect button
        if (connectButton) {
          (connectButton as HTMLElement).style.display = 'none';
        }
        
        // Show wallet info
        if (walletArea) {
          walletArea.innerHTML = `
            <div class="walletConnected">
              <div class="walletInfo">
                <div class="walletAddress">${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}</div>
                <div class="walletBalance">${wallet.stxBalance ? wallet.stxBalance.toFixed(2) : '0.00'} STX</div>
              </div>
              <button class="disconnectButton" onclick="if(typeof window.disconnectWallet === 'function') { window.disconnectWallet(); }">
                Disconnect
              </button>
            </div>
          `;
        }
      } else {
        // Show the original connect button
        if (connectButton) {
          (connectButton as HTMLElement).style.display = 'flex';
        }
        
        // Reset wallet area
        if (walletArea) {
          walletArea.innerHTML = `
            <div class='connectButton walletDisconnected' onclick="if(typeof window.connectWallet === 'function') { window.connectWallet(); } else { console.log('Wallet not ready yet'); }">
              <img src="/assets/gui/achives.png" alt=""> 
              <span class="walletText">Connect Wallet</span>
              <span class="connectHint">(Stacks wallet required)</span>
            </div>
          `;
        }
      }
    };
    
    // Update UI when wallet state changes
    updateWalletUI();
    
    // Add global wallet status indicator
    const addGlobalWalletIndicator = () => {
      // Remove existing indicator if any
      const existingIndicator = document.getElementById('globalWalletIndicator');
      if (existingIndicator) {
        existingIndicator.remove();
      }
      
      // Create wallet status indicator
      const indicator = document.createElement('div');
      indicator.id = 'globalWalletIndicator';
      indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: ${wallet.isConnected ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'};
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        transition: all 0.3s ease;
      `;
      
      indicator.innerHTML = wallet.isConnected 
        ? `✅ Wallet Connected (${wallet.address?.slice(0, 6)}...)`
        : '❌ Wallet Disconnected';
      
      indicator.onclick = () => {
        if (wallet.isConnected) {
          window.showWalletStatus();
        } else {
          window.connectWallet();
        }
      };
      
      document.body.appendChild(indicator);
    };
    
    // Add the indicator
    addGlobalWalletIndicator();
    
    // Expose disconnect function globally
    window.disconnectWallet = wallet.disconnectWallet;
    
    // Expose debug function globally
    window.debugWalletDetection = () => {
      console.log('🔍 === WALLET DETECTION DEBUG ===');
      console.log('🔍 All window keys:', Object.keys(window));
      
      const walletRelatedKeys = Object.keys(window).filter(key => 
        key.toLowerCase().includes('xverse') || 
        key.toLowerCase().includes('stacks') ||
        key.toLowerCase().includes('btc') ||
        key.toLowerCase().includes('wallet')
      );
      
      console.log('🔍 Wallet-related keys:', walletRelatedKeys);
      
      walletRelatedKeys.forEach(key => {
        const obj = (window as any)[key];
        console.log(`🔍 window.${key}:`, obj);
        if (obj && typeof obj === 'object') {
          console.log(`🔍 window.${key} methods:`, Object.keys(obj));
        }
      });
      
      console.log('🔍 === END DEBUG ===');
    };
    
        // Expose contract testing function
        window.testContractIntegration = async () => {
          console.log('🧪 Testing contract integration...');

          if (!wallet.isConnected) {
            console.error('❌ Wallet not connected for contract test');
            alert('Please connect your wallet first!');
            return;
          }

          try {
            console.log('📋 Available contracts:', {
              GameTokenR: wallet.getContractId('GameTokenR'),
              QuestReward: wallet.getContractId('QuestReward'),
              PlayerProf: wallet.getContractId('PlayerProf')
            });

            // Test a simple contract call (if available)
            const contractId = wallet.getContractId('QuestReward');
            if (contractId) {
              console.log('✅ QuestReward contract found:', contractId);
              console.log('🎮 Ready for game actions:');
              console.log('  - Submit score: window.callStacksFinalize([score])');
              console.log('  - Claim reward: window.callStacksClaim([questId])');
              console.log('  - Buy life: window.callStacksBuyLife([])');

              // Test submit score with a small score
              try {
                console.log('🧪 Testing submit-game-score...');
                const result = await wallet.callContract(contractId, 'submit-game-score', [100]);
                console.log('✅ Submit score test successful:', result);
              } catch (error) {
                console.error('❌ Submit score test failed:', error);
              }
            } else {
              console.error('❌ QuestReward contract not found');
            }

          } catch (error) {
            console.error('❌ Contract test failed:', error);
          }
        };

        // Expose contract initialization function
        window.initializeContractIntegration = async () => {
          console.log('🔧 Initializing contract integration...');

          if (!wallet.isConnected) {
            console.error('❌ Wallet not connected for initialization');
            alert('Please connect your wallet first!');
            return;
          }

          try {
            const contractId = wallet.getContractId('QuestReward');
            if (contractId) {
              console.log('🔧 Initializing QuestReward contract with GameToken integration...');
              const result = await wallet.callContract(contractId, 'initialize-with-game-token', []);
              console.log('✅ Contract initialization successful:', result);
              alert('Contract integration initialized successfully!');
            } else {
              console.error('❌ QuestReward contract not found');
            }
          } catch (error) {
            console.error('❌ Contract initialization failed:', error);
            alert('Contract initialization failed. Check console for details.');
          }
        };

  }, [wallet]);

  return null; // This component doesn't render anything
};

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  const handlePlayClick = () => {
    setGameStarted(true);
  };

  const handleBackToMenu = () => {
    setGameStarted(false);
  };

  const handleScoreSubmit = (result: any) => {
    console.log('Score submitted successfully:', result);
    alert('Score submitted to blockchain!');
  };

  const handleRewardClaim = (result: any) => {
    console.log('Reward claimed successfully:', result);
    alert('Reward claimed from blockchain!');
  };

  const handleLifePurchase = (result: any) => {
    console.log('Life purchased successfully:', result);
    alert('Life purchased from blockchain!');
  };

  return (
    <WalletProvider>
      <WalletBridge />
      <div className="App">
        <div className="gameContainer">
          {!gameStarted ? (
            <div className="menu">
              <div className='menuButton' onClick={handlePlayClick}>
                <img src="/assets/gui/Play.png" alt="" />
                play
              </div>
              
              {/* Wallet button is handled by HTML onclick - React provides the function */}
              
              <div className='menuButton'>
                <img src="/assets/gui/achives.png" alt="" />
                achives
              </div>
              
              <div className='menuButton'>
                <img src="/assets/gui/store.png" alt="" />
                store
              </div>
              
              <div className='menuButton'>
                <img src="/assets/gui/info.png" alt="" />
                info
              </div>
            </div>
          ) : (
            <div className="gameWrapper">
              <button 
                className="backButton" 
                onClick={handleBackToMenu}
              >
                ← Back to Menu
              </button>
              
              <div className="gameCanvas">
                <canvas 
                  id="gameCanvas"
                  width="800" 
                  height="600"
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    display: 'block',
                    background: 'linear-gradient(180deg, #87CEEB 0%, #98FB98 100%)'
                  }}
                />
                
                {/* Game UI Overlay */}
                <div className="gameUI">
                  <div className="score" id="scoreDisplay">Score: 0</div>
                  <div className="coins" id="coinsDisplay">Coins: 0</div>
                  
                  {/* Wallet Status */}
                  <WalletStatus showDetails={false} />
                  
                  {/* Contract Interaction Buttons */}
                  <div className="contractControls">
                    <SubmitScoreButton 
                      score={0}
                      onSuccess={handleScoreSubmit}
                      className="contract-btn"
                    />
                    <ClaimRewardButton 
                      questId={1}
                      onSuccess={handleRewardClaim}
                      className="contract-btn"
                    />
                    <BuyLifeButton 
                      onSuccess={handleLifePurchase}
                      className="contract-btn"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
        
        {/* Debug Panel */}
        <div className="debugPanel">
          <button onClick={() => console.log('Debug info', window.wallet)}>
            Debug Logs
        </button>
        </div>
      </div>
    </WalletProvider>
  );
}

export default App;