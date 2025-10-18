// Dynamic Background System for CoinQuest Game
class DynamicBackgroundManager {
  constructor() {
    this.currentTheme = 'day';
    this.themes = {
      day: {
        name: 'Sunny Day',
        bgSprites: [1, 2, 3, 4, 5, 6, 7, 8], // Default day backgrounds
        fgSprites: [1, 2], // Default foreground
        color: '#87CEEB', // Sky blue
        particleColor: '#FFD700', // Gold particles
        description: 'Bright and cheerful'
      },
      sunset: {
        name: 'Golden Sunset',
        bgSprites: [1, 2, 3, 4, 5, 6, 7, 8], // Same sprites, different tint
        fgSprites: [1, 2],
        color: '#FF6347', // Tomato red
        particleColor: '#FF8C00', // Dark orange
        description: 'Warm and magical'
      },
      night: {
        name: 'Starry Night',
        bgSprites: [1, 2, 3, 4, 5, 6, 7, 8], // Same sprites, darker tint
        fgSprites: [1, 2],
        color: '#191970', // Midnight blue
        particleColor: '#FFFFFF', // White particles
        description: 'Mysterious and calm'
      },
      storm: {
        name: 'Thunderstorm',
        bgSprites: [1, 2, 3, 4, 5, 6, 7, 8], // Same sprites, stormy tint
        fgSprites: [1, 2],
        color: '#2F4F4F', // Dark slate gray
        particleColor: '#00BFFF', // Deep sky blue
        description: 'Intense and dramatic'
      },
      space: {
        name: 'Cosmic Space',
        bgSprites: [1, 2, 3, 4, 5, 6, 7, 8], // Same sprites, space tint
        fgSprites: [1, 2],
        color: '#000080', // Navy blue
        particleColor: '#FF69B4', // Hot pink
        description: 'Out of this world'
      }
    };
    
    this.transitionDuration = 2000; // 2 seconds
    this.isTransitioning = false;
    this.transitionStartTime = 0;
    this.transitionFromTheme = null;
    this.transitionToTheme = null;
    
    this.scoreThresholds = {
      sunset: 500,
      night: 1000,
      storm: 2000,
      space: 5000
    };
    
    this.lastScoreCheck = 0;
    this.themeChangeCooldown = 10000; // 10 seconds between theme changes
    this.lastThemeChange = 0;
  }
  
  // Initialize the background system
  init() {
    console.log('🌅 Dynamic Background Manager initialized');
    this.currentTheme = 'day';
    this.updateBackgroundTint();
  }
  
  // Update background based on score and game state
  update(score, gameTime) {
    const now = Date.now();
    
    // Check if enough time has passed since last theme change
    if (now - this.lastThemeChange < this.themeChangeCooldown) {
      return;
    }
    
    // Determine theme based on score
    let targetTheme = 'day';
    if (score >= this.scoreThresholds.space) {
      targetTheme = 'space';
    } else if (score >= this.scoreThresholds.storm) {
      targetTheme = 'storm';
    } else if (score >= this.scoreThresholds.night) {
      targetTheme = 'night';
    } else if (score >= this.scoreThresholds.sunset) {
      targetTheme = 'sunset';
    }
    
    // Change theme if different and not transitioning
    if (targetTheme !== this.currentTheme && !this.isTransitioning) {
      this.changeTheme(targetTheme);
    }
    
    // Update transition if in progress
    if (this.isTransitioning) {
      this.updateTransition();
    }
  }
  
  // Change to a new theme
  changeTheme(newTheme) {
    if (!this.themes[newTheme]) {
      console.warn('Unknown theme:', newTheme);
      return;
    }
    
    console.log(`🌅 Changing theme from ${this.currentTheme} to ${newTheme}`);
    
    this.isTransitioning = true;
    this.transitionFromTheme = this.currentTheme;
    this.transitionToTheme = newTheme;
    this.transitionStartTime = Date.now();
    this.lastThemeChange = Date.now();
    
    // Show theme change notification
    this.showThemeNotification(newTheme);
  }
  
  // Update transition progress
  updateTransition() {
    const elapsed = Date.now() - this.transitionStartTime;
    const progress = Math.min(elapsed / this.transitionDuration, 1);
    
    if (progress >= 1) {
      // Transition complete
      this.currentTheme = this.transitionToTheme;
      this.isTransitioning = false;
      this.transitionFromTheme = null;
      this.transitionToTheme = null;
      this.updateBackgroundTint();
      console.log(`🌅 Theme transition complete: ${this.currentTheme}`);
    } else {
      // Update tint during transition
      this.updateTransitionTint(progress);
    }
  }
  
  // Update background tint based on current theme
  updateBackgroundTint() {
    const theme = this.themes[this.currentTheme];
    if (!theme) return;
    
    // Apply tint to canvas
    const canvas = window.canvas;
    if (canvas) {
      canvas.style.filter = this.getThemeFilter(theme);
    }
    
    // Update particle colors
    if (window.particleManager) {
      window.particleManager.setThemeColor(theme.particleColor);
    }
  }
  
  // Update tint during transition
  updateTransitionTint(progress) {
    const fromTheme = this.themes[this.transitionFromTheme];
    const toTheme = this.themes[this.transitionToTheme];
    
    if (!fromTheme || !toTheme) return;
    
    // Interpolate between theme colors
    const interpolatedColor = this.interpolateColor(
      fromTheme.color, 
      toTheme.color, 
      progress
    );
    
    // Apply interpolated tint
    const canvas = window.canvas;
    if (canvas) {
      canvas.style.filter = this.getColorFilter(interpolatedColor);
    }
  }
  
  // Get CSS filter for theme
  getThemeFilter(theme) {
    return this.getColorFilter(theme.color);
  }
  
  // Get CSS filter for color
  getColorFilter(color) {
    // Convert hex to RGB
    const rgb = this.hexToRgb(color);
    if (!rgb) return 'none';
    
    // Create color matrix filter
    const matrix = [
      rgb.r / 255, 0, 0, 0, 0,
      0, rgb.g / 255, 0, 0, 0,
      0, 0, rgb.b / 255, 0, 0,
      0, 0, 0, 1, 0
    ];
    
    return `filter: hue-rotate(${this.getHueRotation(color)}deg) saturate(1.2) brightness(0.8)`;
  }
  
  // Convert hex to RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  // Get hue rotation for color
  getHueRotation(color) {
    const hueMap = {
      '#87CEEB': 0,    // Sky blue
      '#FF6347': 15,   // Tomato red
      '#191970': 240,  // Midnight blue
      '#2F4F4F': 180,  // Dark slate gray
      '#000080': 240   // Navy blue
    };
    return hueMap[color] || 0;
  }
  
  // Interpolate between two colors
  interpolateColor(color1, color2, progress) {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return color1;
    
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * progress);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * progress);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * progress);
    
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  // Show theme change notification
  showThemeNotification(themeName) {
    const theme = this.themes[themeName];
    if (!theme) return;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(45deg, ${theme.color}, rgba(255,255,255,0.9));
      color: #000;
      padding: 20px 30px;
      border-radius: 15px;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: themeChangeSlideIn 0.8s ease-out;
      font-family: 'Press Start 2P', cursive;
    `;
    
    notification.innerHTML = `
      🌅 ${theme.name}
      <div style="font-size: 14px; margin-top: 10px; opacity: 0.8;">${theme.description}</div>
    `;
    
    // Add CSS animation
    if (!document.getElementById('themeChangeStyles')) {
      const style = document.createElement('style');
      style.id = 'themeChangeStyles';
      style.textContent = `
        @keyframes themeChangeSlideIn {
          from {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        @keyframes themeChangeSlideOut {
          from {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          to {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'themeChangeSlideOut 0.5s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 3000);
  }
  
  // Get current theme info
  getCurrentTheme() {
    return {
      name: this.currentTheme,
      theme: this.themes[this.currentTheme],
      isTransitioning: this.isTransitioning
    };
  }
  
  // Force change theme (for testing)
  forceTheme(themeName) {
    if (this.themes[themeName]) {
      this.currentTheme = themeName;
      this.isTransitioning = false;
      this.updateBackgroundTint();
      console.log(`🌅 Forced theme change to: ${themeName}`);
    }
  }
  
  // Get theme progress based on score
  getThemeProgress(score) {
    if (score < this.scoreThresholds.sunset) {
      return { theme: 'day', progress: score / this.scoreThresholds.sunset };
    } else if (score < this.scoreThresholds.night) {
      return { theme: 'sunset', progress: (score - this.scoreThresholds.sunset) / (this.scoreThresholds.night - this.scoreThresholds.sunset) };
    } else if (score < this.scoreThresholds.storm) {
      return { theme: 'night', progress: (score - this.scoreThresholds.night) / (this.scoreThresholds.storm - this.scoreThresholds.night) };
    } else if (score < this.scoreThresholds.space) {
      return { theme: 'storm', progress: (score - this.scoreThresholds.storm) / (this.scoreThresholds.space - this.scoreThresholds.storm) };
    } else {
      return { theme: 'space', progress: 1 };
    }
  }
}

// Global dynamic background manager instance
window.dynamicBackgroundManager = new DynamicBackgroundManager();
