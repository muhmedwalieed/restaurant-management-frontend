/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken, setApiCallbacks } from '../../../lib/api-client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Session state lives in memory only (Section 16 — never persist access tokens in localStorage)
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    setApiCallbacks({
      onUnauthorized: () => {
        setUser(null);
        setToken(null);
      },
      onConflict409: () => {},
    });
  }, []);

  const login = async (email, _password) => {
    setIsLoading(true);
    try {
      // Demo UI-only login state update (as Auth backend is NOT DONE yet — Section 7.1 / ADR-F009)
      const mockUser = {
        id: 'usr-1',
        name: email.split('@')[0] || 'المستخدم النشط',
        email,
        role: 'MANAGER',
        permissions: ['*'],
      };
      setUser(mockUser);
      setToken('demo-jwt-token-123');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const hasPermission = (permissionKey) => {
    if (!user) return false;
    if (user.permissions?.includes('*') || user.role === 'SUPER_ADMIN' || user.role === 'MANAGER') {
      return true;
    }
    return user.permissions?.includes(permissionKey) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
