import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWallet } from '../contexts/WalletContext';

interface GameState {
  score: number;
  coins: number;
  lives: number;
  gameRunning: boolean;
  gameOver: boolean;
  lastRunScore: number;
  lastRunCoins: number;
}

const CoinQuestGame: React.FC = () => {
  const wallet = useWallet();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    coins: 0,
    lives: 3,
    gameRunning: false,
    gameOver: false,
    lastRunScore: 0,
    lastRunCoins: 0
  });

  // Debug logging
  useEffect(() => {
    console.log('🎮 CoinQuestGame component mounted');
    console.log('🎮 Wallet connected:', wallet.isConnected);
    console.log('🎮 Wallet address:', wallet.address);
  }, [wallet.isConnected, wallet.address]);

  // Load saved game state from localStorage
  useEffect(() => {
    const savedScore = localStorage.getItem('lastRunScore');
    const savedCoins = localStorage.getItem('lastRunCoins');
    
    if (savedScore && savedCoins) {
      setGameState(prev => ({
        ...prev,
        lastRunScore: parseInt(savedScore),
        lastRunCoins: parseInt(savedCoins)
      }));
    }
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameState.gameRunning || gameState.gameOver) return;

    setGameState(prev => ({
      ...prev,
      score: prev.score + 1,
      coins: prev.coins + 1
    }));
  }, [gameState.gameRunning, gameState.gameOver]);

  // Start game loop
  useEffect(() => {
    if (gameState.gameRunning && !gameState.gameOver) {
      gameLoopRef.current = window.setInterval(gameLoop, 100);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.gameRunning, gameState.gameOver, gameLoop]);

  // Start game
  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      coins: 0,
      lives: 3,
      gameRunning: true,
      gameOver: false
    }));
  };

  // End game
  const endGame = async () => {
    setGameState(prev => ({
      ...prev,
      gameRunning: false,
      gameOver: true,
      lastRunScore: prev.score,
      lastRunCoins: prev.coins
    }));

    // Save to localStorage
    localStorage.setItem('lastRunScore', gameState.score.toString());
    localStorage.setItem('lastRunCoins', gameState.coins.toString());

    // Submit score to blockchain if wallet is connected
    if (wallet.isConnected) {
      try {
        console.log('🏆 Submitting score to blockchain:', gameState.score);
        const contractId = wallet.getContractId('CoinQuestGame');
        if (contractId) {
          const { uintCV } = await import('@stacks/transactions');
          const result = await wallet.callContract(contractId, 'submit_game_score', [uintCV(gameState.score)]);
          console.log('✅ Score submitted successfully:', result);
          alert(`✅ Score submitted successfully! You earned tokens for ${gameState.score} points.`);
        }
      } catch (error) {
        console.error('❌ Failed to submit score:', error);
        alert(`❌ Failed to submit score: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  // Buy lifeline
  const buyLifeline = async () => {
    console.log('🛒 === BUY LIFELINE CLICKED ===');
    console.log('🛒 Wallet connected:', wallet.isConnected);
    console.log('🛒 Wallet address:', wallet.address);
    
    if (!wallet.isConnected) {
      console.log('❌ Wallet not connected for lifeline purchase');
      alert('Please connect your wallet first!');
      return;
    }

    try {
      console.log('🛒 Starting lifeline purchase...');
      const contractId = wallet.getContractId('CoinQuestGame');
      console.log('🛒 Contract ID:', contractId);
      
      if (contractId) {
        console.log('🛒 Calling buy_lifeline contract function...');
        const result = await wallet.callContract(contractId, 'buy_lifeline', []);
        console.log('✅ Lifeline purchased successfully:', result);
        
        setGameState(prev => ({
          ...prev,
          lives: prev.lives + 1
        }));
        
        alert('✅ Lifeline purchased successfully!');
      } else {
        console.error('❌ Contract ID not found');
        alert('❌ Contract not found');
      }
    } catch (error) {
        console.error('❌ Failed to buy lifeline:', error);
        console.error('❌ Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined
        });
        alert(`❌ Failed to buy lifeline: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Claim quest reward
  const claimQuestReward = async () => {
    if (!wallet.isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      console.log('🎁 Claiming quest reward...');
      const contractId = wallet.getContractId('CoinQuestGame');
      if (contractId) {
        const { uintCV } = await import('@stacks/transactions');
        const result = await wallet.callContract(contractId, 'claim_quest_reward', [uintCV(1)]);
        console.log('✅ Quest reward claimed successfully:', result);
        alert('✅ Quest reward claimed successfully!');
      }
    } catch (error) {
      console.error('❌ Failed to claim quest reward:', error);
      alert(`❌ Failed to claim quest reward: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Lose life
  const loseLife = () => {
    setGameState(prev => {
      const newLives = prev.lives - 1;
      if (newLives <= 0) {
        return {
          ...prev,
          lives: 0,
          gameRunning: false,
          gameOver: true,
          lastRunScore: prev.score,
          lastRunCoins: prev.coins
        };
      }
      return {
        ...prev,
        lives: newLives
      };
    });
  };

  return (
    <div className="coinquest-game">
      <div className="game-header">
        <h2>CoinQuest Game</h2>
        <div className="wallet-status">
          {wallet.isConnected ? (
            <span className="connected">✅ Wallet Connected: {wallet.address?.slice(0, 6)}...</span>
          ) : (
            <span className="disconnected">❌ Wallet Disconnected</span>
          )}
        </div>
        <button 
          onClick={() => {
            console.log('🧪 Test button clicked!');
            console.log('🧪 Wallet state:', { isConnected: wallet.isConnected, address: wallet.address });
            console.log('🧪 Available functions:', {
              callContract: typeof wallet.callContract,
              getContractId: typeof wallet.getContractId,
              debugWallet: typeof window.debugWallet
            });
          }}
          style={{ marginLeft: '10px', padding: '5px 10px', fontSize: '12px' }}
        >
          Test Console
        </button>
      </div>

      <div className="game-stats">
        <div className="stat">
          <span className="label">Score:</span>
          <span className="value">{gameState.score}</span>
        </div>
        <div className="stat">
          <span className="label">Coins:</span>
          <span className="value">{gameState.coins}</span>
        </div>
        <div className="stat">
          <span className="label">Lives:</span>
          <span className="value">{gameState.lives}</span>
        </div>
      </div>

      <div className="game-canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="game-canvas"
          onClick={loseLife} // Click to lose life for testing
        />
        <div className="game-overlay">
          {!gameState.gameRunning && !gameState.gameOver && (
            <div className="start-screen">
              <h3>Welcome to CoinQuest!</h3>
              <p>Click "Start Game" to begin your adventure!</p>
              <button onClick={startGame} className="start-button">
                Start Game
              </button>
            </div>
          )}
          
          {gameState.gameOver && (
            <div className="game-over-screen">
              <h3>Game Over!</h3>
              <p>Final Score: {gameState.lastRunScore}</p>
              <p>Coins Earned: {gameState.lastRunCoins}</p>
              <div className="game-over-actions">
                <button onClick={startGame} className="restart-button">
                  Play Again
                </button>
                {wallet.isConnected && (
                  <button onClick={claimQuestReward} className="claim-button">
                    Claim Rewards
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="game-controls">
        {gameState.gameRunning && (
          <>
            <button onClick={endGame} className="end-game-button">
              End Game
            </button>
            <button onClick={loseLife} className="lose-life-button">
              Lose Life (Test)
            </button>
            {wallet.isConnected && (
              <button onClick={buyLifeline} className="buy-life-button">
                Buy Lifeline
              </button>
            )}
          </>
        )}
      </div>

      <div className="last-run-info">
        <h4>Last Run Results:</h4>
        <p>Score: {gameState.lastRunScore}</p>
        <p>Coins: {gameState.lastRunCoins}</p>
        {wallet.isConnected && gameState.lastRunScore > 0 && (
          <button onClick={claimQuestReward} className="claim-last-run-button">
            Claim Last Run Rewards
          </button>
        )}
      </div>

      <style>{`
        .coinquest-game {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .game-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .wallet-status {
          font-size: 14px;
        }

        .wallet-status .connected {
          color: #22c55e;
        }

        .wallet-status .disconnected {
          color: #ef4444;
        }

        .game-stats {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
          background: #f3f4f6;
          border-radius: 8px;
          min-width: 80px;
        }

        .stat .label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .stat .value {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
        }

        .game-canvas-container {
          position: relative;
          margin-bottom: 20px;
        }

        .game-canvas {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
        }

        .game-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 8px;
        }

        .start-screen,
        .game-over-screen {
          text-align: center;
          color: white;
          padding: 20px;
        }

        .start-screen h3,
        .game-over-screen h3 {
          margin-bottom: 10px;
          font-size: 24px;
        }

        .start-screen p,
        .game-over-screen p {
          margin-bottom: 20px;
          font-size: 16px;
        }

        .game-over-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .start-button,
        .restart-button {
          background: #22c55e;
          color: white;
        }

        .start-button:hover,
        .restart-button:hover {
          background: #16a34a;
        }

        .end-game-button {
          background: #ef4444;
          color: white;
        }

        .end-game-button:hover {
          background: #dc2626;
        }

        .claim-button,
        .claim-last-run-button {
          background: #3b82f6;
          color: white;
        }

        .claim-button:hover,
        .claim-last-run-button:hover {
          background: #2563eb;
        }

        .buy-life-button {
          background: #f59e0b;
          color: white;
        }

        .buy-life-button:hover {
          background: #d97706;
        }

        .lose-life-button {
          background: #6b7280;
          color: white;
        }

        .lose-life-button:hover {
          background: #4b5563;
        }

        .game-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .last-run-info {
          padding: 15px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .last-run-info h4 {
          margin-bottom: 10px;
          color: #1f2937;
        }

        .last-run-info p {
          margin-bottom: 5px;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default CoinQuestGame;
