import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gigly_user')); } catch { return null; }
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await authAPI.getMe();
      if (data.success) { setUser(data.data.user); setProfile(data.data.profile); }
      else clearSession();
    } catch { clearSession(); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('gigly_token');
    if (token) fetchMe(); else setLoading(false);
  }, [fetchMe]);

  const clearSession = () => {
    localStorage.removeItem('gigly_token'); localStorage.removeItem('gigly_user');
    setUser(null); setProfile(null);
  };

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    if (!data.success) throw new Error(data.message);
    localStorage.setItem('gigly_token', data.data.token);
    localStorage.setItem('gigly_user', JSON.stringify(data.data.user));
    setUser(data.data.user); setProfile(data.data.profile);
    return data.data;
  };

  const register = async (payload) => {
    const { data } = await authAPI.register(payload);
    if (!data.success) throw new Error(data.message);
    localStorage.setItem('gigly_token', data.data.token);
    localStorage.setItem('gigly_user', JSON.stringify(data.data.user));
    setUser(data.data.user); setProfile(data.data.profile);
    return data.data;
  };

  const logout = () => clearSession();
  const refreshUser = () => fetchMe();

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, refreshUser, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
