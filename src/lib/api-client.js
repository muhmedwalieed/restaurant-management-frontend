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

// Health endpoints are mounted at the ROOT level (not under /api): GET /health & GET /ready
export const apiHealthClient = axios.create({
  baseURL: apiOrigin,
  timeout: 15000,
});

// Auth & Refresh Token Handlers
let authToken = null;
let onUnauthorizedCallback = null;
let onConflict409Callback = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const setApiCallbacks = ({ onUnauthorized, onConflict409 }) => {
  if (onUnauthorized) onUnauthorizedCallback = onUnauthorized;
  if (onConflict409) onConflict409Callback = onConflict409;
};

// Section 17 — error code → user-facing UI message mapping.
// Codes whose value is `null` fall back to the backend-provided message:
//   - VALIDATION_ERROR  → shown inline next to the affected field
//   - BUSINESS_RULE_ERROR → the backend message is designed to be user-friendly already
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

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unified success unwrapping (Section 10.3) — shared by the versioned client and the health client
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
    return resData.data !== undefined ? resData.data : resData;
  }
  return resData;
};

// Response Interceptor (Section 10.3 & Technical Directives)
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
      raw: error,
    };

    // Handle 409 Optimistic Locking Conflict (Section 17 — CONFLICT_ERROR + refetch signal)
    if (status === 409) {
      if (onConflict409Callback) {
        onConflict409Callback(normalizedError);
      }
      return Promise.reject(normalizedError);
    }

    // Handle 401 Unauthorized Session Expiration (Section 10.3)
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback(normalizedError);
      }
      return Promise.reject(normalizedError);
    }

    return Promise.reject(normalizedError);
  }
);

// Health client uses the same success unwrapping (no auth needed — 503 handled as a thrown error by the query layer)
apiHealthClient.interceptors.response.use(unwrapResponse);
