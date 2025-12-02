'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { buildAuthStatusUrl, buildLoginUrl, buildLogoutUrl, getAuthHeaders } from '@/lib/config/phpApi';
import { safeFetch, parseAPIResponse, logError } from '@/lib/utils/errorHandling';
import type { AuthUser } from '@/types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'sanctum_token';
const USER_KEY = 'sanctum_user';

function mapApiUser(apiUser: any): AuthUser {
  return {
    id: apiUser?.id ?? apiUser?.ID ?? apiUser?.user_id ?? 0,
    username: apiUser?.user_login ?? apiUser?.username ?? '',
    role: apiUser?.user_role ?? apiUser?.role ?? '',
    fullName: apiUser?.display_name ?? apiUser?.fullName ?? null,
    email: apiUser?.user_email ?? apiUser?.email ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persistSession = useCallback((nextToken: string, apiUser: any) => {
    const mapped = mapApiUser(apiUser);
    setUser(mapped);
    setToken(nextToken);
    try {
      localStorage.setItem(TOKEN_KEY, nextToken);
      localStorage.setItem(USER_KEY, JSON.stringify(mapped));
    } catch {}
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
  }, []);

  const validateExistingSession = useCallback(async (storedToken: string) => {
    try {
      const res = await safeFetch(buildAuthStatusUrl(), {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await parseAPIResponse<{ success: boolean; user: any }>(res);
      if (data?.user) {
        persistSession(storedToken, (data as any).user);
      } else {
        clearSession();
      }
    } catch (e) {
      logError(e, 'auth.validate');
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession, persistSession]);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUserRaw = localStorage.getItem(USER_KEY);
      if (storedToken) {
        setToken(storedToken);
        if (storedUserRaw) {
          try {
            const storedUser = JSON.parse(storedUserRaw);
            if (storedUser) setUser(storedUser);
          } catch {}
        }
        void validateExistingSession(storedToken);
        return;
      }
    } catch {}
    setLoading(false);
  }, [validateExistingSession]);

  const login = useCallback(async (username: string, password: string) => {
    setError(null);
    try {
      const url = buildLoginUrl();
      const res = await safeFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username_val: username, password_val: password }),
      });
      const data = await parseAPIResponse<{ success: boolean; token: string; user: any }>(res);
      const { token: tkn, user: apiUser } = data as any;
      persistSession(tkn, apiUser);
      return true;
    } catch (e) {
      logError(e, 'auth.login');
      setError(e instanceof Error ? e.message : 'Login failed');
      return false;
    }
  }, [persistSession]);

  const logout = useCallback(async () => {
    try {
      await safeFetch(buildLogoutUrl(), {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (e) {
      logError(e, 'auth.logout');
      // proceed with clearing client state even if server call fails
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    error,
    login,
    logout,
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
    const p = pathname || '';
    const isOpen = p.endsWith('/login') || p.endsWith('/add_user') || p.endsWith('/admin/add-user');
    if (!isAuthenticated && !isOpen) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, pathname, router]);

  return <>{children}</>;
}

