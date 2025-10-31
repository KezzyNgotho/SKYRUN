import React, { useEffect } from 'react';
import { HashpackProvider } from './contexts/HashpackContext';
import './App.css';
import { HederaActions } from './components/HederaActions';

// Placeholder component - HashpackContext already exposes window.connectWallet
const WalletBridge: React.FC = () => {
  return null;
};

function App() {
  // Game state removed - all functionality handled by main game.js

  // Debug logging
  useEffect(() => {
    console.log('🚀 App component mounted');
  }, []);

  return (
    <HashpackProvider>
      <WalletBridge />
      <div className="App">
        {/* All game functionality handled by main game.js - no React UI needed */}
        <HederaActions />
      </div>
    </HashpackProvider>
  );
}

export default App;
