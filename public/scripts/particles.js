// Particle System for CoinQuest Game
class Particle {
  constructor(x, y, type = 'coin') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.life = 1.0;
    this.maxLife = 1.0;
    this.size = 1.0;
    this.velocity = { x: 0, y: 0 };
    this.gravity = 0;
    this.fade = 0;
    this.color = window.particleManager?.themeColor || '#FFD700'; // Use theme color if available
    
    // Initialize based on type
    this.initParticle();
  }
  
  initParticle() {
    switch(this.type) {
      case 'coin':
        this.velocity.x = (Math.random() - 0.5) * 4;
        this.velocity.y = -Math.random() * 3 - 1;
        this.gravity = 0.1;
        this.maxLife = 0.8;
        this.life = this.maxLife;
        this.size = 0.5 + Math.random() * 0.5;
        this.color = '#FFD700';
        break;
        
      case 'sparkle':
        this.velocity.x = (Math.random() - 0.5) * 6;
        this.velocity.y = (Math.random() - 0.5) * 6;
        this.gravity = 0.05;
        this.maxLife = 1.2;
        this.life = this.maxLife;
        this.size = 0.3 + Math.random() * 0.4;
        this.color = '#FFFFFF';
        break;
        
      case 'damage':
        this.velocity.x = (Math.random() - 0.5) * 8;
        this.velocity.y = -Math.random() * 5 - 2;
        this.gravity = 0.15;
        this.maxLife = 1.0;
        this.life = this.maxLife;
        this.size = 0.8 + Math.random() * 0.4;
        this.color = '#FF4444';
        break;
        
      case 'powerup':
        this.velocity.x = (Math.random() - 0.5) * 3;
        this.velocity.y = -Math.random() * 2 - 0.5;
        this.gravity = 0.08;
        this.maxLife = 1.5;
        this.life = this.maxLife;
        this.size = 0.6 + Math.random() * 0.6;
        this.color = '#00FF00';
        break;
    }
  }
  
  update() {
    // Update position
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    
    // Apply gravity
    this.velocity.y += this.gravity;
    
    // Update life
    this.life -= 1/60; // Assuming 60 FPS
    
    // Calculate fade
    this.fade = this.life / this.maxLife;
    
    // Update size (shrink over time)
    this.size *= 0.99;
    
    return this.life > 0;
  }
  
  draw(ctx) {
    if (this.life <= 0) return;
    
    ctx.save();
    ctx.globalAlpha = this.fade;
    
    // Draw particle based on type
    switch(this.type) {
      case 'coin':
        this.drawCoin(ctx);
        break;
      case 'sparkle':
        this.drawSparkle(ctx);
        break;
      case 'damage':
        this.drawDamage(ctx);
        break;
      case 'powerup':
        this.drawPowerup(ctx);
        break;
    }
    
    ctx.restore();
  }
  
  drawCoin(ctx) {
    // Draw golden coin particle
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Add shine effect
    ctx.fillStyle = '#FFFF99';
    ctx.beginPath();
    ctx.arc(this.x - this.size, this.y - this.size, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  drawSparkle(ctx) {
    // Draw star-like sparkle
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const spikes = 4;
    const outerRadius = this.size * 4;
    const innerRadius = this.size * 2;
    
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = this.x + Math.cos(angle) * radius;
      const y = this.y + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }
  
  drawDamage(ctx) {
    // Draw damage particle
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Add crack effect
    ctx.strokeStyle = '#CC0000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x - this.size, this.y - this.size);
    ctx.lineTo(this.x + this.size, this.y + this.size);
    ctx.moveTo(this.x + this.size, this.y - this.size);
    ctx.lineTo(this.x - this.size, this.y + this.size);
    ctx.stroke();
  }
  
  drawPowerup(ctx) {
    // Draw powerup particle
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Add glow effect
    ctx.fillStyle = '#88FF88';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Particle Manager
class ParticleManager {
  constructor() {
    this.particles = [];
  }
  
  addParticle(x, y, type = 'coin') {
    this.particles.push(new Particle(x, y, type));
  }
  
  addCoinParticles(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      this.addParticle(x, y, 'coin');
    }
  }
  
  addSparkleParticles(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      this.addParticle(x, y, 'sparkle');
    }
  }
  
  addDamageParticles(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
      this.addParticle(x, y, 'damage');
    }
  }
  
  addPowerupParticles(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      this.addParticle(x, y, 'powerup');
    }
  }
  
  update() {
    // Update all particles and remove dead ones
    this.particles = this.particles.filter(particle => particle.update());
  }
  
  draw(ctx) {
    this.particles.forEach(particle => particle.draw(ctx));
  }
  
  clear() {
    this.particles = [];
  }
  
  setThemeColor(color) {
    // Update the default color for new particles
    this.themeColor = color;
    console.log('Particle theme color set to:', color);
  }
}

// Global particle manager instance
window.particleManager = new ParticleManager();
