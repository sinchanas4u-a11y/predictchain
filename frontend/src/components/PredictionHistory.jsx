import React, { useEffect, useState, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

export default function PredictionHistory({ account }) {
  const { contract } = useWeb3();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!contract || !account) return;
    
    try {
      setLoading(true);
      
      // 1. Query all StakePlaced events for this user
      const filter = contract.filters.StakePlaced(null, account);
      const logs = await contract.queryFilter(filter);
      
      // 2. Get unique event IDs the user participated in
      const eventIds = [...new Set(logs.map(log => log.args.eventId.toString()))];
      
      // 3. Fetch details for each event
      const historyData = await Promise.all(eventIds.map(async (id) => {
        const ev = await contract.events(id);
        const userStake = await contract.userStakes(id, account);
        
        const yesStake = Number(ethers.formatEther(userStake.yesStake));
        const noStake = Number(ethers.formatEther(userStake.noStake));
        
        const now = new Date();
        const endTime = new Date(Number(ev.endTime) * 1000);
        const isEnded = endTime <= now;
        
        let status = 'Active';
        let outcome = 'Pending';
        
        if (ev.resolved) {
          status = 'Completed';
          const won = (ev.result && yesStake > 0) || (!ev.result && noStake > 0);
          outcome = won ? 'Won' : 'Lost';
        } else if (isEnded) {
          status = 'Ended';
        }

        return {
          id,
          title: ev.title,
          yesStake,
          noStake,
          totalStake: yesStake + noStake,
          prediction: yesStake > 0 ? 'YES' : 'NO',
          status,
          outcome,
          resolved: ev.resolved,
          result: ev.result
        };
      }));

      // Sort by ID descending (newest first)
      setHistory(historyData.sort((a, b) => Number(b.id) - Number(a.id)));
    } catch (err) {
      console.error("Error fetching prediction history:", err);
    } finally {
      setLoading(false);
    }
  }, [contract, account]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading history...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <Clock size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ color: 'var(--text-muted)' }}>No Predictions Yet</h3>
        <p>Your betting history will appear here once you place a prediction.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '1rem' }}>Event</th>
              <th style={{ padding: '1rem' }}>Prediction</th>
              <th style={{ padding: '1rem' }}>Stake</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Outcome</th>
              <th style={{ padding: '1rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{item.title}</td>
                <td style={{ padding: '1rem' }}>
                   <span style={{ 
                     padding: '0.2rem 0.5rem', 
                     borderRadius: '4px', 
                     fontSize: '0.75rem',
                     fontWeight: 'bold',
                     backgroundColor: item.prediction === 'YES' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                     color: item.prediction === 'YES' ? 'var(--success)' : 'var(--danger)'
                   }}>
                     {item.prediction}
                   </span>
                </td>
                <td style={{ padding: '1rem' }}>{item.totalStake.toFixed(4)} SHM</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ color: item.status === 'Active' ? 'var(--success)' : 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  {item.outcome === 'Won' && (
                    <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}>
                      <CheckCircle size={16} /> Won
                    </span>
                  )}
                  {item.outcome === 'Lost' && (
                    <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <XCircle size={16} /> Lost
                    </span>
                  )}
                  {item.outcome === 'Pending' && (
                    <span style={{ color: 'var(--text-muted)' }}>Pending</span>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <Link to={`/events/${item.id}`} style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', fontSize: '0.875rem' }}>
                    Details <ExternalLink size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
