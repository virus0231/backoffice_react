'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { buildLoginUrl } from '@/lib/config/phpApi';
import { safeFetch, parseAPIResponse, logError } from '@/lib/utils/errorHandling';
import type { AuthUser } from '@/types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'insights-auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token && parsed?.user) {
          const exp = typeof parsed.expiresAt === 'number' ? parsed.expiresAt : null;
          if (!exp || Date.now() < exp * 1000) {
            setUser(parsed.user);
            setToken(parsed.token);
            setExpiresAt(exp);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      }
    } catch {}
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setError(null);
    try {
      const url = buildLoginUrl();
      const res = await safeFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await parseAPIResponse<{ success: boolean; data: { token: string; user: AuthUser; expiresIn: number } }>(res);
      const { token: tkn, user: usr, expiresIn } = (data as any).data;
      setUser(usr);
      setToken(tkn);
      const expEpoch = Math.floor(Date.now() / 1000) + Math.max(60, Number(expiresIn) || 3600);
      setExpiresAt(expEpoch);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: tkn, user: usr, expiresAt: expEpoch }));
      return true;
    } catch (e) {
      logError(e, 'auth.login');
      setError(e instanceof Error ? e.message : 'Login failed');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setExpiresAt(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    error,
    login,
    logout
  }), [user, token, loading, error, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Simple client-side route guard; excludes login and add_user
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const openRoutes = new Set(['/login', '/add_user']);
    if (!isAuthenticated && !openRoutes.has(pathname || '')) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, pathname, router]);

  return <>{children}</>;
}

