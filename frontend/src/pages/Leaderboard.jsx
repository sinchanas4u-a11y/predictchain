import React from 'react';
import { Trophy } from 'lucide-react';

export default function Leaderboard() {
  // Static mock data for leaderboard as fetching full historical accurate stats 
  // from contract would require an indexer (like TheGraph)
  const mockLeaders = [
    { rank: 1, address: '0x1A2b...3c4D', wins: 24, volume: '145.5 SHM', accuracy: '82%' },
    { rank: 2, address: '0x8f9c...d1A2', wins: 18, volume: '98.2 SHM', accuracy: '75%' },
    { rank: 3, address: '0xE15b...4F9a', wins: 15, volume: '82.0 SHM', accuracy: '78%' },
    { rank: 4, address: '0x3C01...8B7e', wins: 12, volume: '45.1 SHM', accuracy: '66%' },
    { rank: 5, address: '0x4D22...1A3f', wins: 9, volume: '33.8 SHM', accuracy: '60%' }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Trophy size={48} color="#f59e0b" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Top Predictors</h2>
        <p style={{ color: 'var(--text-muted)' }}>The most accurate and active users on the platform</p>
      </div>
      
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(0,0,0,0.2)', textAlign: 'left' }}>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '500' }}>Rank</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '500' }}>User Address</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '500' }}>Predictions Won</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '500' }}>Volume Staked</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '500' }}>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {mockLeaders.map((leader, index) => (
              <tr 
                key={leader.rank} 
                style={{ 
                  borderTop: '1px solid var(--glass-border)',
                  backgroundColor: index === 0 ? 'rgba(245, 158, 11, 0.05)' : 'transparent'
                }}
              >
                <td style={{ padding: '1.5rem', fontWeight: 'bold', color: index < 3 ? '#f59e0b' : 'inherit' }}>
                  #{leader.rank}
                </td>
                <td style={{ padding: '1.5rem', fontFamily: 'monospace' }}>{leader.address}</td>
                <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>{leader.wins}</td>
                <td style={{ padding: '1.5rem' }}>{leader.volume}</td>
                <td style={{ padding: '1.5rem', color: 'var(--success)' }}>{leader.accuracy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        * Note: Leaderboard statistics are updated periodically from on-chain data.
      </div>
    </div>
  );
}
