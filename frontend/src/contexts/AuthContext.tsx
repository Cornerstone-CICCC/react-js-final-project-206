import React, { createContext, useContext, useMemo, useState } from "react";

export type AuthUser = {
  id: string;
  email: string;
  partnerId?: string | null;
};

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

type AuthContextValue = {
  auth: AuthState;
  setAuth: (next: AuthState) => void;
  clearAuth: () => void;
};

export const TOKEN_STORAGE_KEY = "auth_token";

const getInitialToken = (): string | null => {
  const local = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (local) return local;
  const session = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (session) return session;
  return null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuthState] = useState<AuthState>({
    token: getInitialToken(),
    user: null,
  });

  const setAuth = (next: AuthState) => setAuthState(next);

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setAuthState({ token: null, user: null });
  };

  const value = useMemo<AuthContextValue>(
    () => ({ auth, setAuth, clearAuth }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
