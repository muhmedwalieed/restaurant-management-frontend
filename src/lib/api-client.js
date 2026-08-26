import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const apiOrigin = new URL(baseURL).origin;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // send/accept the httpOnly refresh cookie (login/refresh/logout)
  timeout: 15000,
});

export const apiHealthClient = axios.create({
  baseURL: apiOrigin,
  timeout: 15000,
});

let authToken = null;
let onUnauthorizedCallback = null;
let onConflict409Callback = null;
let onRefreshCallback = null;
let refreshPromise = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const setApiCallbacks = ({ onUnauthorized, onConflict409, onRefresh }) => {
  if (onUnauthorized) onUnauthorizedCallback = onUnauthorized;
  if (onConflict409) onConflict409Callback = onConflict409;
  if (onRefresh) onRefreshCallback = onRefresh;
};

const performRefresh = () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const newToken = await onRefreshCallback();
        return newToken || null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
};

const ERROR_MESSAGE_MAP = {
  VALIDATION_ERROR: null,
  AUTHENTICATION_ERROR: 'انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى',
  AUTHORIZATION_ERROR: 'معندكش صلاحية تعمل الإجراء ده',
  NOT_FOUND: 'العنصر ده مش موجود أو اتشال',
  CONFLICT_ERROR: 'حصل تعارض، بنحدّث البيانات الحالية',
  BUSINESS_RULE_ERROR: null,
  RATE_LIMIT_EXCEEDED: 'طلبات كتير، حاول تاني بعد شوية',
  EXTERNAL_SERVICE_ERROR: 'الخدمة الخارجية مش متاحة دلوقتي، جرب تاني',
  DATABASE_ERROR: 'حصل خطأ غير متوقع، جرب تاني',
  INTERNAL_SERVER_ERROR: 'حصل خطأ غير متوقع، جرب تاني',
  NETWORK_ERROR: 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت أو المحاولة بعد قليل',
  SERVICE_UNAVAILABLE: 'الخادم غير متاح حالياً أو قيد إعادة التشغيل، يرجى المحاولة بعد لحظات',
};

apiClient.interceptors.request.use(
  (config) => {
    if (authToken && !config.skipAuth && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    delete config.skipAuth;
    return config;
  },
  (error) => Promise.reject(error)
);

const unwrapResponse = (response) => {
  const resData = response.data;
  if (resData && typeof resData === 'object' && resData.success !== undefined) {
    if (resData.pagination) {
      return {
        items: resData.data,
        pagination: resData.pagination,
        message: resData.message,
      };
    }

    return resData.data !== undefined ? resData.data : null;
  }
  return resData;
};

apiClient.interceptors.response.use(unwrapResponse, async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const errorBody = error.response?.data?.error || {};

    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
    const isServiceDown = status === 502 || status === 503 || status === 504;

    let code = errorBody.code || 'INTERNAL_SERVER_ERROR';
    if (isNetworkError) {
      code = 'NETWORK_ERROR';
    } else if (isServiceDown && !errorBody.code) {
      code = 'SERVICE_UNAVAILABLE';
    }

    const mappedMessage = ERROR_MESSAGE_MAP[code];

    let message;
    if (isNetworkError) {
      message = ERROR_MESSAGE_MAP.NETWORK_ERROR;
    } else if (isServiceDown && !mappedMessage && !errorBody.message) {
      message = ERROR_MESSAGE_MAP.SERVICE_UNAVAILABLE;
    } else {
      message = mappedMessage || errorBody.message || error.message || 'حدث خطأ في الاتصال بالخادم';
    }

    const normalizedError = {
      status: status || 0,
      code,
      message,
      requestId: errorBody.requestId || error.response?.headers?.['x-request-id'] || null,
      details: errorBody.details || null,
      isConnectionIssue: isNetworkError || isServiceDown,
      raw: error,
    };

    if (status === 409) {
      if (onConflict409Callback) {
        onConflict409Callback(normalizedError);
      }
      return Promise.reject(normalizedError);
    }

    if (status === 401 && !originalRequest._retry) {

      if (originalRequest.url && originalRequest.url.includes('/auth/refresh')) {
        if (onUnauthorizedCallback) onUnauthorizedCallback(normalizedError);
        return Promise.reject(normalizedError);
      }

      // Table self-ordering member routes use their own JWT — never retry them
      // with the staff access token (a staff refresh must not log the user out).
      if (originalRequest.url && /^\/sessions\//.test(originalRequest.url)) {
        return Promise.reject(normalizedError);
      }

      originalRequest._retry = true;
      if (onRefreshCallback) {
        try {
          const newToken = await performRefresh();
          if (newToken) {
            authToken = newToken;
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (_err) {
          void _err;
        }
      }
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback(normalizedError);
      }
      return Promise.reject(normalizedError);
    }

    return Promise.reject(normalizedError);
  }
);

apiHealthClient.interceptors.response.use(unwrapResponse);
