import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

export default function UserLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(username, password, 'user');
    if (success) {
      navigate('/user');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }} className="glass-panel animate-fade-in">
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--primary)' }}>User Login</h2>
      
      {error && (
        <div style={{ padding: '0.75rem', marginBottom: '1.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label">Username</label>
          <input 
            type="text" 
            className="input-glass" 
            placeholder="Enter username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <label className="label">Password</label>
          <input 
            type="password" 
            className="input-glass" 
            placeholder="Enter password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
          Login to Dashboard
        </button>
      </form>
    </div>
  );
}
