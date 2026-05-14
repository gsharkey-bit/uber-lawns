import React, { createContext, useContext, useMemo, useState } from 'react';
import { mockUsers } from '../data/mockData';

/**
 * AuthContext: minimal in-memory auth for the prototype.
 * Role is 'customer' or 'mower'. A real implementation would call a backend
 * and persist a token; this version just stores user state in memory.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, name, email, role, ...roleData }

  const signInAsCustomer = ({ email, name }) => {
    const seed = mockUsers.customers[0];
    setUser({
      id: seed.id,
      role: 'customer',
      name: name || seed.name,
      email: email || seed.email,
      addressLabel: seed.addressLabel,
    });
  };

  const signInAsMower = ({ email, name }) => {
    const seed = mockUsers.mowers[0];
    setUser({
      id: seed.id,
      role: 'mower',
      name: name || seed.name,
      email: email || seed.email,
      rating: seed.rating,
      jobsCompleted: seed.jobsCompleted,
      tiers: seed.tiers,
      bio: seed.bio,
      online: false,
    });
  };

  const signOut = () => setUser(null);

  const setOnline = (online) => {
    setUser((prev) => (prev ? { ...prev, online } : prev));
  };

  const value = useMemo(
    () => ({ user, signInAsCustomer, signInAsMower, signOut, setOnline }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
