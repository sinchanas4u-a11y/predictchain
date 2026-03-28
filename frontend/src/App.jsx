import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useWeb3 } from './context/Web3Context';
import { useAuth } from './context/useAuth';
import { Wallet, LogOut } from 'lucide-react';

import Landing from './pages/Landing';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import UserLogin from './pages/Auth/UserLogin';
import AdminLogin from './pages/Auth/AdminLogin';

function App() {
  const { account, connectWallet } = useWeb3();
  const { user, logout, loading: authLoading } = useAuth();

  if (authLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)' }}>Loading Session...</div>;
  }

  return (
    <BrowserRouter>
      <div className="container">
        <nav className="navbar">
          <Link to="/" className="nav-link" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>
            PredictChain
          </Link>
          <div className="nav-links">
            {user?.role === 'user' && <Link to="/user" className="nav-link">User Dashboard</Link>}
            {user?.role === 'admin' && <Link to="/admin" className="nav-link">Admin Dashboard</Link>}
            <Link to="/events" className="nav-link">All Events</Link>
            
            {user ? (
              <button className="btn btn-outline" onClick={logout} style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <LogOut size={16} /> Logout ({user.username})
              </button>
            ) : null}
            
            {account ? (
              <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wallet size={18} color="var(--primary)" />
                <span style={{ fontSize: '0.875rem' }}>
                  {account.substring(0, 6)}...{account.substring(account.length - 4)}
                </span>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={connectWallet}>
                <Wallet size={18} />
                Connect Wallet
              </button>
            )}
          </div>
        </nav>
        
        <main className="animate-fade-in">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/create" element={<CreateEvent />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/user-login" element={<UserLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            
            {/* Fallback for 404 */}
            <Route path="*" element={
              <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>404 - Page Not Found</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The page you're looking for doesn't exist or has moved.</p>
                <Link to="/" className="btn btn-primary">Go Home</Link>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
