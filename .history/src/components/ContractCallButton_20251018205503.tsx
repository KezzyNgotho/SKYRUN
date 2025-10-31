import React from 'react';
import { useWallet } from '../contexts/WalletContext';

interface ContractCallButtonProps {
  contractName: string;
  functionName: string;
  functionArgs: any[];
  children: React.ReactNode;
  className?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

export const ContractCallButton: React.FC<ContractCallButtonProps> = ({
  contractName,
  functionName,
  functionArgs,
  children,
  className = '',
  onSuccess,
  onError,
  disabled = false
}) => {
  const { isConnected, callContract, getContractId } = useWallet();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const contractId = getContractId(contractName);
      if (!contractId) {
        throw new Error(`Contract ${contractName} not found`);
      }

      const result = await callContract(contractId, functionName, functionArgs);
      console.log('Contract call successful:', result);
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        alert('Transaction submitted successfully!');
      }
    } catch (error) {
      console.error('Contract call failed:', error);
      
      if (onError) {
        onError(error as Error);
      } else {
        alert(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`contract-call-button ${className} ${isLoading ? 'loading' : ''}`}
      onClick={handleClick}
      disabled={disabled || isLoading || !isConnected}
      title={!isConnected ? 'Connect wallet first' : `Call ${contractName}.${functionName}`}
    >
      {isLoading ? (
        <>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};

// Add display name for React Fast Refresh
ContractCallButton.displayName = 'ContractCallButton';

// Convenience components for common contract calls
export const SubmitScoreButton: React.FC<{
  score: number;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  className?: string;
}> = ({ score, onSuccess, onError, className }) => (
  <ContractCallButton
    contractName="CoinQuestGame"
    functionName="submit_game_score"
    functionArgs={[score]}
    onSuccess={onSuccess}
    onError={onError}
    className={className}
  >
    Submit Score ({score})
  </ContractCallButton>
);

export const ClaimRewardButton: React.FC<{
  questId?: number;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  className?: string;
}> = ({ questId = 1, onSuccess, onError, className }) => (
  <ContractCallButton
    contractName="CoinQuestGame"
    functionName="claim_quest_reward"
    functionArgs={[questId]}
    onSuccess={onSuccess}
    onError={onError}
    className={className}
  >
    Claim Reward (Quest {questId})
  </ContractCallButton>
);

export const BuyLifeButton: React.FC<{
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  className?: string;
}> = ({ onSuccess, onError, className }) => (
  <ContractCallButton
    contractName="CoinQuestGame"
    functionName="buy_lifeline"
    functionArgs={[]}
    onSuccess={onSuccess}
    onError={onError}
    className={className}
  >
    Buy Life
  </ContractCallButton>
);
