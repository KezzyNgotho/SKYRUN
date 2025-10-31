// Achievement System for CoinQuest Game
class AchievementManager {
  constructor() {
    this.achievements = {
      // Distance-based achievements
      pioneer: {
        id: 'pioneer',
        name: 'Pioneer',
        description: 'Run 1000 meters',
        icon: '/assets/gui/pioneer.png',
        condition: (stats) => stats.totalDistance >= 1000,
        unlocked: false,
        reward: { coins: 50, xp: 100 }
      },
      bomb: {
        id: 'bomb',
        name: 'Bomb Runner',
        description: 'Run 5000 meters',
        icon: '/assets/gui/bomb.png',
        condition: (stats) => stats.totalDistance >= 5000,
        unlocked: false,
        reward: { coins: 200, xp: 500 }
      },
      motorbike: {
        id: 'motorbike',
        name: 'Speed Demon',
        description: 'Run 10000 meters',
        icon: '/assets/gui/motorbike.png',
        condition: (stats) => stats.totalDistance >= 10000,
        unlocked: false,
        reward: { coins: 500, xp: 1000 }
      },
      trees: {
        id: 'trees',
        name: 'Forest Runner',
        description: 'Run 25000 meters',
        icon: '/assets/gui/trees.png',
        condition: (stats) => stats.totalDistance >= 25000,
        unlocked: false,
        reward: { coins: 1000, xp: 2500 }
      },
      gigachad: {
        id: 'gigachad',
        name: 'Giga Chad',
        description: 'Run 50000 meters',
        icon: '/assets/gui/gigachad.png',
        condition: (stats) => stats.totalDistance >= 50000,
        unlocked: false,
        reward: { coins: 2500, xp: 5000 }
      },
      
      // Death-based achievements
      deadCat: {
        id: 'deadCat',
        name: 'Nine Lives',
        description: 'Die 9 times',
        icon: '/assets/gui/dead cat.png',
        condition: (stats) => stats.totalDeaths >= 9,
        unlocked: false,
        reward: { coins: 100, xp: 200 }
      },
      guitar: {
        id: 'guitar',
        name: 'Rock Star',
        description: 'Die 25 times',
        icon: '/assets/gui/guitar.png',
        condition: (stats) => stats.totalDeaths >= 25,
        unlocked: false,
        reward: { coins: 300, xp: 600 }
      },
      earth: {
        id: 'earth',
        name: 'Earth Walker',
        description: 'Die 50 times',
        icon: '/assets/gui/earth.png',
        condition: (stats) => stats.totalDeaths >= 50,
        unlocked: false,
        reward: { coins: 750, xp: 1500 }
      },
      skull: {
        id: 'skull',
        name: 'Skull Collector',
        description: 'Die 100 times',
        icon: '/assets/gui/skull.png',
        condition: (stats) => stats.totalDeaths >= 100,
        unlocked: false,
        reward: { coins: 2000, xp: 4000 }
      },
      
      // Skill-based achievements
      bouncer: {
        id: 'bouncer',
        name: 'Bouncer',
        description: 'Jump 100 times',
        icon: '/assets/gui/bouncer.png',
        condition: (stats) => stats.totalJumps >= 100,
        unlocked: false,
        reward: { coins: 150, xp: 300 }
      },
      slide: {
        id: 'slide',
        name: 'Sliding Master',
        description: 'Slide 50 times',
        icon: '/assets/gui/slide.png',
        condition: (stats) => stats.totalSlides >= 50,
        unlocked: false,
        reward: { coins: 200, xp: 400 }
      },
      
      // Power-up achievements
      shield: {
        id: 'shield',
        name: 'Shield Master',
        description: 'Collect 25 shields',
        icon: '/assets/sprites/collect/shieldIcon.png',
        condition: (stats) => stats.shieldsCollected >= 25,
        unlocked: false,
        reward: { coins: 300, xp: 600 }
      },
      booster: {
        id: 'booster',
        name: 'Speed Boost',
        description: 'Collect 25 boosters',
        icon: '/assets/sprites/collect/boosterIcon.png',
        condition: (stats) => stats.boostersCollected >= 25,
        unlocked: false,
        reward: { coins: 300, xp: 600 }
      },
      coin: {
        id: 'coin',
        name: 'Coin Collector',
        description: 'Collect 500 coins',
        icon: '/assets/sprites/collect/coin.png',
        condition: (stats) => stats.coinsCollected >= 500,
        unlocked: false,
        reward: { coins: 500, xp: 1000 }
      },
      
      // Ultimate achievement
      success: {
        id: 'success',
        name: 'Achievement Master',
        description: 'Unlock all achievements',
        icon: '/assets/gui/success.png',
        condition: (stats) => this.getUnlockedCount() >= 14, // All others unlocked
        unlocked: false,
        reward: { coins: 5000, xp: 10000 }
      }
    };
    
    this.stats = {
      totalDistance: 0,
      totalDeaths: 0,
      totalJumps: 0,
      totalSlides: 0,
      shieldsCollected: 0,
      boostersCollected: 0,
      coinsCollected: 0,
      gamesPlayed: 0,
      highScore: 0
    };
    
    this.loadStats();
    this.loadAchievements();
  }
  
  // Load stats from localStorage
  loadStats() {
    const savedStats = localStorage.getItem('coinQuestStats');
    if (savedStats) {
      this.stats = { ...this.stats, ...JSON.parse(savedStats) };
    }
  }
  
  // Save stats to localStorage
  saveStats() {
    localStorage.setItem('coinQuestStats', JSON.stringify(this.stats));
  }
  
  // Load achievement progress from localStorage
  loadAchievements() {
    const savedAchievements = localStorage.getItem('coinQuestAchievements');
    if (savedAchievements) {
      const unlocked = JSON.parse(savedAchievements);
      Object.keys(unlocked).forEach(id => {
        if (this.achievements[id]) {
          this.achievements[id].unlocked = unlocked[id];
        }
      });
    }
  }
  
  // Save achievement progress to localStorage
  saveAchievements() {
    const unlocked = {};
    Object.keys(this.achievements).forEach(id => {
      unlocked[id] = this.achievements[id].unlocked;
    });
    localStorage.setItem('coinQuestAchievements', JSON.stringify(unlocked));
  }
  
  // Update stats
  updateStats(statName, value) {
    if (this.stats.hasOwnProperty(statName)) {
      this.stats[statName] += value;
      this.saveStats();
      this.checkAchievements();
    }
  }
  
  // Set stats (for high score, etc.)
  setStats(statName, value) {
    if (this.stats.hasOwnProperty(statName)) {
      this.stats[statName] = Math.max(this.stats[statName], value);
      this.saveStats();
      this.checkAchievements();
    }
  }
  
  // Check all achievements
  checkAchievements() {
    let newAchievements = [];
    
    Object.keys(this.achievements).forEach(id => {
      const achievement = this.achievements[id];
      if (!achievement.unlocked && achievement.condition(this.stats)) {
        achievement.unlocked = true;
        newAchievements.push(achievement);
        
        // Award rewards
        if (achievement.reward.coins) {
          this.updateStats('coinsCollected', achievement.reward.coins);
          // Update global coins
          if (window.myCoins !== undefined) {
            window.myCoins += achievement.reward.coins;
            localStorage.setItem('myCoins', window.myCoins);
          }
        }
      }
    });
    
    if (newAchievements.length > 0) {
      this.saveAchievements();
      this.showAchievementNotification(newAchievements);
    }
  }
  
  // Show achievement notification
  showAchievementNotification(achievements) {
    achievements.forEach(achievement => {
      // Create notification element
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #FFD700, #FFA500);
        color: #000;
        padding: 20px 30px;
        border-radius: 15px;
        font-size: 20px;
        font-weight: bold;
        box-shadow: 0 8px 25px rgba(0,0,0,0.5);
        z-index: 10000;
        text-align: center;
        border: 3px solid #FFD700;
        animation: achievementPop 0.8s ease-out;
        max-width: 400px;
      `;
      
      notification.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 10px;">🏆 ACHIEVEMENT UNLOCKED! 🏆</div>
        <div style="font-size: 18px; margin-bottom: 5px;">${achievement.name}</div>
        <div style="font-size: 14px; margin-bottom: 10px;">${achievement.description}</div>
        <div style="font-size: 12px; color: #666;">+${achievement.reward.coins} coins, +${achievement.reward.xp} XP</div>
      `;
      
      // Add CSS animation
      if (!document.getElementById('achievementStyles')) {
        const style = document.createElement('style');
        style.id = 'achievementStyles';
        style.textContent = `
          @keyframes achievementPop {
            0% {
              transform: translate(-50%, -50%) scale(0.5);
              opacity: 0;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.1);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(notification);
      
      // Remove notification after 4 seconds
      setTimeout(() => {
        notification.style.animation = 'achievementPop 0.5s ease-in reverse';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 500);
      }, 4000);
    });
  }
  
  // Get unlocked achievement count
  getUnlockedCount() {
    return Object.values(this.achievements).filter(a => a.unlocked).length;
  }
  
  // Get total achievement count
  getTotalCount() {
    return Object.keys(this.achievements).length;
  }
  
  // Update achievement display
  updateDisplay() {
    Object.keys(this.achievements).forEach(id => {
      const achievement = this.achievements[id];
      const element = document.querySelector(`[data-achievement="${id}"]`);
      
      if (element) {
        if (achievement.unlocked) {
          element.classList.remove('lock');
          element.classList.add('unlocked');
        } else {
          element.classList.add('lock');
          element.classList.remove('unlocked');
        }
      }
    });
  }
  
  // Get achievement progress
  getProgress(achievementId) {
    const achievement = this.achievements[achievementId];
    if (!achievement) return 0;
    
    // Calculate progress based on achievement type
    switch(achievementId) {
      case 'pioneer': return Math.min(100, (this.stats.totalDistance / 1000) * 100);
      case 'bomb': return Math.min(100, (this.stats.totalDistance / 5000) * 100);
      case 'motorbike': return Math.min(100, (this.stats.totalDistance / 10000) * 100);
      case 'trees': return Math.min(100, (this.stats.totalDistance / 25000) * 100);
      case 'gigachad': return Math.min(100, (this.stats.totalDistance / 50000) * 100);
      case 'deadCat': return Math.min(100, (this.stats.totalDeaths / 9) * 100);
      case 'guitar': return Math.min(100, (this.stats.totalDeaths / 25) * 100);
      case 'earth': return Math.min(100, (this.stats.totalDeaths / 50) * 100);
      case 'skull': return Math.min(100, (this.stats.totalDeaths / 100) * 100);
      case 'bouncer': return Math.min(100, (this.stats.totalJumps / 100) * 100);
      case 'slide': return Math.min(100, (this.stats.totalSlides / 50) * 100);
      case 'shield': return Math.min(100, (this.stats.shieldsCollected / 25) * 100);
      case 'booster': return Math.min(100, (this.stats.boostersCollected / 25) * 100);
      case 'coin': return Math.min(100, (this.stats.coinsCollected / 500) * 100);
      case 'success': return Math.min(100, (this.getUnlockedCount() / 14) * 100);
      default: return 0;
    }
  }
}

// Global achievement manager instance
window.achievementManager = new AchievementManager();
