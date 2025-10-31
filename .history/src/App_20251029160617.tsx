import React, { useEffect } from 'react';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import './App.css';
import { HederaActions } from './components/HederaActions';

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

    // Add debug function for wallet troubleshooting
    window.debugWallet = () => {
      const connectionStatus = wallet.checkWalletConnection();
      console.log('🔍 === COMPREHENSIVE WALLET DEBUG ===');
      console.log('🔍 Basic wallet state:', {
        isConnected: wallet.isConnected,
        address: wallet.address,
        stxBalance: wallet.stxBalance,
        isConnecting: wallet.isConnecting,
        error: wallet.error
      });
      console.log('🔍 Detailed connection status:', connectionStatus);
      console.log('🔍 Contract IDs:', {
        CoinQuestToken: wallet.getContractId('CoinQuestToken'),
        CoinQuestGame: wallet.getContractId('CoinQuestGame')
      });
      console.log('🔍 Available functions:', {
        callStacksBuyLife: typeof window.callStacksBuyLife,
        callStacksClaim: typeof window.callStacksClaim,
        callStacksFinalize: typeof window.callStacksFinalize,
        getWalletStatus: typeof window.getWalletStatus
      });
      console.log('🔍 Window wallet objects:', {
        xverse: !!(window as unknown as { xverse?: unknown }).xverse,
        LeatherProvider: !!(window as unknown as { LeatherProvider?: unknown }).LeatherProvider,
        StacksProvider: !!(window as unknown as { StacksProvider?: unknown }).StacksProvider
      });
      console.log('🔍 User session details:', {
        hasUserSession: !!wallet.userSession,
        isUserSignedIn: wallet.userSession?.isUserSignedIn?.(),
        userData: (wallet.userSession as unknown as { userData?: unknown })?.userData
      });
      
      // Test contract call readiness
      console.log('🔍 === CONTRACT CALL READINESS TEST ===');
      if (wallet.isConnected) {
        console.log('✅ Wallet appears connected');
        const contractId = wallet.getContractId('CoinQuestGame');
        if (contractId) {
          console.log('✅ CoinQuestGame contract ID found:', contractId);
        } else {
          console.log('❌ CoinQuestGame contract ID not found');
        }
      } else {
        console.log('❌ Wallet not connected');
      }
    };

    // Add a simple test function for debugging
    window.testContractCall = async function() {
      console.log('🧪 === TESTING CONTRACT CALL ===');
      
      if (!wallet.isConnected) {
        console.log('❌ Wallet not connected');
        return;
      }
      
      try {
        const contractId = wallet.getContractId('CoinQuestGame');
        console.log('📋 Contract ID:', contractId);
        
        // Test with a very simple function call
        console.log('🧪 Testing with submit_game_score (score: 100)...');
        const result = await wallet.callContract(contractId!, 'submit_game_score', [100]);
        console.log('✅ Test successful:', result);
        alert('✅ Test transaction successful!');
      } catch (error) {
        console.error('❌ Test failed:', error);
        alert(`❌ Test failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    // Add a simple wallet contract call function
    window.simpleContractCall = async function(contractId: string, functionName: string, functionArgs: unknown[]) {
      console.log('🔍 === SIMPLE CONTRACT CALL ===');
      console.log('🔍 Contract ID:', contractId);
      console.log('🔍 Function:', functionName);
      console.log('🔍 Args:', functionArgs);
      
      // Try Sats Connect first (proper way)
      try {
        console.log('🔍 Using Sats Connect for contract call...');
        const { request } = await import('sats-connect');
        
        console.log('🔍 Contract call parameters:', {
          contract: contractId,
          functionName,
          functionArgs,
          network: 'testnet'
        });
        
        const result = await request('stx_callContract', {
          contract: contractId,
          functionName,
          functionArgs: functionArgs as string[]
        });
        
        console.log('✅ Sats Connect contract call successful:', result);
        return result;
      } catch (error) {
        console.log('⚠️ Sats Connect contract call failed:', error);
        // Continue to try other methods
      }
      
      // Try Leather
      if ((window as unknown).LeatherProvider?.request) {
        console.log('🔍 Using Leather direct call...');
        console.log('🔍 Available Leather methods:', Object.keys((window as unknown).LeatherProvider));
        try {
          const contractAddress = contractId.split('.')[0];
          const contractName = contractId.split('.')[1];
          
          // Try the correct Leather method for contract calls
          console.log('🔍 Trying Leather contract call method...');
          const result = await (window as unknown).LeatherProvider.request({
            method: 'stx_callContract',
            params: {
              contractAddress,
              contractName,
              functionName,
              functionArgs,
              network: 'testnet'
            }
          });
          
          console.log('✅ Leather contract call successful:', result);
          return result;
        } catch (error) {
          console.error('❌ Leather contract call failed:', error);
        throw error;
        }
      }
      
      throw new Error('No compatible wallet found for contract calls');
    };

    // Add wallet settings function
    window.openWalletSettings = () => {
      if (wallet.isConnected) {
        // Show wallet info modal or redirect to wallet management
        alert(`Wallet Connected!\nAddress: ${wallet.address}\nBalance: ${wallet.stxBalance?.toFixed(2) || '0.00'} STX`);
      } else {
        // Open wallet connection
        window.connectWallet();
      }
    };

    // Expose Stacks transactions functions globally for game.js compatibility
    (async () => {
      try {
        const { uintCV, stringUtf8CV, boolCV } = await import('@stacks/transactions');
        window.StacksTransactions = {
          uintCV,
          stringUtf8CV,
          boolCV
        };
        console.log('✅ StacksTransactions functions exposed globally');
      } catch (error) {
        console.warn('⚠️ Failed to expose StacksTransactions functions:', error);
      }
    })();

    // Contract functions are now defined outside React context to avoid serialization issues

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
    
    // React wallet functions removed - using standalone functions instead to avoid serialization issues
    
    // Update UI based on wallet connection state
    const updateWalletUI = () => {
      const connectButton = document.querySelector('.connectButton');
      const walletArea = document.querySelector('#walletArea');
      
      // Update settings panel wallet status
      const walletStatusText = document.getElementById('walletStatusText');
      const walletStatus = document.getElementById('walletStatus');
      
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
        
        // Update settings panel wallet status
        if (walletStatusText) {
          walletStatusText.textContent = `Connected: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
        }
        if (walletStatus) {
          walletStatus.textContent = 'Connected';
          walletStatus.className = 'walletStatus connected';
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
        
        // Update settings panel wallet status
        if (walletStatusText) {
          walletStatusText.textContent = 'Not connected';
        }
        if (walletStatus) {
          walletStatus.textContent = 'Not Connected';
          walletStatus.className = 'walletStatus disconnected';
        }
      }
    };
    
    // Update UI when wallet state changes
    updateWalletUI();
    
    // Add wallet state change listener
    const handleWalletStateChange = () => {
      console.log('🔄 Wallet state changed:', {
        isConnected: wallet.isConnected,
        address: wallet.address,
        balance: wallet.stxBalance
      });
      updateWalletUI();
    };
    
    // Listen for wallet state changes
    const intervalId = setInterval(handleWalletStateChange, 1000);
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
    
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

    // Expose core game functions for HTML onclick handlers
    window.PlayButtonActivate = () => {
      console.log('🎮 PlayButtonActivate called from HTML');
      // This will be handled by the React component's handlePlayClick
      const playButton = document.querySelector('.menuButton');
      if (playButton) {
        (playButton as HTMLElement).click();
      }
    };

    // buyLifeLine is defined in game.js and exposed globally there

    // claimLastRun is defined in game.js and exposed globally there

    // finalizeGameScore is defined in game.js and exposed globally there

    window.Replay = () => {
      console.log('🔄 Replay called from HTML');
      // Restart the game
      window.location.reload();
    };

    window.GoToHome = () => {
      console.log('🏠 GoToHome called from HTML');
      // Go back to main menu
      const homeButton = document.querySelector('.homeButton');
      if (homeButton) {
        (homeButton as HTMLElement).click();
      }
    };

    window.PauseToggle = () => {
      console.log('⏸️ PauseToggle called from HTML');
      // Toggle pause state
      const pauseButton = document.querySelector('.pauseButton');
      if (pauseButton) {
        (pauseButton as HTMLElement).click();
      }
    };
    
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
        const obj = (window as unknown)[key];
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
              CoinQuestToken: wallet.getContractId('CoinQuestToken'),
              CoinQuestGame: wallet.getContractId('CoinQuestGame')
            });

            // Test a simple contract call (if available)
            const contractId = wallet.getContractId('CoinQuestGame');
            if (contractId) {
              console.log('✅ CoinQuestGame contract found:', contractId);
              console.log('🎮 Ready for game actions:');
              console.log('  - Submit score: window.callStacksFinalize()');
              console.log('  - Claim reward: window.callStacksClaim()');
              console.log('  - Buy life: window.callStacksBuyLife()');

              // Test submit score with a small score
              try {
        const contractId = wallet.getContractId('CoinQuestGame');
        if (!contractId) {
          console.log('❌ Contract ID not found');
          return;
        }
        
                console.log('🧪 Testing submit-game-score...');
        const result = await wallet.callContract(contractId, 'submit_game_score', [100]);
                console.log('✅ Submit score test successful:', result);
              } catch (error) {
                console.error('❌ Submit score test failed:', error);
              }
            } else {
              console.error('❌ CoinQuestGame contract not found');
            }

          } catch (error) {
            console.error('❌ Contract test failed:', error);
          }
        };

        // Simple test to see if wallet is ready for any calls
        window.testWalletReadiness = async () => {
          console.log('🧪 === TESTING WALLET READINESS ===');
          
          if (!wallet.isConnected) {
            console.log('❌ Wallet not connected');
            return;
          }

          console.log('🔍 Wallet state:', {
            isConnected: wallet.isConnected,
            address: wallet.address,
            stxBalance: wallet.stxBalance
          });

          console.log('🔍 Available wallet objects:', {
            xverse: !!(window as unknown).xverse,
            LeatherProvider: !!(window as unknown).LeatherProvider,
            StacksProvider: !!(window as unknown).StacksProvider
          });

          if ((window as unknown).xverse) {
            console.log('🔍 Xverse methods:', Object.keys((window as unknown).xverse));
            
            // Test if we can make any request at all
            try {
              console.log('🧪 Testing basic Sats Connect request...');
              const { request } = await import('sats-connect');
              const result = await request('getAccounts', { purposes: ['payment' as unknown, 'ordinals' as unknown] });
              console.log('✅ Basic Sats Connect request successful:', result);
            } catch (error) {
              console.log('❌ Basic Sats Connect request failed:', error);
            }
          }

          // Test our contract call
          try {
            console.log('🧪 Testing contract call...');
            const contractId = wallet.getContractId('CoinQuestGame');
            if (!contractId) {
              console.log('❌ Contract ID not found');
              return;
            }
            
            const result = await wallet.callContract(
              contractId,
              'buy_lifeline',
              []
            );
            console.log('✅ Contract call successful:', result);
          } catch (error) {
            console.log('❌ Contract call failed:', error);
          }
        };

        // Test with exact format from your example
        window.testExactFormat = async () => {
          console.log('🧪 === TESTING EXACT FORMAT ===');
          
          if (!wallet.isConnected) {
            console.log('❌ Wallet not connected');
            return;
          }

          try {
            // First test: Try a read-only function (no transaction needed)
            console.log('🧪 Testing read-only function first...');
            const { request } = await import('sats-connect');
            const readResult = await request("stx_callReadOnlyFunction" as unknown, {
              contract: `${wallet.getContractId('CoinQuestGame')}`,
              functionName: "get_total_quests",
              functionArgs: []
            });
            console.log('✅ Read-only function successful:', readResult);
            
            // Second test: Try the actual contract call
            console.log('🧪 Testing contract call...');
            
            // Try different network formats
            const networkFormats = ['testnet', 'Testnet', 'testnet.stacks.co'];
            
            for (const network of networkFormats) {
              try {
                console.log(`🧪 Trying network format: ${network}`);
                const result = await request("stx_callContract", {
                  contract: `${wallet.getContractId('CoinQuestGame')}`,
                  functionName: "buy_lifeline",
                  functionArgs: []
                });
                
                console.log(`✅ Contract call successful with network: ${network}`, result);
                return result;
              } catch (error) {
                console.log(`⚠️ Failed with network ${network}:`, error instanceof Error ? error.message : String(error));
                if (network === networkFormats[networkFormats.length - 1]) {
                  throw error; // Re-throw the last error
                }
              }
            }
          } catch (error) {
            console.error('❌ Exact format test failed:', error);
            console.error('❌ Error details:', {
              message: error instanceof Error ? error.message : String(error),
              code: (error as unknown)?.code,
              data: (error as unknown)?.data,
              stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
          }
        };

        // Test simple contract call without Stacks Connect
        window.testSimpleContractCall = async () => {
          console.log('🧪 === TESTING SIMPLE CONTRACT CALL ===');
          
          if (!wallet.isConnected) {
            console.log('❌ Wallet not connected');
            return;
          }

          try {
            // Try direct wallet call first
            if ((window as unknown).xverse?.request) {
              console.log('🔍 Trying direct Xverse call...');
              try {
                const result = await (window as unknown).xverse.request({
                  method: 'stx_callContract',
                  params: {
                    contractAddress: 'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1',
                    contractName: 'CoinQuestGame',
                    functionName: 'buy_lifeline',
                    functionArgs: [],
                    network: 'testnet'
                  }
                });
                console.log('✅ Direct Xverse call successful:', result);
                return result;
              } catch (error) {
                console.log('⚠️ Direct Xverse call failed:', error);
              }
            }

            // Try through React wallet system
            console.log('🔍 Trying React wallet system...');
            const contractId = wallet.getContractId('CoinQuestGame');
            if (contractId) {
              const result = await wallet.callContract(contractId, 'buy_lifeline', []);
              console.log('✅ React wallet call successful:', result);
              return result;
            }
          } catch (error) {
            console.error('❌ Simple contract call failed:', error);
          }
        };

        // Test contract initialization and readiness
        window.testContractInitialization = async () => {
          console.log('🧪 === TESTING CONTRACT INITIALIZATION ===');
          
          if (!wallet.isConnected) {
            console.log('❌ Wallet not connected for contract test');
            return;
          }

          try {
            console.log('📋 Available contracts:', {
              CoinQuestToken: wallet.getContractId('CoinQuestToken'),
              CoinQuestGame: wallet.getContractId('CoinQuestGame')
            });

            // Test a simple contract call (if available)
            const contractId = wallet.getContractId('CoinQuestGame');
            if (contractId) {
              console.log('✅ CoinQuestGame contract found:', contractId);
              console.log('🎮 Ready for game actions:');
              console.log('  - Submit Score: wallet.callContract(contractId, "submit_game_score", [score])');
              console.log('  - Claim Reward: wallet.callContract(contractId, "claim_quest_reward", [questId])');
              console.log('  - Buy Life: wallet.callContract(contractId, "buy_lifeline", [])');
            } else {
              console.log('❌ CoinQuestGame contract not found');
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
            const contractId = wallet.getContractId('CoinQuestGame');
            if (contractId) {
              console.log('🔧 Initializing CoinQuestGame contract with CoinQuestToken integration...');
              const result = await wallet.callContract(contractId, 'initialize_with_game_token', []);
              console.log('✅ Contract initialization successful:', result);
              alert('Contract integration initialized successfully!');
            } else {
              console.error('❌ CoinQuestGame contract not found');
            }
          } catch (error) {
            console.error('❌ Contract initialization failed:', error);
            alert('Contract initialization failed. Check console for details.');
          }
        };

  }, [wallet.isConnected, wallet.address, wallet.stxBalance]);

  return null; // This component doesn't render anything
};

// Standalone functions outside React context to avoid serialization issues
const createStandaloneContractFunctions = () => {
  // Submit game score function
  window.callStacksFinalize = async function() {
    console.log('📊 === SUBMIT SCORE DEBUG (STANDALONE) ===');
    console.log('📊 Function source: STANDALONE (no React context)');
    
    try {
      // Get score from global variable
      let score: number;
      
      if (window.currentGameScore !== undefined) {
        score = Number(window.currentGameScore);
        console.log('📊 Score from global variable:', score, typeof score);
      } else {
        score = 100; // Default fallback
        console.log('📊 Using default score:', score);
      }
      
      console.log('📊 Score extracted:', score);
      
      // Try direct wallet call first
      try {
        console.log('🔍 Attempting direct wallet call...');
        const { request } = await import('sats-connect');
        
        console.log('🔍 Contract call parameters:', {
          contract: 'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.CoinQuestGame',
          functionName: 'submit_game_score',
          functionArgs: [String(score)],
          functionArgsTypes: [typeof score],
          network: 'testnet'
        });
        
        const result = await request('stx_callContract', {
          contract: 'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.CoinQuestGame',
          functionName: 'submit_game_score',
          functionArgs: [String(score)]
        });
        
        console.log('✅ Direct wallet call successful:', result);
        
        // Check if the result indicates success
        if (result && result.status === 'success') {
          alert(`🎉 SUCCESS! Score submitted successfully!\n\n📊 Score: ${score} points\n💰 You earned tokens for your achievement!\n\nTransaction ID: ${(result as unknown).txId || (result as unknown).result?.txid || 'N/A'}`);
        } else if (result && (result as unknown).txId) {
          alert(`✅ Score submitted successfully!\n\n📊 Score: ${score} points\n💰 You earned tokens for your achievement!\n\nTransaction ID: ${(result as unknown).txId}`);
        } else {
          alert(`✅ Score submitted successfully!\n\n📊 Score: ${score} points\n💰 You earned tokens for your achievement!`);
        }
        
        return result;
      } catch (directError) {
        console.log('⚠️ Direct wallet call failed:', directError);
        alert(`❌ Failed to submit score: ${directError instanceof Error ? directError.message : String(directError)}`);
        throw directError;
      }
    } catch (error) {
      console.error('❌ Failed to submit score:', error);
      if (error instanceof Error && error.message === 'User canceled transaction') {
        alert('❌ Transaction canceled. Your score was not saved.');
      } else {
        alert(`❌ Failed to submit score: ${error instanceof Error ? error.message : String(error)}`);
      }
      throw error;
    }
  };

  // Claim quest reward function
  window.callStacksClaim = async function() {
    console.log('🎁 === CLAIM REWARD DEBUG (STANDALONE) ===');
    console.log('🎁 Function source: STANDALONE (no React context)');
    
    try {
      // Get quest ID from global variable
      let questId: number;
      
      if (window.currentQuestId !== undefined) {
        questId = Number(window.currentQuestId);
        console.log('🎁 Quest ID from global variable:', questId, typeof questId);
      } else {
        questId = 1; // Default fallback
        console.log('🎁 Using default quest ID:', questId);
      }
      
      console.log('🎁 Quest ID extracted:', questId);
      
      // Try direct wallet call first
      try {
        console.log('🔍 Attempting direct wallet call...');
        const { request } = await import('sats-connect');
        
        const result = await request('stx_callContract', {
          contract: 'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.CoinQuestGame',
          functionName: 'claim_quest_reward',
          functionArgs: [String(questId)]
        });
        
        console.log('✅ Direct wallet call successful:', result);
        
        // Check if the result indicates success
        if (result && result.status === 'success') {
          alert(`🎉 SUCCESS! Quest reward claimed!\n\n🏆 Quest ID: ${questId}\n💰 Reward tokens added to your balance!\n\nTransaction ID: ${(result as unknown).txId || (result as unknown).result?.txid || 'N/A'}`);
        } else if (result && (result as unknown).txId) {
          alert(`✅ Quest reward claimed successfully!\n\n🏆 Quest ID: ${questId}\n💰 Reward tokens added to your balance!\n\nTransaction ID: ${(result as unknown).txId}`);
        } else {
          alert(`✅ Quest reward claimed successfully!\n\n🏆 Quest ID: ${questId}\n💰 Reward tokens added to your balance!`);
        }
        
        return result;
      } catch (directError) {
        console.log('⚠️ Direct wallet call failed:', directError);
        alert(`❌ Failed to claim reward: ${directError instanceof Error ? directError.message : String(directError)}`);
        throw directError;
      }
    } catch (error) {
      console.error('❌ Failed to claim reward:', error);
      if (error instanceof Error && error.message === 'User canceled transaction') {
        alert('❌ Transaction canceled. Your reward was not claimed.');
      } else {
        alert(`❌ Failed to claim reward: ${error instanceof Error ? error.message : String(error)}`);
      }
      throw error;
    }
  };

  // Buy lifeline function
  window.callStacksBuyLife = async function() {
    console.log('🔍 === BUY LIFE DEBUG (STANDALONE) ===');
    console.log('🔍 Function source: STANDALONE (no React context)');
    
    try {
      // Try direct wallet call first
      try {
        console.log('🔍 Attempting direct wallet call...');
        const { request } = await import('sats-connect');
        
        const result = await request('stx_callContract', {
          contract: 'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.CoinQuestGame',
          functionName: 'buy_lifeline',
          functionArgs: []
        });
        
        console.log('✅ Direct wallet call successful:', result);
        
        // Check if the result indicates success
        if (result && result.status === 'success') {
          alert(`🎉 SUCCESS! Lifeline purchased!\n\n💊 Extra life added to your game!\n💰 Cost: 10 COINQ tokens\n\nTransaction ID: ${(result as unknown).txId || (result as unknown).result?.txid || 'N/A'}`);
        } else if (result && (result as unknown).txId) {
          alert(`✅ Lifeline purchased successfully!\n\n💊 Extra life added to your game!\n💰 Cost: 10 COINQ tokens\n\nTransaction ID: ${(result as unknown).txId}`);
        } else {
          alert(`✅ Lifeline purchased successfully!\n\n💊 Extra life added to your game!\n💰 Cost: 10 COINQ tokens`);
        }
        
        return result;
      } catch (directError) {
        console.log('⚠️ Direct wallet call failed:', directError);
        alert(`❌ Failed to buy lifeline: ${directError instanceof Error ? directError.message : String(directError)}`);
        throw directError;
      }
    } catch (error) {
      console.error('❌ Failed to buy lifeline:', error);
      if (error instanceof Error && error.message === 'User canceled transaction') {
        alert('❌ Transaction canceled. Your lifeline was not purchased.');
      } else {
        alert(`❌ Failed to buy lifeline: ${error instanceof Error ? error.message : String(error)}`);
      }
      throw error;
    }
  };
};

// Call the function to create standalone functions
createStandaloneContractFunctions();

// Debug: Verify functions are created
console.log('🔍 === STANDALONE FUNCTIONS CREATED ===');
console.log('🔍 callStacksFinalize:', typeof window.callStacksFinalize);
console.log('🔍 callStacksClaim:', typeof window.callStacksClaim);
console.log('🔍 callStacksBuyLife:', typeof window.callStacksBuyLife);

// Debug: Check game functions after a delay to see if they're overridden
setTimeout(() => {
  console.log('🔍 === GAME FUNCTIONS CHECK (after 2 seconds) ===');
  console.log('🔍 finalizeGameScore:', typeof window.finalizeGameScore);
  console.log('🔍 claimLastRun:', typeof window.claimLastRun);
  console.log('🔍 buyLifeLine:', typeof window.buyLifeLine);
  
  if (typeof window.finalizeGameScore === 'function') {
    console.log('🔍 finalizeGameScore source:', window.finalizeGameScore.toString().substring(0, 100) + '...');
  }
}, 2000);

function App() {
  // Game state removed - all functionality handled by main game.js

  // Debug logging
  useEffect(() => {
    console.log('🚀 App component mounted');
  }, []);

  // Unused handler functions removed to fix build errors

  return (
    <WalletProvider>
      <WalletBridge />
      <div className="App">
        {/* All game functionality handled by main game.js - no React UI needed */}
          <HederaActions />
      </div>
    </WalletProvider>
  );
}

export default App;