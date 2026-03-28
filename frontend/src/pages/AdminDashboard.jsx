import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/useAuth';
import CreateEvent from './CreateEvent';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { contract, account } = useWeb3();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'resolve'
  const [endedEvents, setEndedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/admin-login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (contract) {
      checkOwner();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, account]);

  useEffect(() => {
    if (contract && activeTab === 'resolve' && isOwner) {
      fetchEndedEvents();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, activeTab, isOwner]);

  if (authLoading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading Admin Session...</div>;
  if (!user || user.role !== 'admin') return null;

  const checkOwner = async () => {
    try {
      const owner = await contract.owner();
      if (account && owner.toLowerCase() === account.toLowerCase()) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEndedEvents = async () => {
    try {
      setLoading(true);
      const data = await contract.getEvents(0, 100);
      const now = new Date();
      // Filter events that have ended but are not resolved
      const filterEnded = data.filter(ev => {
        const endTime = new Date(Number(ev.endTime) * 1000);
        return endTime < now && !ev.resolved;
      });
      setEndedEvents(filterEnded);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id, result) => {
    try {
      setResolving(id.toString());
      const tx = await contract.resolvePrediction(id, result);
      await tx.wait();
      alert("Event resolved successfully!");
      fetchEndedEvents();
    } catch (err) {
      console.error(err);
      alert(err.reason || "Failed to resolve event");
    } finally {
      setResolving(null);
    }
  };

  if (!contract || !account) {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Please connect your wallet.</div>;
  }

  if (!isOwner) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '4rem auto' }}>
        <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ marginBottom: '1rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)' }}>Only the Event Creator (Contract Admin) can access this dashboard.</p>
        <div style={{ marginTop: '2rem' }}>
          <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)', marginBottom: '0.5rem' }}>Event Creator (Admin) Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage prediction markets: Create new events and resolve ended ones.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('create')}
          style={{ flex: 1 }}
        >
          Create New Event
        </button>
        <button 
          className={`btn ${activeTab === 'resolve' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('resolve')}
          style={{ flex: 1 }}
        >
          Resolve Predictions
        </button>
      </div>

      {activeTab === 'create' && (
        <CreateEvent />
      )}

      {activeTab === 'resolve' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Events Awaiting Resolution</h2>
          {loading ? (
            <p>Loading ended events...</p>
          ) : endedEvents.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', marginTop: '2rem' }}>
              <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
              <p>All ended events have been resolved!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
              {endedEvents.map(ev => (
                <div key={ev.id.toString()} className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>
                      Ended
                    </span>
                    <Link to={`/events/${ev.id}`} style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none' }}>View Event</Link>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{ev.title}</h3>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button 
                      className="btn btn-success" 
                      style={{ flex: 1 }}
                      onClick={() => handleResolve(ev.id, true)}
                      disabled={resolving === ev.id.toString()}
                    >
                      {resolving === ev.id.toString() ? '...' : 'Resolve YES'}
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{ flex: 1 }}
                      onClick={() => handleResolve(ev.id, false)}
                      disabled={resolving === ev.id.toString()}
                    >
                      {resolving === ev.id.toString() ? '...' : 'Resolve NO'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
