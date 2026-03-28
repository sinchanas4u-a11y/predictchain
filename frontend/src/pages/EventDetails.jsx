import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { ArrowLeft, CheckCircle, AlertCircle, Wallet } from 'lucide-react';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contract, account, loading } = useWeb3();
  
  const [eventData, setEventData] = useState(null);
  const [userStake, setUserStake] = useState({ yes: 0, no: 0, claimed: false });
  const [stakeAmount, setStakeAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (contract && id !== undefined) {
      loadEventDetails();
      checkOwner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, id, account]);

  const checkOwner = async () => {
    try {
      const owner = await contract.owner();
      if (account && owner.toLowerCase() === account.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadEventDetails = async () => {
    try {
      const data = await contract.events(id);
      if (data.id.toString() !== id.toString()) {
        // Event might not exist
        return;
      }
      setEventData(data);

      if (account) {
        const uStake = await contract.userStakes(id, account);
        setUserStake({
          yes: Number(ethers.formatEther(uStake.yesStake)),
          no: Number(ethers.formatEther(uStake.noStake)),
          claimed: uStake.claimed
        });
      }
    } catch (err) {
      console.error("Failed to load event details", err);
    }
  };

  const handleStake = async (isYes) => {
    if (!stakeAmount || isNaN(stakeAmount) || Number(stakeAmount) <= 0) return;
    
    try {
      setIsSubmitting(true);
      const value = ethers.parseEther(stakeAmount.toString());
      const tx = await contract.placePrediction(id, isYes, { value });
      await tx.wait();
      
      setStakeAmount('');
      await loadEventDetails();
      alert("Stake placed successfully!");
    } catch (err) {
      console.error(err);
      alert(err.reason || "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (result) => {
    try {
      setIsSubmitting(true);
      const tx = await contract.resolvePrediction(id, result);
      await tx.wait();
      await loadEventDetails();
      alert("Event resolved successfully!");
    } catch (err) {
      console.error(err);
      alert(err.reason || "Failed to resolve event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaim = async () => {
    try {
      setIsClaiming(true);
      const tx = await contract.claimReward(id);
      await tx.wait();
      await loadEventDetails();
      alert("Reward claimed successfully!");
    } catch (err) {
      console.error(err);
      alert(err.reason || "Failed to claim reward. Make sure you won.");
    } finally {
      setIsClaiming(false);
    }
  };

  if (loading || !eventData) {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Event...</div>;
  }

  const yesPool = Number(ethers.formatEther(eventData.totalYesPool));
  const noPool = Number(ethers.formatEther(eventData.totalNoPool));
  const totalPool = yesPool + noPool;
  
  const yesPercent = totalPool > 0 ? (yesPool / totalPool) * 100 : 50;
  const noPercent = totalPool > 0 ? (noPool / totalPool) * 100 : 50;
  
  const endTime = new Date(Number(eventData.endTime) * 1000);
  const isEnded = endTime < new Date();
  const canStake = !isEnded && !eventData.resolved;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-outline" 
        style={{ marginBottom: '2rem', padding: '0.5rem 1rem' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{eventData.title}</h1>
          
          <div style={{ textAlign: 'right' }}>
            <span style={{ 
              display: 'inline-block',
              fontSize: '0.875rem', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '999px', 
              marginBottom: '0.5rem',
              backgroundColor: eventData.resolved ? 'rgba(59, 130, 246, 0.2)' : (isEnded ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'),
              color: eventData.resolved ? 'var(--primary)' : (isEnded ? 'var(--danger)' : 'var(--success)')
            }}>
              {eventData.resolved ? 'Resolved' : (isEnded ? 'Ended' : 'Active')}
            </span>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Ends: {endTime.toLocaleString()}
            </div>
          </div>
        </div>

        {(() => {
          let creatorName = "Admin";
          let displayDesc = eventData.description;
          if (displayDesc && displayDesc.includes('|||')) {
            const parts = displayDesc.split('|||');
            creatorName = parts[0];
            displayDesc = parts.slice(1).join('|||');
          }
          return (
            <div style={{ marginBottom: '2rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Description</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                  Created by: {creatorName}
                </span>
              </div>
              <p style={{ lineHeight: '1.6' }}>{displayDesc}</p>
            </div>
          );
        })()}

        {eventData.resolved && (
          <div style={{ marginBottom: '2rem', padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle color="var(--primary)" size={24} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                Result: {eventData.result ? 'YES' : 'NO'} Won
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>This event has been resolved by the administrator.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2" style={{ marginBottom: '2rem', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 'bold' }}>YES Pool</span>
              <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{yesPercent.toFixed(1)}%</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{yesPool.toFixed(4)} SHM</div>
            
            {canStake && (
              <button 
                className="btn btn-success" 
                style={{ width: '100%' }}
                onClick={() => handleStake(true)}
                disabled={isSubmitting || !stakeAmount}
              >
                Stake on YES
              </button>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 'bold' }}>NO Pool</span>
              <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{noPercent.toFixed(1)}%</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{noPool.toFixed(4)} SHM</div>
            
            {canStake && (
              <button 
                className="btn btn-danger" 
                style={{ width: '100%' }}
                onClick={() => handleStake(false)}
                disabled={isSubmitting || !stakeAmount}
              >
                Stake on NO
              </button>
            )}
          </div>
        </div>

        <div className="progress-bar-container" style={{ height: '12px', marginBottom: '2rem' }}>
          <div className="progress-yes" style={{ width: `${yesPercent}%` }}></div>
          <div className="progress-no" style={{ width: `${noPercent}%` }}></div>
        </div>

        {canStake && (
          <div>
            <label className="label">Amount to Stake (SHM)</label>
            <input 
              type="number" 
              className="input-glass" 
              placeholder="0.0" 
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              min="0.0001"
              step="0.0001"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wallet size={20} color="var(--primary)" /> Your Portfolio
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Staked on YES:</span>
            <span style={{ fontWeight: 'bold' }}>{userStake.yes.toFixed(4)} SHM</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Staked on NO:</span>
            <span style={{ fontWeight: 'bold' }}>{userStake.no.toFixed(4)} SHM</span>
          </div>

          {eventData.resolved && !userStake.claimed && (
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={handleClaim}
              disabled={isClaiming || (eventData.result ? userStake.yes === 0 : userStake.no === 0)}
            >
              {isClaiming ? "Claiming..." : "Claim Reward"}
            </button>
          )}

          {userStake.claimed && (
            <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              Reward Claimed!
            </div>
          )}
        </div>

        {isOwner && !eventData.resolved && isEnded && (
          <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--primary)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={20} color="var(--primary)" /> Admin Actions
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              As the contract owner, you can resolve this event since it has reached its end time.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-success" 
                style={{ flex: 1 }}
                onClick={() => handleResolve(true)}
                disabled={isSubmitting}
              >
                Resolve YES
              </button>
              <button 
                className="btn btn-danger" 
                style={{ flex: 1 }}
                onClick={() => handleResolve(false)}
                disabled={isSubmitting}
              >
                Resolve NO
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
