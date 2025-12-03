import { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../lib/api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = apiClient.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiClient.post('auth/status', {});
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        apiClient.setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      apiClient.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiClient.post(
        'auth/login',
        {
          username_val: username,
          password_val: password,
        }
      );

      if (response.success && response.token) {
        apiClient.setToken(response.token);
        setUser(response.user);
        return { success: true };
      }

      throw new Error(response.message || 'Login failed');
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('auth/logout', {});
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      apiClient.setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
