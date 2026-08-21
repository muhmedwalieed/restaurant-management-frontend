/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { setAuthToken, setApiCallbacks } from '../../../lib/api-client.js';
import { loginApi, logoutApi, refreshTokenApi, getCurrentUserApi } from '../../../lib/api/auth.api.js';

const REFRESH_STORAGE_KEY = 'saas_refresh_token';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Access token lives in memory ONLY (Section 16 / ADR-F006 — never persist access token in localStorage).
  // The refresh token is the only persisted secret (Secure storage + rotation — the documented fallback
  // when the backend does not issue an HttpOnly cookie).
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const refreshTokenRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    refreshTokenRef.current = null;
    setAuthToken(null);
    localStorage.removeItem(REFRESH_STORAGE_KEY);
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!refreshTokenRef.current) return null;
    try {
      const res = await refreshTokenApi(refreshTokenRef.current);
      if (res?.accessToken) {
        refreshTokenRef.current = res.refreshToken ?? refreshTokenRef.current;
        localStorage.setItem(REFRESH_STORAGE_KEY, refreshTokenRef.current);
        setToken(res.accessToken);
        setAuthToken(res.accessToken);
        return res.accessToken;
      }
      return null;
    } catch (_err) {
      return null;
    }
  }, []);

  // Silent session restore on page refresh (Section 16 — refresh token with rotation).
  // restoreStartedRef guards against React StrictMode double-invoking the effect in dev,
  // which would otherwise call /auth/refresh twice with the same (rotated) token.
  const restoreStartedRef = useRef(false);

  useEffect(() => {
    const restoreSession = async () => {
      const storedRefresh = localStorage.getItem(REFRESH_STORAGE_KEY);
      if (!storedRefresh) {
        setIsBootstrapping(false);
        return;
      }
      refreshTokenRef.current = storedRefresh;
      try {
        const res = await refreshTokenApi(storedRefresh);
        if (res?.accessToken) {
          refreshTokenRef.current = res.refreshToken ?? storedRefresh;
          localStorage.setItem(REFRESH_STORAGE_KEY, refreshTokenRef.current);
          setToken(res.accessToken);
          setAuthToken(res.accessToken);
          const me = await getCurrentUserApi();
          setUser(me);
        } else {
          clearSession();
        }
      } catch (_err) {
        clearSession();
      } finally {
        setIsBootstrapping(false);
      }
    };
    if (!restoreStartedRef.current) {
      restoreStartedRef.current = true;
      restoreSession();
    }
  }, [clearSession]);

  useEffect(() => {
    setApiCallbacks({
      onUnauthorized: () => {
        clearSession();
      },
      onConflict409: () => {},
      onRefresh: handleRefresh,
    });
  }, [clearSession, handleRefresh]);

  const login = async (email, password, forceLogout = false) => {
    setIsLoading(true);
    try {
      const res = await loginApi({ email, password, forceLogout });
      const accessToken = res?.accessToken;
      const refreshToken = res?.refreshToken;

      if (!accessToken) {
        throw new Error('استجابة تسجيل الدخول غير صالحة — missing access token');
      }

      setToken(accessToken);
      refreshTokenRef.current = refreshToken;
      if (refreshToken) {
        localStorage.setItem(REFRESH_STORAGE_KEY, refreshToken);
      }
      setAuthToken(accessToken);

      let me;
      try {
        me = await getCurrentUserApi();
      } catch (_err) {
        clearSession();
        throw new Error('فشل في تحميل بيانات الحساب. حاول تاني.');
      }

      setUser(me);
      return { success: true, user: me };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      if (token) {
        await logoutApi();
      }
    } catch (_err) {
      // Ignore network error on logout — local session must still be cleared
    } finally {
      clearSession();
    }
  }, [token, clearSession]);

  const hasPermission = useCallback(
    (permissionKey) => {
      if (!user) return false;
      // /auth/me returns permissions nested under role.permissions
      const permissions = user.permissions || user.role?.permissions || [];
      const isWildcard = permissions.some((p) => (typeof p === 'string' ? p === '*' : p.key === '*'));
      if (isWildcard) return true;
      return permissions.some((p) =>
        typeof p === 'string' ? p === permissionKey : p.key === permissionKey
      );
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isBootstrapping,
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