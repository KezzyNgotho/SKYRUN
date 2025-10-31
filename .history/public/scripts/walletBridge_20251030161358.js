// Bridge between old game.js and new React wallet
// This file provides compatibility for the existing game code

window.addEventListener('DOMContentLoaded', function() {
  console.log('Wallet bridge initialized');
  
  // Provide wallet status for game.js
  window.getWalletStatus = function() {
    // Try to get status from React wallet first
    if (window.reactWalletFunctions && window.reactWalletFunctions.getWalletStatus) {
      return window.reactWalletFunctions.getWalletStatus();
    }
    
    // Fallback to global wallet status
    if (window.getWalletStatus) {
      return window.getWalletStatus();
    }
    
    // Default fallback
    return {
      connected: false,
      address: null,
      balance: null
    };
  };

  // Provide contract call functions for game.js
  window.callStacksFinalize = async function(fnArgs) {
    console.log('callStacksFinalize called with:', fnArgs);
    
    // Check if wallet is connected
    const walletStatus = window.getWalletStatus();
    if (!walletStatus.connected) {
      console.error('Wallet not connected for finalizeGameScore');
      alert('Please connect your wallet first!');
      return Promise.reject(new Error('Wallet not connected'));
    }
    
    // Try to call React wallet function
    if (window.reactWalletFunctions && window.reactWalletFunctions.submitGameScore) {
      try {
        // Extract score from various sources
        let rawScore = 0;
        
        // Priority 1: Check window.currentGameScore (set by game.js)
        if (typeof window.currentGameScore !== 'undefined') {
          rawScore = window.currentGameScore;
        }
        // Priority 2: Extract from function arguments
        else if (fnArgs && fnArgs.length > 0) {
          rawScore = fnArgs[0]?.value || fnArgs[0] || 0;
        }
        // Priority 3: Fallback to window.score
        else if (typeof window.score !== 'undefined') {
          rawScore = window.score || 0;
        }
        
        // CRITICAL: Ensure score is a valid integer (no decimals)
        const score = Math.floor(Math.abs(Number(rawScore)));
        
        if (!Number.isFinite(score)) {
          throw new Error(`Invalid score value: ${rawScore}`);
        }
        
        console.log('🎮 Submitting score to blockchain:', score, '(from raw:', rawScore, ')');
        const result = await window.reactWalletFunctions.submitGameScore(score);
        console.log('✅ Score submitted successfully:', result);
        
        // Sync blockchain stats to UI after successful submission
        console.log('🔄 Syncing stats after score submission...');
        setTimeout(() => {
          if (window.syncBlockchainStats) {
            window.syncBlockchainStats();
          }
        }, 2000); // Wait 2 seconds for blockchain to process
        
        return result;
      } catch (error) {
        console.error('❌ Failed to submit score:', error);
        throw error;
      }
    }
    
    // Fallback
    console.warn('React wallet functions not available, using fallback');
    return Promise.resolve();
  };

  window.callStacksClaim = async function(fnArgs) {
    console.log('callStacksClaim called with:', fnArgs);
    
    // Check if wallet is connected
    const walletStatus = window.getWalletStatus();
    if (!walletStatus.connected) {
      console.error('Wallet not connected for claimLastRun');
      alert('Please connect your wallet first!');
      return Promise.reject(new Error('Wallet not connected'));
    }
    
    // Try to call React wallet function
    if (window.reactWalletFunctions && window.reactWalletFunctions.claimQuestReward) {
      try {
        // Extract quest ID from various sources
        let rawQuestId = 1; // Default quest
        
        // Priority 1: Check window.currentQuestId (set by game.js)
        if (typeof window.currentQuestId !== 'undefined') {
          rawQuestId = window.currentQuestId;
        }
        // Priority 2: Extract from function arguments
        else if (fnArgs && fnArgs.length > 0) {
          rawQuestId = fnArgs[0]?.value || fnArgs[0] || 1;
        }
        
        // Ensure questId is a valid integer
        const questId = Math.floor(Math.abs(Number(rawQuestId)));
        
        if (!Number.isFinite(questId)) {
          throw new Error(`Invalid quest ID: ${rawQuestId}`);
        }
        
        console.log('🏆 Claiming quest reward:', questId, '(from raw:', rawQuestId, ')');
        const result = await window.reactWalletFunctions.claimQuestReward(questId);
        console.log('✅ Reward claimed successfully:', result);
        return result;
      } catch (error) {
        console.error('❌ Failed to claim reward:', error);
        throw error;
      }
    }
    
    // Fallback
    console.warn('React wallet functions not available, using fallback');
    return Promise.resolve();
  };

  window.callStacksBuyLife = async function(fnArgs) {
    console.log('callStacksBuyLife called with:', fnArgs);
    
    // Check if wallet is connected
    const walletStatus = window.getWalletStatus();
    console.log('🔍 Wallet status check:', walletStatus);
    console.log('🔍 reactWalletFunctions available:', !!window.reactWalletFunctions);
    console.log('🔍 buyLifeLine function available:', !!window.reactWalletFunctions?.buyLifeLine);
    
    if (!walletStatus.connected) {
      console.error('Wallet not connected for buyLifeLine');
      console.error('walletStatus:', walletStatus);
      alert('Please connect your wallet first!');
      return Promise.reject(new Error('Wallet not connected'));
    }
    
    // Check token balance before attempting purchase
    if (window.reactWalletFunctions && window.reactWalletFunctions.getTokenBalance) {
      try {
        const balance = await window.reactWalletFunctions.getTokenBalance();
        console.log('🪙 Current token balance:', balance);
        console.log('🪙 Lifeline cost: 10 tokens');
        console.log('🪙 Can afford lifeline:', balance >= 10);
        
        if (balance < 10) {
          const needed = 10 - balance;
          const scoreNeeded = needed * 100;
          alert(`Not enough tokens!\n\nYou have: ${balance} tokens\nYou need: 10 tokens\n\n💡 Play the game and score ${scoreNeeded} more points to earn ${needed} more tokens!`);
          return Promise.reject(new Error('Insufficient tokens'));
        }
      } catch (error) {
        console.error('Failed to check token balance:', error);
        // Continue anyway - let the contract handle the check
      }
    }
    
    // Try to call React wallet function
    if (window.reactWalletFunctions && window.reactWalletFunctions.buyLifeLine) {
      try {
        const result = await window.reactWalletFunctions.buyLifeLine();
        console.log('Life purchased successfully:', result);
        
        // Sync blockchain stats to UI after successful purchase
        console.log('🔄 Syncing stats after lifeline purchase...');
        setTimeout(() => {
          if (window.syncBlockchainStats) {
            window.syncBlockchainStats();
          }
        }, 2000); // Wait 2 seconds for blockchain to process
        
        return result;
      } catch (error) {
        console.error('Failed to buy life:', error);
        
        // Provide helpful error message
        if (error.message && error.message.includes('CONTRACT_REVERT_EXECUTED')) {
          alert('Transaction reverted! This usually means:\n\n1. You don\'t have enough tokens (need 10)\n2. Play the game first to earn tokens\n3. Score 1000 points = 10 tokens');
        }
        
        throw error;
      }
    }
    
    // Fallback
    console.warn('React wallet functions not available, using fallback');
    return Promise.resolve();
  };

  // Sync blockchain stats to UI
  window.syncBlockchainStats = async function() {
    console.log('🔄 Syncing blockchain stats to UI...');
    
    if (!window.reactWalletFunctions) {
      console.warn('⚠️ Wallet functions not available yet');
      return;
    }
    
    const walletStatus = window.getWalletStatus();
    if (!walletStatus.connected) {
      console.warn('⚠️ Wallet not connected, cannot sync stats');
      return;
    }
    
    try {
      // Fetch ALL blockchain stats
      const stats = await window.reactWalletFunctions.getUserStats();
      
      console.log('📊 Blockchain Stats:');
      console.log('  🪙 Tokens:', stats.tokensEarned);
      console.log('  ❤️ Lives:', stats.availableLives);
      console.log('  🏆 High Score:', stats.highScore);
      console.log('  🎮 Games Played:', stats.totalGamesPlayed);
      console.log('  📊 Total Score:', stats.totalScore);
      console.log('  ⭐ Level:', stats.level);
      
      // Calculate spendable token balance (earned - spent on lifelines)
      const tokenBalance = stats.tokensEarned - (stats.lifelinesPurchased * 10);
      
      // Update UI elements - COINS/TOKENS
      if (typeof mainCoinBlock !== 'undefined' && mainCoinBlock) {
        mainCoinBlock.innerText = tokenBalance;
        console.log('✅ Updated mainCoinBlock with blockchain tokens');
      }
      
      // Update HIGH SCORE
      if (typeof highScoreBlock !== 'undefined' && highScoreBlock) {
        highScoreBlock.innerText = stats.highScore;
        console.log('✅ Updated highScoreBlock with blockchain high score');
      }
      
      // Update GAMES PLAYED
      const gamesPlayedElements = document.querySelectorAll('.gamesPlayedText, .gamesPlayedValue, #gamesPlayed, [data-stat="games-played"]');
      gamesPlayedElements.forEach(el => {
        el.textContent = stats.totalGamesPlayed;
      });
      if (gamesPlayedElements.length > 0) {
        console.log('✅ Updated games played with blockchain value');
      }
      
      // Update LEVEL (if there's a UI element for it)
      const levelElements = document.querySelectorAll('.levelValue, #playerLevel, [data-stat="level"]');
      levelElements.forEach(el => {
        el.textContent = stats.level;
      });
      
      // Update localStorage for backward compatibility
      localStorage.setItem('myCoins', tokenBalance);
      localStorage.setItem('HI', stats.highScore);
      
      // Update global variables
      if (typeof window.myCoins !== 'undefined') {
        window.myCoins = tokenBalance;
      }
      if (typeof window.highScore !== 'undefined') {
        window.highScore = stats.highScore;
      }
      
      // Update store coins text if visible
      if (typeof storeCoinsText !== 'undefined' && storeCoinsText) {
        storeCoinsText.innerText = tokenBalance;
      }
      
      // Show notification that stats were synced
      console.log('✅ Blockchain stats synced to UI!');
      
      return { 
        tokens: tokenBalance,
        tokensEarned: stats.tokensEarned,
        lives: stats.availableLives,
        highScore: stats.highScore,
        gamesPlayed: stats.totalGamesPlayed,
        totalScore: stats.totalScore,
        level: stats.level
      };
    } catch (error) {
      console.error('❌ Failed to sync blockchain stats:', error);
    }
  };

  // Helper function to check game tokens
  window.checkGameTokens = async function() {
    console.log('🔍 Checking game tokens...');
    
    if (!window.reactWalletFunctions) {
      console.error('❌ Wallet functions not available');
      return;
    }
    
    try {
      const balance = await window.reactWalletFunctions.getTokenBalance();
      const lives = await window.reactWalletFunctions.getAvailableLives();
      
      console.log('📍 Contract being queried: 0x3D047eFea4994106b4A7ad07746a23133c8D30DE (NEW FIXED CONTRACT)');
      console.log('🪙 Token Balance:', balance);
      console.log('❤️ Available Lives:', lives);
      console.log('💰 Lifeline Cost: 10 tokens');
      console.log('✅ Can Buy Lifeline:', balance >= 10);
      console.log('📊 Need to earn:', Math.max(0, 10 - balance), 'more tokens');
      console.log('🎮 Score needed:', Math.max(0, 10 - balance) * 100, 'points');
      
      const message = balance === 0 
        ? `🪙 Your Game Stats (NEW CONTRACT):\n\nTokens: ${balance}\nAvailable Lives: ${lives}\n\n⚠️ Balance is 0 because this is a NEW contract!\n\nYour old coins were on the OLD buggy contract.\nPlay the game again to earn tokens on the FIXED contract!\n\n📝 Contract: 0x3D047e...30DE`
        : `🪙 Your Game Stats:\n\nTokens: ${balance}\nAvailable Lives: ${lives}\nLifeline Cost: 10 tokens\n\n${balance >= 10 ? '✅ You can buy a lifeline!' : '❌ Play to earn ' + (10 - balance) + ' more tokens!'}`;
      
      alert(message);
      
      return { balance, lives };
    } catch (error) {
      console.error('❌ Failed to check tokens:', error);
    }
  };

  // Provide wallet connection function
  window.connectWallet = async function() {
    console.log('connectWallet called from game.js');
    
    if (window.reactWalletFunctions && window.reactWalletFunctions.connectWallet) {
      try {
        const result = await window.reactWalletFunctions.connectWallet();
        console.log('Wallet connection result:', result);
        return result;
      } catch (error) {
        console.error('Wallet connection failed:', error);
        throw error;
      }
    }
    
    console.warn('React wallet functions not available');
    return Promise.reject(new Error('Wallet functions not available'));
  };

  // Provide wallet disconnect function
  window.disconnectWallet = function() {
    console.log('disconnectWallet called from game.js');
    
    if (window.reactWalletFunctions && window.reactWalletFunctions.disconnectWallet) {
      window.reactWalletFunctions.disconnectWallet();
    } else {
      console.warn('React wallet functions not available');
    }
  };

  // Add wallet connection check helper
  window.checkWalletConnection = function() {
    const status = window.getWalletStatus();
    if (!status.connected) {
      console.warn('Wallet not connected!');
      alert('Please connect your wallet first to perform this action.');
      return false;
    }
    return true;
  };

  // Add wallet status display helper
  window.showWalletStatus = function() {
    const status = window.getWalletStatus();
    console.log('Wallet Status:', status);
    
    if (status.connected) {
      console.log(`✅ Wallet Connected: ${status.address}`);
      console.log(`💰 Balance: ${status.balance} STX`);
    } else {
      console.log('❌ Wallet Not Connected');
    }
    
    return status;
  };

  console.log('Wallet bridge functions registered');
});
