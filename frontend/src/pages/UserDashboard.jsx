import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Events from './Events';
import PredictionHistory from '../components/PredictionHistory';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/useAuth';
import { Wallet, LayoutDashboard, History } from 'lucide-react';

export default function UserDashboard() {
  const { account } = useWeb3();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('market'); // 'market' or 'history'

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'user')) {
      navigate('/user-login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading Dashboard...</div>;
  if (!user || user.role !== 'user') return null;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem' }}>User Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome! Browse active markets, place predictions, and claim rewards.</p>
        </div>
        {account && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
            <Wallet size={20} color="var(--primary)" />
            <span style={{ fontWeight: '500' }}>
              {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'market' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('market')}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <LayoutDashboard size={18} /> Prediction Market
        </button>
        <button 
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('history')}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <History size={18} /> Prediction History
        </button>
      </div>

      {activeTab === 'market' ? (
        <Events />
      ) : (
        <PredictionHistory account={account} />
      )}
    </div>
  );
}
