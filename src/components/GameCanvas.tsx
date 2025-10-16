import React, { useEffect, useRef, useState } from 'react';
import { useStacks } from '../contexts/StacksContext';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<any>(null);
  const [gameLoaded, setGameLoaded] = useState(false);
  const { callContract, getContractId, isConnected } = useStacks();

  useEffect(() => {
    // Load the game scripts
    const loadGameScripts = async () => {
      try {
        // Load Howler.js first
        const howlerScript = document.createElement('script');
        howlerScript.src = '/scripts/howler.core.js';
        howlerScript.onload = () => {
          // Load other game scripts
          const scripts = [
            '/scripts/vars.js',
            '/scripts/PxLoader.js',
            '/scripts/PxLoaderImage.js',
            '/scripts/PxLoaderAudio.js',
            '/scripts/loader.js',
            '/scripts/yandexScripts.js',
            '/scripts/game.js'
          ];

          let loadedCount = 0;
          scripts.forEach((src, index) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
              loadedCount++;
              if (loadedCount === scripts.length) {
                setGameLoaded(true);
              }
            };
            script.onerror = () => {
              console.error(`Failed to load script: ${src}`);
              loadedCount++;
              if (loadedCount === scripts.length) {
                setGameLoaded(true);
              }
            };
            document.head.appendChild(script);
          });
        };
        document.head.appendChild(howlerScript);
      } catch (error) {
        console.error('Failed to load game scripts:', error);
        setGameLoaded(true);
      }
    };

    loadGameScripts();

    return () => {
      // Cleanup if needed
    };
  }, []);

  useEffect(() => {
    if (gameLoaded && canvasRef.current) {
      // Initialize the game
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx && typeof window !== 'undefined') {
        // Set up the game canvas
        canvas.width = 800;
        canvas.height = 600;
        
        // Initialize game if the global functions exist
        if (typeof (window as any).gameInit === 'function') {
          (window as any).gameInit();
        }
        
        // Set up game loop
        const gameLoop = () => {
          if (typeof (window as any).gameUpdate === 'function') {
            (window as any).gameUpdate();
          }
          if (typeof (window as any).gameRender === 'function') {
            (window as any).gameRender(ctx);
          }
          requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
      }
    }
  }, [gameLoaded]);

  const handleFinalizeScore = async (score: number) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const contractId = getContractId('QuestRewardsV2');
      if (!contractId) {
        console.error('Contract not found');
        return;
      }
      
      await callContract(contractId, 'submit-game-score', [score]);
      console.log('Score submitted to Stacks');
      alert('Score submitted successfully!');
    } catch (error) {
      console.error('Failed to submit score:', error);
      alert('Failed to submit score. Please try again.');
    }
  };

  const handleClaimReward = async (questId: number = 1) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const contractId = getContractId('QuestRewardsV2');
      if (!contractId) {
        console.error('Contract not found');
        return;
      }
      
      await callContract(contractId, 'claim-quest-reward', [questId]);
      console.log('Reward claimed from Stacks');
      alert('Reward claimed successfully!');
    } catch (error) {
      console.error('Failed to claim reward:', error);
      alert('Failed to claim reward. Please try again.');
    }
  };

  const handleBuyLife = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // This would call a buy-life function if it exists in your contract
      console.log('Buy life functionality - implement in contract');
      alert('Buy life functionality not yet implemented in contract');
    } catch (error) {
      console.error('Failed to buy life:', error);
      alert('Failed to buy life. Please try again.');
    }
  };

  return (
    <div className="gameCanvas">
      <canvas 
        ref={canvasRef}
        id="gameCanvas"
        width="800" 
        height="600"
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'block',
          background: 'linear-gradient(180deg, #87CEEB 0%, #98FB98 100%)'
        }}
      />
      
      {/* Game UI Overlay */}
      <div className="gameUI">
        <div className="score" id="scoreDisplay">Score: 0</div>
        <div className="coins" id="coinsDisplay">Coins: 0</div>
        
        {/* Game Controls */}
        <div className="gameControls">
          <button onClick={() => handleFinalizeScore(1000)}>
            Submit Score (Test)
          </button>
          <button onClick={() => handleClaimReward(1)}>
            Claim Reward (Test)
          </button>
          <button onClick={handleBuyLife}>
            Buy Life (Test)
          </button>
        </div>

        {/* Wallet Status */}
        <div className="walletStatus">
          {isConnected ? (
            <span style={{ color: '#00ff00' }}>✓ Wallet Connected</span>
          ) : (
            <span style={{ color: '#ff4444' }}>✗ Wallet Not Connected</span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {!gameLoaded && (
        <div className="gameLoading">
          <div>Loading Game...</div>
        </div>
      )}
    </div>
  );
};