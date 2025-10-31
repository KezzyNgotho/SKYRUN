// Special Effects and Visual Feedback System for CoinQuest Game
class EffectsManager {
  constructor() {
    this.effects = [];
    this.screenEffects = {
      flash: { active: false, duration: 0, color: '#FFFFFF' },
      shake: { active: false, intensity: 0, duration: 0 },
      blur: { active: false, intensity: 0, duration: 0 }
    };
    
    this.floatingTexts = [];
    this.comboEffects = [];
    this.trailEffects = [];
    
    this.canvas = null;
    this.ctx = null;
  }
  
  // Initialize effects system
  init(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    console.log('✨ Effects system initialized');
  }
  
  // Add floating text effect
  addFloatingText(x, y, text, color = '#FFD700', size = 16) {
    const floatingText = {
      x: x,
      y: y,
      text: text,
      color: color,
      size: size,
      life: 1.0,
      maxLife: 1.0,
      velocity: { x: 0, y: -2 },
      alpha: 1.0
    };
    
    this.floatingTexts.push(floatingText);
  }
  
  // Add combo effect
  addComboEffect(x, y, comboCount) {
    const comboEffect = {
      x: x,
      y: y,
      count: comboCount,
      life: 1.0,
      maxLife: 1.5,
      scale: 1.0,
      rotation: 0,
      color: this.getComboColor(comboCount)
    };
    
    this.comboEffects.push(comboEffect);
  }
  
  // Get combo color based on count
  getComboColor(count) {
    if (count >= 10) return '#FF00FF'; // Magenta for 10+
    if (count >= 7) return '#FFD700';  // Gold for 7-9
    if (count >= 5) return '#FF6B35';  // Orange for 5-6
    if (count >= 3) return '#4CAF50';  // Green for 3-4
    return '#FFFFFF';                  // White for 1-2
  }
  
  // Add screen flash effect
  addScreenFlash(color = '#FFFFFF', duration = 0.1) {
    this.screenEffects.flash = {
      active: true,
      duration: duration,
      maxDuration: duration,
      color: color
    };
  }
  
  // Add screen shake effect
  addScreenShake(intensity = 10, duration = 0.5) {
    this.screenEffects.shake = {
      active: true,
      intensity: intensity,
      duration: duration,
      maxDuration: duration
    };
  }
  
  // Add screen blur effect
  addScreenBlur(intensity = 5, duration = 0.3) {
    this.screenEffects.blur = {
      active: true,
      intensity: intensity,
      duration: duration,
      maxDuration: duration
    };
  }
  
  // Add trail effect for player
  addPlayerTrail(x, y, color = '#FFD700') {
    const trail = {
      x: x,
      y: y,
      color: color,
      life: 1.0,
      maxLife: 0.5,
      size: 8 + Math.random() * 4
    };
    
    this.trailEffects.push(trail);
  }
  
  // Update all effects
  update(deltaTime = 1/60) {
    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const text = this.floatingTexts[i];
      text.x += text.velocity.x;
      text.y += text.velocity.y;
      text.life -= deltaTime * 2;
      text.alpha = text.life / text.maxLife;
      
      if (text.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
    
    // Update combo effects
    for (let i = this.comboEffects.length - 1; i >= 0; i--) {
      const combo = this.comboEffects[i];
      combo.life -= deltaTime;
      combo.scale = 1 + (1 - combo.life / combo.maxLife) * 0.5;
      combo.rotation += deltaTime * 5;
      
      if (combo.life <= 0) {
        this.comboEffects.splice(i, 1);
      }
    }
    
    // Update trail effects
    for (let i = this.trailEffects.length - 1; i >= 0; i--) {
      const trail = this.trailEffects[i];
      trail.life -= deltaTime * 3;
      trail.size *= 0.95;
      
      if (trail.life <= 0) {
        this.trailEffects.splice(i, 1);
      }
    }
    
    // Update screen effects
    this.updateScreenEffects(deltaTime);
  }
  
  // Update screen effects
  updateScreenEffects(deltaTime) {
    // Update flash effect
    if (this.screenEffects.flash.active) {
      this.screenEffects.flash.duration -= deltaTime;
      if (this.screenEffects.flash.duration <= 0) {
        this.screenEffects.flash.active = false;
      }
    }
    
    // Update shake effect
    if (this.screenEffects.shake.active) {
      this.screenEffects.shake.duration -= deltaTime;
      if (this.screenEffects.shake.duration <= 0) {
        this.screenEffects.shake.active = false;
      }
    }
    
    // Update blur effect
    if (this.screenEffects.blur.active) {
      this.screenEffects.blur.duration -= deltaTime;
      if (this.screenEffects.blur.duration <= 0) {
        this.screenEffects.blur.active = false;
      }
    }
  }
  
  // Draw all effects
  draw(ctx) {
    if (!ctx) return;
    
    // Draw trail effects
    this.drawTrailEffects(ctx);
    
    // Draw floating texts
    this.drawFloatingTexts(ctx);
    
    // Draw combo effects
    this.drawComboEffects(ctx);
    
    // Draw screen effects
    this.drawScreenEffects(ctx);
  }
  
  // Draw trail effects
  drawTrailEffects(ctx) {
    ctx.save();
    this.trailEffects.forEach(trail => {
      const alpha = trail.life / trail.maxLife;
      ctx.globalAlpha = alpha * 0.6;
      ctx.fillStyle = trail.color;
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }
  
  // Draw floating texts
  drawFloatingTexts(ctx) {
    ctx.save();
    this.floatingTexts.forEach(text => {
      ctx.globalAlpha = text.alpha;
      ctx.fillStyle = text.color;
      ctx.font = `${text.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(text.text, text.x, text.y);
    });
    ctx.restore();
  }
  
  // Draw combo effects
  drawComboEffects(ctx) {
    ctx.save();
    this.comboEffects.forEach(combo => {
      const alpha = combo.life / combo.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = combo.color;
      ctx.font = `${20 * combo.scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.save();
      ctx.translate(combo.x, combo.y);
      ctx.rotate(combo.rotation);
      ctx.fillText(`COMBO x${combo.count}!`, 0, 0);
      ctx.restore();
    });
    ctx.restore();
  }
  
  // Draw screen effects
  drawScreenEffects(ctx) {
    // Draw flash effect
    if (this.screenEffects.flash.active) {
      const alpha = this.screenEffects.flash.duration / this.screenEffects.flash.maxDuration;
      ctx.save();
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle = this.screenEffects.flash.color;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.restore();
    }
    
    // Draw blur effect
    if (this.screenEffects.blur.active) {
      const intensity = this.screenEffects.blur.intensity * 
        (this.screenEffects.blur.duration / this.screenEffects.blur.maxDuration);
      ctx.save();
      ctx.filter = `blur(${intensity}px)`;
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.restore();
    }
  }
  
  // Get screen shake offset
  getScreenShakeOffset() {
    if (!this.screenEffects.shake.active) {
      return { x: 0, y: 0 };
    }
    
    const intensity = this.screenEffects.shake.intensity * 
      (this.screenEffects.shake.duration / this.screenEffects.shake.maxDuration);
    
    return {
      x: (Math.random() - 0.5) * intensity,
      y: (Math.random() - 0.5) * intensity
    };
  }
  
  // Clear all effects
  clear() {
    this.floatingTexts = [];
    this.comboEffects = [];
    this.trailEffects = [];
    this.screenEffects.flash.active = false;
    this.screenEffects.shake.active = false;
    this.screenEffects.blur.active = false;
  }
}

// Global effects manager instance
try {
  window.effectsManager = new EffectsManager();
} catch (error) {
  console.error('Failed to initialize effects manager:', error);
}
