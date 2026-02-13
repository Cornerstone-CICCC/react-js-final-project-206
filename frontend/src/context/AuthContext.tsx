import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

export type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBooting: boolean;
};

type AuthContextValue = {
  auth: AuthState;
  refreshAuth: () => Promise<void>;
  clearAuth: () => void;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type CheckAuthResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBooting, setIsBooting] = useState(true);

  const clearAuth = () => setUser(null);

  const refreshAuth = async () => {
    try {
      const { data } = await api.get<CheckAuthResponse>('/users/check-auth');
      setUser({
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      });
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const run = async () => {
      setIsBooting(true);
      await refreshAuth();
      setIsBooting(false);
    };
    run();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      auth: {
        user,
        isAuthenticated: !!user,
        isBooting,
      },
      refreshAuth,
      clearAuth,
      setUser,
    }),
    [user, isBooting],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
