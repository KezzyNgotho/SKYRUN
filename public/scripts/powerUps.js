// Enhanced Power-Up System for CoinQuest Game
class PowerUpManager {
  constructor() {
    this.activePowerUps = new Map();
    this.powerUpTypes = {
      magnet: {
        name: 'Magnet',
        duration: 5000, // 5 seconds
        icon: '🧲',
        color: '#00BFFF',
        effect: 'attracts coins'
      },
      doubleScore: {
        name: 'Double Score',
        duration: 3000, // 3 seconds
        icon: '⚡',
        color: '#FFD700',
        effect: '2x score multiplier'
      },
      invincibility: {
        name: 'Invincibility',
        duration: 2000, // 2 seconds
        icon: '💎',
        color: '#FF69B4',
        effect: 'no damage'
      },
      slowMotion: {
        name: 'Slow Motion',
        duration: 4000, // 4 seconds
        icon: '🐌',
        color: '#9370DB',
        effect: 'slows game speed'
      },
      coinRain: {
        name: 'Coin Rain',
        duration: 1000, // 1 second
        icon: '💰',
        color: '#32CD32',
        effect: 'spawns many coins'
      }
    };
    
    this.originalSpeed = 1;
    this.scoreMultiplier = 1;
  }
  
  // Activate a power-up
  activate(powerUpType) {
    if (!this.powerUpTypes[powerUpType]) {
      console.warn('Unknown power-up type:', powerUpType);
      return;
    }
    
    const powerUp = this.powerUpTypes[powerUpType];
    const endTime = Date.now() + powerUp.duration;
    
    this.activePowerUps.set(powerUpType, endTime);
    
    console.log(`🎁 ${powerUp.icon} ${powerUp.name} activated!`);
    
    // Apply immediate effects
    this.applyPowerUpEffect(powerUpType);
    
    // Add visual feedback
    this.showPowerUpNotification(powerUp);
    
    return true;
  }
  
  // Apply power-up effects
  applyPowerUpEffect(powerUpType) {
    switch(powerUpType) {
      case 'magnet':
        // Magnet effect is handled in coin collection
        break;
        
      case 'doubleScore':
        this.scoreMultiplier = 2;
        break;
        
      case 'invincibility':
        // Invincibility is handled in collision detection
        break;
        
      case 'slowMotion':
        this.originalSpeed = window.speed || 1;
        window.speed = this.originalSpeed * 0.3; // Slow down to 30%
        break;
        
      case 'coinRain':
        this.spawnCoinRain();
        break;
    }
  }
  
  // Remove power-up effects
  removePowerUpEffect(powerUpType) {
    switch(powerUpType) {
      case 'doubleScore':
        this.scoreMultiplier = 1;
        break;
        
      case 'slowMotion':
        if (window.speed) {
          window.speed = this.originalSpeed;
        }
        break;
    }
  }
  
  // Update active power-ups
  update() {
    const now = Date.now();
    const expiredPowerUps = [];
    
    for (const [powerUpType, endTime] of this.activePowerUps) {
      if (now >= endTime) {
        expiredPowerUps.push(powerUpType);
      }
    }
    
    // Remove expired power-ups
    expiredPowerUps.forEach(powerUpType => {
      this.activePowerUps.delete(powerUpType);
      this.removePowerUpEffect(powerUpType);
      console.log(`⏰ ${this.powerUpTypes[powerUpType].icon} ${this.powerUpTypes[powerUpType].name} expired`);
    });
  }
  
  // Check if power-up is active
  isActive(powerUpType) {
    return this.activePowerUps.has(powerUpType);
  }
  
  // Get active power-ups
  getActivePowerUps() {
    return Array.from(this.activePowerUps.keys());
  }
  
  // Get score multiplier
  getScoreMultiplier() {
    return this.scoreMultiplier;
  }
  
  // Check if player is invincible
  isInvincible() {
    return this.isActive('invincibility');
  }
  
  // Check if magnet is active
  isMagnetActive() {
    return this.isActive('magnet');
  }
  
  // Spawn coin rain effect
  spawnCoinRain() {
    if (!window.objects) return;
    
    // Spawn 15 coins in a rain pattern
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * (window.canvas?.width || 800);
      const y = -50 - (Math.random() * 200); // Start above screen
      
      const coin = new window.GameObject(
        window.CollectSprites?.[3] || new Image(),
        x, y, false
      );
      
      if (coin) {
        coin.isCoin = true;
        coin.sizeCoef = 0.3;
        coin.rainFall = true; // Special property for rain coins
        coin.rainSpeed = 2 + Math.random() * 3; // Fall speed
        
        if (window.objects) {
          window.objects.push(coin);
        }
      }
    }
    
    console.log('💰 Coin rain spawned!');
  }
  
  // Show power-up notification
  showPowerUpNotification(powerUp) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(45deg, ${powerUp.color}, #fff);
      color: #000;
      padding: 15px 25px;
      border-radius: 25px;
      font-size: 18px;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: powerUpSlideIn 0.5s ease-out;
    `;
    
    notification.innerHTML = `
      ${powerUp.icon} ${powerUp.name} Activated!
      <div style="font-size: 12px; margin-top: 5px;">${powerUp.effect}</div>
    `;
    
    // Add CSS animation
    if (!document.getElementById('powerUpStyles')) {
      const style = document.createElement('style');
      style.id = 'powerUpStyles';
      style.textContent = `
        @keyframes powerUpSlideIn {
          from {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
        @keyframes powerUpSlideOut {
          from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
          to {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'powerUpSlideOut 0.5s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 3000);
  }
  
  // Draw power-up indicators
  draw(ctx) {
    if (!ctx) return;
    
    const activePowerUps = this.getActivePowerUps();
    if (activePowerUps.length === 0) return;
    
    const canvas = window.canvas;
    if (!canvas) return;
    
    // Draw power-up indicators in top-right corner
    let yOffset = 20;
    const indicatorSize = 40;
    const spacing = 50;
    
    activePowerUps.forEach(powerUpType => {
      const powerUp = this.powerUpTypes[powerUpType];
      const endTime = this.activePowerUps.get(powerUpType);
      const remainingTime = Math.max(0, endTime - Date.now());
      const progress = remainingTime / powerUp.duration;
      
      // Background circle
      ctx.fillStyle = powerUp.color + '40'; // 40 = 25% opacity
      ctx.beginPath();
      ctx.arc(canvas.width - 60, yOffset, indicatorSize / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Border
      ctx.strokeStyle = powerUp.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Progress ring
      ctx.strokeStyle = powerUp.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(canvas.width - 60, yOffset, indicatorSize / 2 - 5, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress));
      ctx.stroke();
      
      // Icon (text)
      ctx.fillStyle = '#fff';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(powerUp.icon, canvas.width - 60, yOffset + 7);
      
      yOffset += spacing;
    });
  }
  
  // Clear all power-ups
  clear() {
    this.activePowerUps.clear();
    this.scoreMultiplier = 1;
    if (window.speed) {
      window.speed = this.originalSpeed;
    }
  }
}

// Global power-up manager instance
window.powerUpManager = new PowerUpManager();
