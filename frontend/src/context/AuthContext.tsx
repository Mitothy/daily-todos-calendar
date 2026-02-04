import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAccessToken } from '../services/api';
import { User } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await api.get('/auth/status');
      if (response.data.authenticated) {
        setUser(response.data.user);
        const tokenRes = await api.post('/auth/refresh');
        setAccessToken(tokenRes.data.accessToken);
      }
    } catch {
      // Not authenticated
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  async function login(code: string) {
    const response = await api.post('/auth/google', { code });
    setUser(response.data.user);
    setAccessToken(response.data.accessToken);
  }

  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
    setAccessToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
