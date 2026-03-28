import React, { createContext, useState, useEffect } from 'react';
import config from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('predictchain_auth');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('predictchain_auth');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password, expectedRole) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Ensure the role matches what the login page expects
        if (userData.role !== expectedRole) {
          throw new Error(`Account found, but it has a different role (${userData.role})`);
        }

        setUser(userData);
        // This stores both user info and the token returned by the backend
        localStorage.setItem('predictchain_auth', JSON.stringify(userData));
        return { success: true };
      } else {
        // Try auto-registering for dev convenience
        const regResponse = await fetch(`${config.API_BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, role: expectedRole })
        });
        
        if (regResponse.ok) {
          const userData = await regResponse.json();
          setUser(userData);
          localStorage.setItem('predictchain_auth', JSON.stringify(userData));
          return { success: true };
        }
        
        const errorData = await regResponse.json().catch(() => ({}));
        return { success: false, message: errorData.message || 'Invalid credentials or registration failed' };
      }
    } catch (err) {
      console.warn('Backend connection failed or authentication error:', err.message);
      
      // OFFLINE FALLBACK: For local demo only if backend is unreachable AND user provided credentials
      if (username && password) {
        const userData = { username, role: expectedRole, token: 'local-demo-token' };
        setUser(userData);
        localStorage.setItem('predictchain_auth', JSON.stringify(userData));
        return { success: true, warning: 'Using local simulation mode' };
      }
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('predictchain_auth');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
