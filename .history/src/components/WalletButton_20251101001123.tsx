import React from 'react';
import { useHashpack } from '../contexts/HashpackContext';

export const WalletButton: React.FC = () => {
  const { connected, accountId, connect, disconnect, walletName } = useHashpack();

  const handleClick = async () => {
    if (connected) {
      await disconnect();
    } else {
      await connect();
    }
  };

  const displayAccountId = accountId ? `${accountId.slice(0, 4)}...${accountId.slice(-4)}` : '';

  return (
    <div className="wallet-button">
      <button onClick={handleClick} className="wallet-btn">
        {connected ? (
          <>
            <span className="wallet-status connected">●</span>
            {displayAccountId || walletName || 'Connected'}
          </>
        ) : (
          <>
            <span className="wallet-status disconnected">●</span>
            Connect Wallet
          </>
        )}
      </button>
    </div>
  );
};

