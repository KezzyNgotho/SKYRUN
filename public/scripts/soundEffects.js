/**
 * Sound Effects System for CoinQuest UI
 * Provides audio feedback for user interactions
 */

class SoundEffectsManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.isEnabled = true;
        this.volume = 0.3;
        this.isInitialized = false;
        
        // Don't initialize immediately - wait for user interaction
        this.init();
    }

    init() {
        try {
            // Create audio context only when needed (after user interaction)
            this.createSounds();
            
            console.log('🎵 Sound Effects Manager initialized (audio context will be created on first play)');
        } catch (error) {
            console.warn('⚠️ Audio not supported:', error);
            this.isEnabled = false;
        }
    }

    ensureAudioContext() {
        if (!this.audioContext && this.isEnabled) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.isInitialized = true;
                console.log('🎵 Audio context created');
            } catch (error) {
                console.warn('⚠️ Could not create audio context:', error);
                this.isEnabled = false;
            }
        }
        return this.audioContext;
    }

    createSounds() {
        // Button Click Sound
        this.sounds.buttonClick = this.createTone(800, 0.1, 'square');
        
        // Button Hover Sound
        this.sounds.buttonHover = this.createTone(600, 0.05, 'sine');
        
        // Success Sound
        this.sounds.success = this.createChord([523, 659, 784], 0.3, 'sine');
        
        // Error Sound
        this.sounds.error = this.createTone(200, 0.2, 'sawtooth');
        
        // Wallet Connect Sound
        this.sounds.walletConnect = this.createChord([440, 554, 659], 0.4, 'sine');
        
        // Menu Open Sound
        this.sounds.menuOpen = this.createTone(1000, 0.15, 'triangle');
        
        // Menu Close Sound
        this.sounds.menuClose = this.createTone(800, 0.15, 'triangle');
        
        // Loading Sound
        this.sounds.loading = this.createTone(400, 0.1, 'sine');
        
        // Achievement Sound
        this.sounds.achievement = this.createChord([523, 659, 784, 1047], 0.5, 'sine');
    }

    createTone(frequency, duration, waveType = 'sine') {
        return () => {
            if (!this.isEnabled) return;
            
            const audioContext = this.ensureAudioContext();
            if (!audioContext) return;
            
            try {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                oscillator.type = waveType;
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (error) {
                console.warn('⚠️ Error playing tone:', error);
            }
        };
    }

    createChord(frequencies, duration, waveType = 'sine') {
        return () => {
            if (!this.isEnabled) return;
            
            const audioContext = this.ensureAudioContext();
            if (!audioContext) return;
            
            try {
                frequencies.forEach((freq, index) => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                    oscillator.type = waveType;
                    
                    const delay = index * 0.05; // Stagger the notes
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
                    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, audioContext.currentTime + delay + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delay + duration);
                    
                    oscillator.start(audioContext.currentTime + delay);
                    oscillator.stop(audioContext.currentTime + delay + duration);
                });
            } catch (error) {
                console.warn('⚠️ Error playing chord:', error);
            }
        };
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            try {
                this.sounds[soundName]();
            } catch (error) {
                console.warn(`⚠️ Could not play sound ${soundName}:`, error);
            }
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        return this.isEnabled;
    }
}

// Initialize sound effects manager
window.soundEffects = new SoundEffectsManager();

// Add sound effects to buttons
document.addEventListener('DOMContentLoaded', () => {
    // Prevent duplicate event listeners
    const processedButtons = new Set();
    
    // Add click sounds to buttons
    const buttons = document.querySelectorAll('button, .menuButton, .connectButton, .smallBtn, .btn');
    buttons.forEach(button => {
        if (!processedButtons.has(button)) {
            processedButtons.add(button);
            
            button.addEventListener('click', () => {
                window.soundEffects.play('buttonClick');
            });
            
            button.addEventListener('mouseenter', () => {
                window.soundEffects.play('buttonHover');
            });
        }
    });

    // Add hover sounds to interactive elements (avoid duplicates)
    const interactiveElements = document.querySelectorAll('.menuButton, .connectButton, .smallBtn, .btn, .tooltip');
    interactiveElements.forEach(element => {
        if (!processedButtons.has(element)) {
            processedButtons.add(element);
            
            element.addEventListener('mouseenter', () => {
                window.soundEffects.play('buttonHover');
            });
        }
    });

    // Don't override console.log globally - it's too aggressive
    // Instead, we'll add sound effects to specific user actions
    
    // Add sound effects to wallet operations
    const originalAlert = window.alert;
    window.alert = function(message) {
        try {
            if (message.includes('SUCCESS') || message.includes('successfully')) {
                window.soundEffects.play('success');
            } else if (message.includes('ERROR') || message.includes('Failed')) {
                window.soundEffects.play('error');
            } else if (message.includes('wallet') && message.includes('connect')) {
                window.soundEffects.play('walletConnect');
            }
        } catch (error) {
            console.warn('⚠️ Error in sound effect alert override:', error);
        }
        
        originalAlert.call(window, message);
    };

    console.log('🎵 Sound effects attached to UI elements');
});

// Expose sound controls globally
window.playSound = (soundName) => {
    window.soundEffects.play(soundName);
};

window.toggleSound = () => {
    return window.soundEffects.toggle();
};

window.setSoundVolume = (volume) => {
    window.soundEffects.setVolume(volume);
};
