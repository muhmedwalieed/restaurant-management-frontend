import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const apiOrigin = new URL(baseURL).origin;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
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

    const code = errorBody.code || 'INTERNAL_SERVER_ERROR';
    const mappedMessage = ERROR_MESSAGE_MAP[code];

    const normalizedError = {
      status: status || 500,
      code,
      message: mappedMessage || errorBody.message || error.message || 'حدث خطأ في الاتصال بالخادم',
      requestId: errorBody.requestId || error.response?.headers?.['x-request-id'] || null,
      details: errorBody.details || null,
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
