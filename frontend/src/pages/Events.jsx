import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';

export default function Events() {
  const { contract, loading } = useWeb3();
  const [events, setEvents] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (contract) {
      fetchEvents();
    } else if (!loading) {
      setFetching(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, loading]);

  const fetchEvents = async () => {
    try {
      setFetching(true);
      // Fetch up to 50 events using the helper function
      const data = await contract.getEvents(0, 50);
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setFetching(false);
    }
  };

  if (loading || fetching) {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Events...</div>;
  }

  if (!contract) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Wallet not connected</h2>
        <p style={{ color: 'var(--text-muted)' }}>Connect your wallet to view prediction events.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem' }}>Prediction Markets</h2>
      </div>

      {events.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>No Events Found</h3>
          <p>Be the first to create a prediction event!</p>
        </div>
      ) : (
        <>
          {(() => {
            const now = new Date();
            const liveEvents = events.filter(ev => {
              const endTime = new Date(Number(ev.endTime) * 1000);
              return endTime > now && !ev.resolved;
            });
            const completedEvents = events.filter(ev => {
              const endTime = new Date(Number(ev.endTime) * 1000);
              return endTime <= now || ev.resolved;
            });

            const renderEventCard = (ev) => {
              const yesPool = Number(ethers.formatEther(ev.totalYesPool));
              const noPool = Number(ethers.formatEther(ev.totalNoPool));
              const totalPool = yesPool + noPool;
              const yesPercent = totalPool > 0 ? (yesPool / totalPool) * 100 : 50;
              const noPercent = totalPool > 0 ? (noPool / totalPool) * 100 : 50;
              const endTime = new Date(Number(ev.endTime) * 1000);
              const isEnded = endTime < now;

              return (
                <Link to={`/events/${ev.id}`} key={ev.id.toString()} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', border: ev.resolved ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        backgroundColor: ev.resolved ? 'rgba(59, 130, 246, 0.2)' : (isEnded ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'),
                        color: ev.resolved ? 'var(--primary)' : (isEnded ? 'var(--danger)' : 'var(--success)')
                      }}>
                        {ev.resolved ? 'Resolved' : (isEnded ? 'Ended' : 'Active')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Vol: {totalPool.toFixed(2)} SHM
                      </span>
                    </div>
                    
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{ev.title}</h3>
                    
                    {(() => {
                      let creatorName = "Admin";
                      let displayDesc = ev.description;
                      if (displayDesc && displayDesc.includes('|||')) {
                        const parts = displayDesc.split('|||');
                        creatorName = parts[0];
                        displayDesc = parts.slice(1).join('|||');
                      }
                      return (
                        <>
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Created by: {creatorName}
                          </div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', flexGrow: 1 }}>
                            {displayDesc.length > 80 ? displayDesc.substring(0, 80) + '...' : displayDesc}
                          </p>
                        </>
                      );
                    })()}
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--success)' }}>YES {yesPercent.toFixed(0)}%</span>
                        <span style={{ color: 'var(--danger)' }}>NO {noPercent.toFixed(0)}%</span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-yes" style={{ width: `${yesPercent}%` }}></div>
                        <div className="progress-no" style={{ width: `${noPercent}%` }}></div>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                      {ev.resolved ? `Result: ${ev.result ? 'YES' : 'NO'}` : `Ends: ${endTime.toLocaleDateString()}`}
                    </div>
                  </div>
                </Link>
              );
            };

            return (
              <>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--success)', borderLeft: '4px solid var(--success)', paddingLeft: '1rem' }}>Live Events</h3>
                {liveEvents.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>No active events at the moment.</p>
                ) : (
                  <div className="grid grid-cols-3" style={{ marginBottom: '4rem' }}>
                    {liveEvents.map(renderEventCard)}
                  </div>
                )}

                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-muted)', borderLeft: '4px solid var(--text-muted)', paddingLeft: '1rem' }}>Completed Events</h3>
                {completedEvents.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No completed events yet.</p>
                ) : (
                  <div className="grid grid-cols-3">
                    {completedEvents.map(renderEventCard)}
                  </div>
                )}
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}
