/**
 * UI Enhancements Demo Script
 * Demonstrates the effectiveness of our gaming UI improvements
 */

// Loading Screen Progress Simulation
function simulateLoadingProgress() {
  // Mark that loading has started
  window.loadingStarted = true;
  
  console.log('🎮 Starting loading simulation...');
  
  const progressBar = document.getElementById('loaderProgressBar');
  const percentage = document.getElementById('loaderPercentage');
  const status = document.getElementById('loaderStatus');
  
  if (!progressBar || !percentage || !status) {
    console.error('❌ Loading elements not found, falling back to direct menu show');
    // Immediate fallback if loading elements don't exist
    const mainMenuElement = document.querySelector('.mainMenu');
    const loaderElement = document.querySelector('.loader');
    
    if (mainMenuElement) {
      mainMenuElement.classList.remove('hide');
      console.log('✅ Main menu shown via immediate fallback');
    }
    if (loaderElement) {
      loaderElement.style.display = 'none';
      console.log('✅ Loader hidden via immediate fallback');
    }
    return;
  }
  
  const loadingSteps = [
    { progress: 10, status: 'Loading game assets...', delay: 1500 },
    { progress: 20, status: 'Initializing graphics engine...', delay: 2000 },
    { progress: 35, status: 'Setting up audio system...', delay: 1500 },
    { progress: 50, status: 'Connecting to blockchain...', delay: 2000 },
    { progress: 65, status: 'Loading game sprites...', delay: 1500 },
    { progress: 80, status: 'Initializing particle system...', delay: 1500 },
    { progress: 90, status: 'Setting up power-ups...', delay: 1000 },
    { progress: 95, status: 'Finalizing setup...', delay: 1000 },
    { progress: 100, status: 'Ready to play!', delay: 1000 }
  ];
  
  let currentStep = 0;
  
  const updateProgress = () => {
    if (currentStep < loadingSteps.length) {
      const step = loadingSteps[currentStep];
      
      // Smooth progress bar animation
      progressBar.style.transition = 'width 1.5s ease-out';
      progressBar.style.width = step.progress + '%';
      
      // Animate percentage counter
      animateCounter(percentage, step.progress);
      
      // Update status with typing effect
      typeText(status, step.status);
      
      currentStep++;
      
      // Wait for the step delay before next update
      setTimeout(updateProgress, step.delay);
    } else {
      // Hide loader immediately after "Ready to play!" and initialize game quickly
      setTimeout(() => {
        const loader = document.querySelector('.loader');
        if (loader) {
          loader.style.transition = 'opacity 2s ease-out';
          loader.style.opacity = '0';
          setTimeout(() => {
            loader.style.display = 'none';
            // Initialize the actual game after our slow loading is complete
            initializeActualGame();
          }, 2000);
        }
      }, 1000); // Only wait 1 second after "Ready to play!"
    }
  };
  
  updateProgress();
}

// Animate counter from current to target value
function animateCounter(element, target) {
  const start = parseInt(element.textContent) || 0;
  const duration = 1000; // 1 second for faster loading
  const startTime = performance.now();
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * easeOut);
    
    element.textContent = current + '%';
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
}

// Initialize the actual game after our slow loading is complete
function initializeActualGame() {
  console.log('🎮 Initializing actual game...');
  
  // Don't add another window load listener - just run the initialization directly
  // since we're already called after the loader completes
  
  // Wait a bit to ensure all sprites are fully loaded
  setTimeout(() => {
    console.log('🎮 Starting game initialization after delay...');
    
    // Check if page is muted
    if (typeof pageMuted !== 'undefined' && pageMuted) {
      if (typeof autoMute === 'function') {
        autoMute();
      }
    }
    
    // Handle touch devices
    if (( 'ontouchstart' in window ) ||
    ( navigator.maxTouchPoints > 0 ) ||
    ( navigator.msMaxTouchPoints > 0 )){
      if (typeof rightButtonsBlock !== 'undefined') {
        rightButtonsBlock.classList.remove('hide');
      }
      if (typeof leftButtonsBlock !== 'undefined') {
        leftButtonsBlock.classList.remove('hide');
      }
    }
    
    // Set background images
    if (typeof mainBgBlocks !== 'undefined') {
      for (var i = 0; i < mainBgBlocks.length; i += 1){
        mainBgBlocks[i].style.backgroundImage = 'stuff/bg.png';
      }
    }
    if (typeof smallBtnBlocks !== 'undefined') {
      for (var i = 0; i < smallBtnBlocks.length; i += 1){
        smallBtnBlocks[i].style.backgroundImage = 'stuff/bg.png';
      }
    }
    
    // Hide/show appropriate blocks - explicitly show main menu and hide loader
    console.log('🎮 Setting up UI visibility...');
    
    if (typeof mainMenuBlock !== 'undefined') {
      mainMenuBlock.classList.remove('hide');
      console.log('✅ Main menu shown via mainMenuBlock');
    } else {
      // Fallback: directly access the main menu element
      const mainMenuElement = document.querySelector('.mainMenu');
      if (mainMenuElement) {
        mainMenuElement.classList.remove('hide');
        console.log('✅ Main menu shown via direct DOM access');
      } else {
        console.error('❌ Main menu element not found!');
      }
    }
    
    if (typeof loaderBlock !== 'undefined') {
      loaderBlock.classList.add('hide');
      console.log('✅ Loader hidden via loaderBlock');
    } else {
      // Fallback: directly hide the loader
      const loaderElement = document.querySelector('.loader');
      if (loaderElement) {
        loaderElement.style.display = 'none';
        console.log('✅ Loader hidden via direct DOM access');
      } else {
        console.error('❌ Loader element not found!');
      }
    }
    
    if (typeof controlBlock !== 'undefined') {
      controlBlock.classList.add('hide');
      console.log('✅ Control block hidden');
    }
    
    // Set background ratio - with better error handling
    if (typeof bgSprites !== 'undefined' && bgSprites && bgSprites[0] && bgSprites[0].naturalWidth > 0) {
      bgRatio = bgSprites[0].naturalWidth / bgSprites[0].naturalHeight;
      console.log('Background sprites ready, bgRatio set to:', bgRatio);
    } else {
      console.log('Background sprites not ready, deferring background initialization');
      // Retry after a short delay
      setTimeout(() => {
        if (typeof bgSprites !== 'undefined' && bgSprites && bgSprites[0] && bgSprites[0].naturalWidth > 0) {
          bgRatio = bgSprites[0].naturalWidth / bgSprites[0].naturalHeight;
          console.log('Background sprites ready on retry, bgRatio set to:', bgRatio);
        }
      }, 500);
    }
    
    // Initialize game components
    if (typeof initializeGameComponents === 'function') {
      initializeGameComponents();
    }
    
    // Start the game
    if (typeof gameInit === 'function') {
      gameInit();
    }
  }, 1000); // Wait 1 second to ensure sprites are loaded
}

// Type text effect for status messages
function typeText(element, text) {
  element.textContent = '';
  let index = 0;
  
  const typeInterval = setInterval(() => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(typeInterval);
    }
  }, 50); // Faster typing speed - 50ms per character
}

// Wallet Status Management
function updateWalletStatus(status) {
  const indicator = document.getElementById('walletStatusIndicator');
  const text = document.getElementById('walletStatusText');
  const address = document.getElementById('walletAddress');
  const addressText = document.getElementById('walletAddressText');
  
  if (!indicator || !text) return;
  
  // Remove existing status classes
  indicator.classList.remove('connected', 'disconnected', 'connecting');
  
  switch (status) {
    case 'connected':
      indicator.classList.add('connected');
      text.textContent = 'Connected';
      if (address && addressText) {
        addressText.textContent = 'ST1ABC...XYZ123';
        address.classList.add('show');
      }
      break;
    case 'connecting':
      indicator.classList.add('connecting');
      text.textContent = 'Connecting...';
      break;
    case 'disconnected':
    default:
      indicator.classList.add('disconnected');
      text.textContent = 'Disconnected';
      if (address) address.classList.remove('show');
      break;
  }
}

// Transaction Feedback System
function showTransactionFeedback(type, message, details = '') {
  const feedback = document.getElementById('transactionFeedback');
  const text = document.getElementById('transactionFeedbackText');
  const detailsEl = document.getElementById('transactionFeedbackDetails');
  
  if (!feedback || !text) return;
  
  // Remove existing classes
  feedback.classList.remove('success', 'error', 'show');
  
  // Add new classes
  feedback.classList.add(type, 'show');
  text.textContent = message;
  if (detailsEl) detailsEl.textContent = details;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    feedback.classList.remove('show');
  }, 3000);
}

// Score and Coin Animation Triggers
function triggerScoreIncrease(amount) {
  const scoreElement = document.querySelector('.score');
  if (!scoreElement) return;
  
  // Add animation class
  scoreElement.classList.add('score-increase');
  
  // Create floating text
  createFloatingText(`+${amount}`, 'score-increase');
  
  // Remove animation class after animation completes
  setTimeout(() => {
    scoreElement.classList.remove('score-increase');
  }, 600);
}

function triggerCoinCollection(amount) {
  const coinsElement = document.querySelector('.coins');
  if (!coinsElement) return;
  
  // Add animation class
  coinsElement.classList.add('coin-collected');
  
  // Create floating text
  createFloatingText(`+${amount}`, 'coin-collected');
  
  // Remove animation class after animation completes
  setTimeout(() => {
    coinsElement.classList.remove('coin-collected');
  }, 800);
}

// Floating Text Creation
function createFloatingText(text, type = '') {
  const floatingText = document.createElement('div');
  floatingText.className = `floating-text ${type}`;
  floatingText.textContent = text;
  
  // Position randomly around the center
  const x = Math.random() * 200 - 100;
  const y = Math.random() * 100 - 50;
  floatingText.style.left = `calc(50% + ${x}px)`;
  floatingText.style.top = `calc(50% + ${y}px)`;
  
  document.body.appendChild(floatingText);
  
  // Remove after animation
  setTimeout(() => {
    if (floatingText.parentNode) {
      floatingText.parentNode.removeChild(floatingText);
    }
  }, 1500);
}

// Combo Display Management
function updateComboDisplay(combo) {
  let comboElement = document.querySelector('.combo-display');
  
  if (!comboElement) {
    comboElement = document.createElement('div');
    comboElement.className = 'combo-display';
    document.querySelector('.wrapper').appendChild(comboElement);
  }
  
  if (combo > 1) {
    comboElement.textContent = `${combo}x Combo!`;
    comboElement.classList.add('active');
  } else {
    comboElement.classList.remove('active');
  }
}

// Power-up Indicator Management
function updatePowerUpIndicator(powerUp) {
  let indicatorElement = document.querySelector('.powerup-indicator');
  
  if (!indicatorElement) {
    indicatorElement = document.createElement('div');
    indicatorElement.className = 'powerup-indicator';
    document.querySelector('.wrapper').appendChild(indicatorElement);
  }
  
  if (powerUp) {
    indicatorElement.textContent = `${powerUp} Active!`;
    indicatorElement.classList.add('active');
  } else {
    indicatorElement.classList.remove('active');
  }
}

// Mobile Control Feedback
function addMobileControlFeedback(buttonElement, type = 'success') {
  if (!buttonElement) return;
  
  buttonElement.classList.add(type);
  
  setTimeout(() => {
    buttonElement.classList.remove(type);
  }, 600);
}

// Pause Button State Management
function updatePauseButtonState(isPaused) {
  const pauseButton = document.querySelector('.pauseButton');
  if (!pauseButton) return;
  
  if (isPaused) {
    pauseButton.classList.add('paused');
  } else {
    pauseButton.classList.remove('paused');
  }
}

// Demo Functions for Testing
window.demoUIEnhancements = {
  simulateLoading: simulateLoadingProgress,
  updateWallet: updateWalletStatus,
  showFeedback: showTransactionFeedback,
  triggerScore: triggerScoreIncrease,
  triggerCoins: triggerCoinCollection,
  updateCombo: updateComboDisplay,
  updatePowerUp: updatePowerUpIndicator,
  mobileFeedback: addMobileControlFeedback,
  updatePause: updatePauseButtonState
};

// Auto-start loading simulation when DOM is ready (only if not triggered by loader)
document.addEventListener('DOMContentLoaded', () => {
  // Only start if the loader hasn't already triggered it
  setTimeout(() => {
    if (!window.loadingStarted) {
      simulateLoadingProgress();
    }
  }, 2000);
  
  // Demo wallet connection after loading completes (about 2.5 minutes)
  setTimeout(() => {
    updateWalletStatus('connecting');
    setTimeout(() => updateWalletStatus('connected'), 15000);
  }, 150000);
  
  // Demo transaction feedback after wallet connects
  setTimeout(() => {
    showTransactionFeedback('success', 'Transaction Successful!', 'Score submitted to blockchain');
  }, 180000);
  
  // Demo score increase after transaction
  setTimeout(() => {
    triggerScoreIncrease(100);
  }, 195000);
  
  // Demo coin collection after score
  setTimeout(() => {
    triggerCoinCollection(5);
  }, 210000);
  
  // Demo combo display after coins
  setTimeout(() => {
    updateComboDisplay(3);
  }, 225000);
  
  // Demo power-up indicator after combo
  setTimeout(() => {
    updatePowerUpIndicator('Magnet');
  }, 240000);
  
  // Fallback: Ensure main menu is visible after a reasonable time
  setTimeout(() => {
    const mainMenuElement = document.querySelector('.mainMenu');
    const loaderElement = document.querySelector('.loader');
    
    if (mainMenuElement && loaderElement) {
      // If loader is still visible and main menu is hidden, force show main menu
      if (loaderElement.style.display !== 'none' && mainMenuElement.classList.contains('hide')) {
        console.log('Fallback: Force showing main menu after timeout');
        mainMenuElement.classList.remove('hide');
        loaderElement.style.display = 'none';
      }
    }
  }, 30000); // 30 seconds fallback
});

console.log('🎮 UI Enhancements loaded successfully!');
console.log('💡 Use window.demoUIEnhancements to test features manually');

// Immediate fallback: Ensure main menu is visible on page load
window.addEventListener('load', () => {
  setTimeout(() => {
    const mainMenuElement = document.querySelector('.mainMenu');
    const loaderElement = document.querySelector('.loader');
    
    if (mainMenuElement && loaderElement) {
      // If main menu is hidden, show it
      if (mainMenuElement.classList.contains('hide')) {
        console.log('Immediate fallback: Showing main menu');
        mainMenuElement.classList.remove('hide');
      }
      
      // If loader is still visible after 5 seconds, hide it
      if (loaderElement.style.display !== 'none') {
        console.log('Immediate fallback: Hiding loader');
        loaderElement.style.display = 'none';
      }
    }
  }, 5000); // 5 seconds after page load
});
