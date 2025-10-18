// Screen Shake Effect for CoinQuest Game
class ScreenShake {
  constructor() {
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
    this.originalX = 0;
    this.originalY = 0;
  }
  
  start(intensity = 10, duration = 0.3) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTimer = duration;
  }
  
  update(deltaTime) {
    if (this.shakeTimer > 0) {
      this.shakeTimer -= deltaTime;
      
      // Calculate shake offset
      const progress = this.shakeTimer / this.shakeDuration;
      const currentIntensity = this.shakeIntensity * progress;
      
      this.originalX = (Math.random() - 0.5) * currentIntensity;
      this.originalY = (Math.random() - 0.5) * currentIntensity;
      
      return true; // Still shaking
    } else {
      this.originalX = 0;
      this.originalY = 0;
      return false; // Done shaking
    }
  }
  
  getOffset() {
    return {
      x: this.originalX,
      y: this.originalY
    };
  }
}

// Global screen shake instance
window.screenShake = new ScreenShake();
