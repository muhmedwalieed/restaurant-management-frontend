import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { setAuthToken, setApiCallbacks } from '../../../lib/api-client.js';
import { loginApi, logoutApi, refreshTokenApi, getCurrentUserApi } from '../../../lib/api/auth.api.js';
import { restaurantSlug } from '../../../shared/tenant/tenant.js';

const BRANCH_STORAGE_KEY = 'saas_active_branch_id';

/**
 * True when the authenticated account belongs to a different restaurant than the
 * one this host serves. On a host without a restaurant (public customer pages)
 * there is nothing to compare against, so it is never "foreign".
 */
const isForeignRestaurant = (me) => {
  const accountSlug = me?.restaurant?.slug;
  return Boolean(restaurantSlug && accountSlug && accountSlug !== restaurantSlug);
};

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

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('saas_refresh_token');
    localStorage.removeItem(BRANCH_STORAGE_KEY);
  }, []);

  const refreshPromiseRef = useRef(null);

  const handleRefresh = useCallback(async () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    refreshPromiseRef.current = (async () => {
      try {
        const storedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('saas_refresh_token') : null;
        if (!storedToken) {
          return null;
        }
        const res = await refreshTokenApi(storedToken);
        if (res?.accessToken) {
          setToken(res.accessToken);
          setAuthToken(res.accessToken);
          if (res.refreshToken) {
            localStorage.setItem('saas_refresh_token', res.refreshToken);
          }
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
      // Don't attempt staff refresh on public customer-facing routes (avoids unwanted 401 in console)
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const isPublicCustomerRoute = pathname.startsWith('/menu/table') || pathname.startsWith('/order');
      if (isPublicCustomerRoute) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const newToken = await handleRefresh();
        if (newToken) {
          const me = await getCurrentUserApi();
          // A restored session must belong to the restaurant this host serves.
          if (isForeignRestaurant(me)) {
            clearSession();
          } else {
            setUser(me);
          }
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
      if (res?.refreshToken) {
        localStorage.setItem('saas_refresh_token', res.refreshToken);
      }

      let me;
      try {
        me = await getCurrentUserApi();
      } catch (_err) {
        clearSession();
        throw new Error('فشل في تحميل بيانات الحساب. حاول تاني.');
      }

      // Belt and braces: the backend already refuses a cross-restaurant login.
      if (isForeignRestaurant(me)) {
        clearSession();
        throw new Error('الحساب ده مش تابع للمطعم المفتوح.');
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