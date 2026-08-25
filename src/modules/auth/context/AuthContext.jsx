
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { setAuthToken, setApiCallbacks } from '../../../lib/api-client.js';
import { loginApi, logoutApi, refreshTokenApi, getCurrentUserApi } from '../../../lib/api/auth.api.js';

const REFRESH_STORAGE_KEY = 'saas_refresh_token';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

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

const refreshPromiseRef = useRef(null);

const handleRefresh = useCallback(async () => {
  if (!refreshTokenRef.current) return null;
  if (refreshPromiseRef.current) return refreshPromiseRef.current;

  refreshPromiseRef.current = (async () => {
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
    } finally {
      refreshPromiseRef.current = null;
    }
  })();

  return refreshPromiseRef.current;
}, []);

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
      const refreshToken = res?.refreshToken;

      if (!accessToken) {
        throw new Error('استجابة تسجيل الدخول غير صالحة، missing access token');
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
