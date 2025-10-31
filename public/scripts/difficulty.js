// Progressive Difficulty System for CoinQuest Game
class DifficultyManager {
  constructor() {
    this.baseSpeed = 1;
    this.maxSpeed = 8;
    this.speedIncreaseRate = 0.0005;
    this.obstacleSpawnRate = 3.5;
    this.minObstacleDistance = 2;
    
    // Difficulty milestones (in meters)
    this.milestones = [
      { distance: 0, name: 'Beginner', speedMultiplier: 1.0, spawnRate: 3.5, minDistance: 2 },
      { distance: 1000, name: 'Novice', speedMultiplier: 1.2, spawnRate: 3.0, minDistance: 1.8 },
      { distance: 2500, name: 'Intermediate', speedMultiplier: 1.5, spawnRate: 2.5, minDistance: 1.6 },
      { distance: 5000, name: 'Advanced', speedMultiplier: 1.8, spawnRate: 2.0, minDistance: 1.4 },
      { distance: 10000, name: 'Expert', speedMultiplier: 2.2, spawnRate: 1.5, minDistance: 1.2 },
      { distance: 20000, name: 'Master', speedMultiplier: 2.8, spawnRate: 1.2, minDistance: 1.0 },
      { distance: 50000, name: 'Legend', speedMultiplier: 3.5, spawnRate: 1.0, minDistance: 0.8 }
    ];
    
    this.currentMilestone = 0;
    this.totalDistance = 0;
    this.difficultyNotificationShown = false;
  }
  
  // Update difficulty based on distance traveled
  update(totalDistance) {
    this.totalDistance = totalDistance;
    
    // Find current milestone
    let newMilestone = 0;
    for (let i = 0; i < this.milestones.length; i++) {
      if (totalDistance >= this.milestones[i].distance) {
        newMilestone = i;
      } else {
        break;
      }
    }
    
    // Check if difficulty increased
    if (newMilestone > this.currentMilestone) {
      this.currentMilestone = newMilestone;
      this.showDifficultyIncrease();
    }
    
    return this.getCurrentDifficulty();
  }
  
  // Get current difficulty settings
  getCurrentDifficulty() {
    const milestone = this.milestones[this.currentMilestone];
    return {
      speedMultiplier: milestone.speedMultiplier,
      spawnRate: milestone.spawnRate,
      minDistance: milestone.minDistance,
      name: milestone.name,
      progress: this.getProgressToNextMilestone()
    };
  }
  
  // Calculate progress to next milestone
  getProgressToNextMilestone() {
    if (this.currentMilestone >= this.milestones.length - 1) {
      return 100; // Max difficulty reached
    }
    
    const current = this.milestones[this.currentMilestone].distance;
    const next = this.milestones[this.currentMilestone + 1].distance;
    const progress = ((this.totalDistance - current) / (next - current)) * 100;
    
    return Math.max(0, Math.min(100, progress));
  }
  
  // Show difficulty increase notification
  showDifficultyIncrease() {
    const milestone = this.milestones[this.currentMilestone];
    
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(45deg, #FF6B35, #F7931E);
      color: #fff;
      padding: 25px 35px;
      border-radius: 20px;
      font-size: 24px;
      font-weight: bold;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 10000;
      text-align: center;
      border: 3px solid #FFD700;
      animation: difficultyIncrease 1s ease-out;
      max-width: 500px;
    `;
    
    notification.innerHTML = `
      <div style="font-size: 28px; margin-bottom: 10px;">🎯 DIFFICULTY INCREASED! 🎯</div>
      <div style="font-size: 20px; margin-bottom: 5px;">${milestone.name}</div>
      <div style="font-size: 14px; margin-bottom: 10px;">Speed: ${milestone.speedMultiplier}x | Obstacles: ${milestone.spawnRate}s</div>
      <div style="font-size: 12px; color: #FFD700;">Distance: ${Math.floor(this.totalDistance)}m</div>
    `;
    
    // Add CSS animation
    if (!document.getElementById('difficultyStyles')) {
      const style = document.createElement('style');
      style.id = 'difficultyStyles';
      style.textContent = `
        @keyframes difficultyIncrease {
          0% {
            transform: translate(-50%, -50%) scale(0.3);
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
      notification.style.animation = 'difficultyIncrease 0.5s ease-in reverse';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 4000);
  }
  
  // Get difficulty display info for UI
  getDifficultyInfo() {
    const milestone = this.milestones[this.currentMilestone];
    const nextMilestone = this.milestones[this.currentMilestone + 1];
    
    return {
      current: milestone.name,
      next: nextMilestone ? nextMilestone.name : 'MAX',
      progress: this.getProgressToNextMilestone(),
      distance: Math.floor(this.totalDistance),
      nextDistance: nextMilestone ? nextMilestone.distance : null
    };
  }
  
  // Reset difficulty for new game
  reset() {
    this.currentMilestone = 0;
    this.totalDistance = 0;
    this.difficultyNotificationShown = false;
  }
}

// Global difficulty manager instance
try {
  window.difficultyManager = new DifficultyManager();
} catch (error) {
  console.error('Failed to initialize difficulty manager:', error);
}
