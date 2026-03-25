import React, { createContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('predictchain_auth');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  const login = async (username, password, role) => {
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('predictchain_auth', JSON.stringify(userData));
        return true;
      } else {
        // Fallback: If login fails (user not found), try registering for this demo
        const regResponse = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, role })
        });
        
        if (regResponse.ok) {
          const userData = await regResponse.json();
          setUser(userData);
          localStorage.setItem('predictchain_auth', JSON.stringify(userData));
          return true;
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('predictchain_auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
