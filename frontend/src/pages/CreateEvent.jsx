import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/useAuth';

export default function CreateEvent() {
  const { contract } = useWeb3();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) {
      alert("Please connect your wallet first.");
      return;
    }

    if (!title || !description || !endDate || !endTime) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const endDateTime = new Date(`${endDate}T${endTime}`);
      const endTimestamp = Math.floor(endDateTime.getTime() / 1000);
      
      if (endTimestamp <= Math.floor(Date.now() / 1000)) {
        alert("End time must be in the future");
        setLoading(false);
        return;
      }

      const creatorName = user?.username || 'Admin';
      const combinedDescription = `${creatorName}|||${description}`;

      const tx = await contract.createPrediction(title, combinedDescription, endTimestamp);
      await tx.wait(); // Wait for confirmation
      
      alert("Event created successfully!");
      setTitle('');
      setDescription('');
      setEndDate('');
      setEndTime('');
      navigate('/admin');
    } catch (err) {
      console.error("Error creating event:", err);
      if (err.code === 'ACTION_REJECTED' || (err.message && err.message.includes('denied transaction'))) {
        alert("Transaction was rejected by user.");
      } else {
        alert("Failed to create event. See console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 0' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Create Prediction Event</h2>
      
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label">Event Title</label>
          <input 
            type="text" 
            className="input-glass" 
            placeholder="e.g., Will BTC reach $100k?" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label">Description / Resolution Criteria</label>
          <textarea 
            className="input-glass" 
            placeholder="Provide clear criteria for how this will be resolved..." 
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            maxLength={500}
            style={{ resize: 'vertical' }}
          ></textarea>
        </div>
        
        <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
          <div>
            <label className="label">End Date</label>
            <input 
              type="date" 
              className="input-glass" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">End Time</label>
            <input 
              type="time" 
              className="input-glass" 
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '1rem' }}
          disabled={loading || !contract}
        >
          {loading ? "Creating Transaction..." : (!contract ? "Wallet Not Connected" : "Create Event")}
        </button>
      </form>
    </div>
  );
}
