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
    if (!walletStatus.connected) {
      console.error('Wallet not connected for buyLifeLine');
      alert('Please connect your wallet first!');
      return Promise.reject(new Error('Wallet not connected'));
    }
    
    // Try to call React wallet function
    if (window.reactWalletFunctions && window.reactWalletFunctions.buyLifeLine) {
      try {
        const result = await window.reactWalletFunctions.buyLifeLine();
        console.log('Life purchased successfully:', result);
        return result;
      } catch (error) {
        console.error('Failed to buy life:', error);
        throw error;
      }
    }
    
    // Fallback
    console.warn('React wallet functions not available, using fallback');
    return Promise.resolve();
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
