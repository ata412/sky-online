'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sky_auth');
      if (saved) setUser(JSON.parse(saved));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  const login = (memberData) => {
    setUser(memberData);
    localStorage.setItem('sky_auth', JSON.stringify(memberData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sky_auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user, hydrated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
