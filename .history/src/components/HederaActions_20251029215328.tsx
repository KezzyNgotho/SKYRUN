import React from 'react';
import { useSkyRunActions } from '../utils/hederaHashpack';
import { useHashpack } from '../contexts/HashpackContext';

export const HederaActions: React.FC = () => {
  const [status, setStatus] = React.useState<string>("");
  const { submitScore, claimReward } = useSkyRunActions();
  const { connected, accountId } = useHashpack();

  const handleSubmit = async () => {
    try {
      setStatus('Submitting score...');
      const receipt = await submitScore(100);
      setStatus(`Submitted. tx: ${JSON.stringify(receipt?.receipt) || 'ok'}`);
    } catch (e: any) {
      setStatus(`Error: ${e?.message || e}`);
    }
  };

  const handleClaim = async () => {
    try {
      setStatus('Claiming quest 1...');
      const receipt = await claimReward(1);
      setStatus(`Claimed. tx: ${JSON.stringify(receipt?.receipt) || 'ok'}`);
    } catch (e: any) {
      setStatus(`Error: ${e?.message || e}`);
    }
  };

  const handleStats = async () => {
    try {
      setStatus('Fetching stats...');
      setStatus(`Connected: ${connected} ${accountId || ''}`);
    } catch (e: any) {
      setStatus(`Error: ${e?.message || e}`);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, background: '#111', color: '#fff', padding: 12, borderRadius: 8, zIndex: 9999 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Hedera Test Actions</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleSubmit}>Submit Score 100</button>
        <button onClick={handleClaim}>Claim Quest 1</button>
        <button onClick={handleStats}>Get My Stats</button>
      </div>
      {status && <div style={{ marginTop: 8, fontSize: 12 }}>{status}</div>}
    </div>
  );
};


