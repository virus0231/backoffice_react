import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import API from '../utils/api';

const STORAGE_KEY = 'backoffice-auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hydrateFromStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.user) {
          setUser(parsed.user);
        }
      }
    } catch {}
  }, []);

  const persistUser = useCallback((u) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u }));
    } catch {}
  }, []);

  const clearPersisted = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const checkSession = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await API.post('auth.php', { action: 'status' });
      if (resp?.success && resp?.user) {
        setUser(resp.user);
        persistUser(resp.user);
        return true;
      }
      setUser(null);
      clearPersisted();
      return false;
    } catch (err) {
      setUser(null);
      clearPersisted();
      return false;
    } finally {
      setLoading(false);
    }
  }, [persistUser, clearPersisted]);

  useEffect(() => {
    hydrateFromStorage();
    checkSession();
  }, [hydrateFromStorage, checkSession]);

  const login = useCallback(async (username, password) => {
    setError('');
    try {
      const resp = await API.post('auth.php', {
        action: 'Login',
        username_val: username,
        password_val: password,
      });
      if (resp?.success && resp?.user) {
        setUser(resp.user);
        persistUser(resp.user);
        return true;
      }
      setError(resp?.message || 'Login failed');
      return false;
    } catch (err) {
      setError('Login failed. Please try again.');
      return false;
    }
  }, [persistUser]);

  const logout = useCallback(async () => {
    try {
      await API.post('auth.php', { action: 'Logout' });
    } catch {}
    setUser(null);
    clearPersisted();
  }, [clearPersisted]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
    refreshSession: checkSession,
  }), [user, loading, error, login, logout, checkSession]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
