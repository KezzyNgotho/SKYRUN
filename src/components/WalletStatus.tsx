import React from 'react';
import { useWallet } from '../contexts/WalletContext';

interface WalletStatusProps {
  className?: string;
  showDetails?: boolean;
}

export const WalletStatus: React.FC<WalletStatusProps> = ({ 
  className = '',
  showDetails = true 
}) => {
  const { 
    address, 
    stxBalance, 
    isConnected, 
    isConnecting, 
    error,
    refreshBalance 
  } = useWallet();

  const shortenAddress = (addr: string) => {
    if (!addr || addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (balance: number | null) => {
    if (balance === null) return '0.00';
    return balance.toFixed(2);
  };

  if (error) {
    return (
      <div className={`wallet-status error ${className}`}>
        <div className="status-icon">⚠️</div>
        <div className="status-text">
          <div className="status-title">Connection Error</div>
          <div className="status-detail">{error}</div>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className={`wallet-status connecting ${className}`}>
        <div className="status-icon">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
        <div className="status-text">
          <div className="status-title">Connecting...</div>
          <div className="status-detail">Please wait</div>
        </div>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className={`wallet-status connected ${className}`}>
        <div className="status-icon">✅</div>
        <div className="status-text">
          <div className="status-title">Wallet Connected</div>
          {showDetails && (
            <div className="status-details">
              <div className="address">Address: {shortenAddress(address)}</div>
              <div className="balance">
                Balance: {formatBalance(stxBalance)} STX
                <button 
                  className="refresh-button"
                  onClick={() => refreshBalance(address || '')}
                  title="Refresh balance"
                >
                  🔄
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`wallet-status disconnected ${className}`}>
      <div className="status-icon">❌</div>
      <div className="status-text">
        <div className="status-title">Wallet Not Connected</div>
        <div className="status-detail">Connect to interact with contracts</div>
      </div>
    </div>
  );
};

// Add display name for React Fast Refresh
WalletStatus.displayName = 'WalletStatus';