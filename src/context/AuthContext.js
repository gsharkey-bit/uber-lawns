import React, { createContext, useContext, useMemo, useState } from 'react';
import { mockUsers } from '../data/mockData';

const AuthContext = createContext(null);

function makeReferralCode(name) {
  const stem = (name || 'lawn').split(' ')[0].toUpperCase();
  return `LAWN-${stem}-${Math.floor(Math.random() * 900) + 100}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const signInAsCustomer = ({ email, name }) => {
    const seed = mockUsers.customers[0];
    setUser({
      id: seed.id,
      role: 'customer',
      name: name || seed.name,
      email: email || seed.email,
      addressLabel: seed.addressLabel,
      referralCode: makeReferralCode(name || seed.name),
      referralsCount: 2,
      referralEarnings: 20,
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
      verified: false,
    });
  };

  const signOut = () => setUser(null);

  const setOnline = (online) => {
    setUser((prev) => (prev ? { ...prev, online } : prev));
  };

  const setMowerVerified = (verified) => {
    setUser((prev) => (prev ? { ...prev, verified } : prev));
  };

  const value = useMemo(
    () => ({ user, signInAsCustomer, signInAsMower, signOut, setOnline, setMowerVerified }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
