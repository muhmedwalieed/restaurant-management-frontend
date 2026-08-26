import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { setAuthToken, setApiCallbacks } from '../../../lib/api-client.js';
import { loginApi, logoutApi, refreshTokenApi, getCurrentUserApi } from '../../../lib/api/auth.api.js';

const BRANCH_STORAGE_KEY = 'saas_active_branch_id';

const AuthContext = createContext(null);

// Auth is cookie-based: the refresh token lives in an httpOnly cookie set by the
// backend (not readable by JS — safe from XSS). The short-lived access token is
// kept in memory only. Nothing sensitive is stored in localStorage.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    // Drop any refresh token/account markers from older localStorage-based versions.
    try {
      localStorage.removeItem('saas_refresh_token');
      localStorage.removeItem('saas_refresh_account');
      sessionStorage.removeItem('saas_tab_account');
      localStorage.removeItem('saas_auth_migrated_v2');
    } catch {
      /* ignore */
    }
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem(BRANCH_STORAGE_KEY);
  }, []);

  const refreshPromiseRef = useRef(null);

  const handleRefresh = useCallback(async () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    refreshPromiseRef.current = (async () => {
      try {
        const res = await refreshTokenApi();
        if (res?.accessToken) {
          setToken(res.accessToken);
          setAuthToken(res.accessToken);
          return res.accessToken;
        }
        return null;
      } catch (_err) {
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, []);

  const restoreStartedRef = useRef(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const newToken = await handleRefresh();
        if (newToken) {
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
  }, [clearSession, handleRefresh]);

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

      if (!accessToken) {
        throw new Error('استجابة تسجيل الدخول غير صالحة، missing access token');
      }

      setToken(accessToken);
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
      void _err;
    } finally {
      clearSession();
    }
  }, [token, clearSession]);

  const hasPermission = useCallback(
    (permissionKey) => {
      if (!user) return false;

      if (user.role?.isSystem && user.role?.name === 'owner') return true;

      const permissions = user.permissions || user.role?.permissions || [];
      const isWildcard = permissions.some((p) => (typeof p === 'string' ? p === '*' : p.key === '*'));
      if (isWildcard) return true;

      const keys = Array.isArray(permissionKey) ? permissionKey : [permissionKey];
      return keys.some((key) =>
        permissions.some((p) => (typeof p === 'string' ? p === key : p.key === key))
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