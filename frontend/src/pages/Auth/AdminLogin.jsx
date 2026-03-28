import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(username, password, 'admin');
      if (result.success) {
        navigate('/admin');
      } else {
        setError(result.message || 'Invalid username or password');
      }
    } catch (err) {
      console.error('Admin Login error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid rgba(16, 185, 129, 0.3)' }} className="glass-panel animate-fade-in">
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--success)' }}>Event Creator Login</h2>
      
      {error && (
        <div style={{ padding: '0.75rem', marginBottom: '1.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label">Admin Username</label>
          <input 
            type="text" 
            className="input-glass" 
            placeholder="Enter admin username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <label className="label">Admin Password</label>
          <input 
            type="password" 
            className="input-glass" 
            placeholder="Enter password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-success" 
          style={{ width: '100%', padding: '0.75rem' }}
          disabled={loading}
        >
          {loading ? 'Accessing...' : 'Access Admin Dashboard'}
        </button>
      </form>
    </div>
  );
}
