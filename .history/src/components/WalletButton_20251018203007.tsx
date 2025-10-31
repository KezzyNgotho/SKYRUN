import React, { useState } from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { NeonButton } from './ui/neon-button';
import { useWallet } from '../contexts/WalletContext';

export const WalletButton: React.FC = () => {
  const { isConnected, address, stxBalance, connectWallet, disconnectWallet, isConnecting } = useWallet();
  const [localConnecting, setLocalConnecting] = useState(false);

  const handleConnect = async () => {
    setLocalConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
    setLocalConnecting(false);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const connecting = isConnecting || localConnecting;

  if (!isConnected) {
    return (
      <NeonButton
        onClick={handleConnect}
        disabled={connecting}
        className="gap-2"
      >
        <Wallet className="w-4 h-4" />
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </NeonButton>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <div className="text-sm text-gray-500">Balance</div>
        <div className="text-lg font-bold text-blue-600">
          {stxBalance ? stxBalance.toFixed(2) : '0.00'} STX
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm text-gray-500">Connected</div>
        <div className="text-sm font-mono text-blue-600">
          {address ? truncateAddress(address) : 'Loading...'}
        </div>
      </div>
      <NeonButton
        variant="ghost"
        size="icon"
        onClick={disconnectWallet}
        className="ml-2"
        title="Disconnect Wallet"
      >
        <LogOut className="w-4 h-4" />
      </NeonButton>
    </div>
  );
};

// Add display name for React Fast Refresh
WalletButton.displayName = 'WalletButton';