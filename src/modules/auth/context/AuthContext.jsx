
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { setAuthToken, setApiCallbacks } from '../../../lib/api-client.js';
import { loginApi, logoutApi, refreshTokenApi, getCurrentUserApi } from '../../../lib/api/auth.api.js';

const REFRESH_STORAGE_KEY = 'saas_refresh_token';
const REFRESH_ACCOUNT_KEY = 'saas_refresh_account';
const TAB_ACCOUNT_KEY = 'saas_tab_account';
const BRANCH_STORAGE_KEY = 'saas_active_branch_id';

const readStorage = (key, store = localStorage) => {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
};
const writeStorage = (key, value, store = localStorage) => {
  try {
    if (value) store.setItem(key, value);
    else store.removeItem(key);
  } catch {
    /* ignore */
  }
};

// Session model:
// - The refresh token + the account (employeeId) it belongs to live in localStorage,
//   so a logged-in user is recognized across tabs and reloads.
// - Each tab remembers in sessionStorage which account IT was last on. On restore, if
//   the shared localStorage session belongs to a DIFFERENT account than this tab was
//   using, we clear instead of silently switching (prevents the cross-account takeover
//   where an old owner tab's refresh clobbered the shared token and a reload of the
//   cashier tab logged straight into the owner account).
const readRefreshToken = () => readStorage(REFRESH_STORAGE_KEY);
const writeRefreshToken = (v) => writeStorage(REFRESH_STORAGE_KEY, v);
const readRefreshAccount = () => readStorage(REFRESH_ACCOUNT_KEY);
const writeRefreshAccount = (v) => writeStorage(REFRESH_ACCOUNT_KEY, v);
const readTabAccount = () => readStorage(TAB_ACCOUNT_KEY, sessionStorage);
const writeTabAccount = (v) => writeStorage(TAB_ACCOUNT_KEY, v, sessionStorage);

const decodeJwtPayload = (token) => {
  try {
    const part = token.split('.')[1];
    return JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return {};
  }
};

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

  useEffect(() => {
    // One-time migration reset (once per browser, guarded by a flag): drop any
    // legacy token/account markers from older versions so a stale session can
    // never resurface, without wiping the live session on every tab mount.
    try {
      if (!localStorage.getItem('saas_auth_migrated_v2')) {
        writeRefreshToken(null);
        writeRefreshAccount(null);
        writeTabAccount(null);
        localStorage.setItem('saas_auth_migrated_v2', '1');
      }
    } catch {
      /* ignore */
    }
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    refreshTokenRef.current = null;
    setAuthToken(null);
    writeRefreshToken(null);
    writeRefreshAccount(null);
    writeTabAccount(null);
    localStorage.removeItem(BRANCH_STORAGE_KEY);
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
        writeRefreshToken(refreshTokenRef.current);
        const payload = decodeJwtPayload(res.accessToken);
        if (payload.employeeId) writeRefreshAccount(payload.employeeId);
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
    const tabAccount = readTabAccount();
    const storedAccount = readRefreshAccount();
    if (tabAccount && storedAccount && tabAccount !== storedAccount) {
      // The shared session belongs to a different account than this tab was on —
      // do NOT take it over; clear and let the user sign in.
      clearSession();
      setIsBootstrapping(false);
      return;
    }
    const storedRefresh = readRefreshToken();
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
        writeTabAccount(me.id);
        writeRefreshAccount(me.id);
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
      writeRefreshToken(refreshToken || null);
      const payload = decodeJwtPayload(accessToken);
      if (payload.employeeId) writeRefreshAccount(payload.employeeId);
      setAuthToken(accessToken);

      let me;
      try {
        me = await getCurrentUserApi();
      } catch (_err) {
        clearSession();
        throw new Error('فشل في تحميل بيانات الحساب. حاول تاني.');
      }

      setUser(me);
      writeTabAccount(me.id);
      writeRefreshAccount(me.id);
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
