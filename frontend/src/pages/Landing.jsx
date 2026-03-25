import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';

export default function Landing() {
  return (
    <div style={{ padding: '4rem 0', textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '1.5rem', background: 'linear-gradient(to right, var(--primary), var(--success))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Predict the Future. <br /> Earn Rewards.
      </h1>
      
      <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>
        A fully decentralized, trustless prediction market built on Shardeum. 
        Stake tokens on your beliefs and claim your share of the pool when you are right.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
        <Link to="/user-login" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none' }}>
          User Login <ArrowRight size={20} />
        </Link>
        <Link to="/admin-login" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none' }}>
          Event Creator Login
        </Link>
      </div>
      
      <div className="grid grid-cols-3" style={{ textAlign: 'left', marginTop: '4rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <TrendingUp color="var(--primary)" size={32} style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Proportional Rewards</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Rewards are distributed automatically by smart contracts based on the pool size and your staked amount.
          </p>
        </div>
        
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <Shield color="var(--success)" size={32} style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Trustless & Secure</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Funds are locked in a verified Shardeum smart contract until the event is resolved by the administrator.
          </p>
        </div>
        
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <Zap color="#f59e0b" size={32} style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Fast & Low Fees</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Powered by Shardeum Sphinx testnet, ensuring instant finality and near-zero transaction costs.
          </p>
        </div>
      </div>
    </div>
  );
}
