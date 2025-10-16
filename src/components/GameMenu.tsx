import React from 'react';
import { WalletButton } from './WalletButton';

interface GameMenuProps {
  onPlayClick: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({ onPlayClick }) => {
  const handlePlayClick = () => {
    onPlayClick();
  };

  return (
    <div className="menu">
      <div className='menuButton' onClick={handlePlayClick}>
        <img src="/assets/gui/Play.png" alt="" />
        play
      </div>
      
      <div id="walletArea">
        <WalletButton />
      </div>
      
      <div className='menuButton'>
        <img src="/assets/gui/achives.png" alt="" />
        achives
      </div>
      
      <div className='menuButton'>
        <img src="/assets/gui/store.png" alt="" />
        store
      </div>
      
      <div className='menuButton'>
        <img src="/assets/gui/info.png" alt="" />
        info
      </div>
    </div>
  );
};