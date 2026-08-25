import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, setAuthToken, setApiCallbacks } from '../../src/lib/api-client.js';
import axios from 'axios';

describe('API Client Layer Tests (Section 10 & Technical Directives)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should attach Bearer token to request headers when set', async () => {
    setAuthToken('my-secret-token');
    const config = { headers: {} };

    const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    const modifiedConfig = requestInterceptor(config);
    expect(modifiedConfig.headers.Authorization).toBe('Bearer my-secret-token');
  });

  it('should unwrap response data automatically for standard success format', async () => {
    const responseInterceptor = apiClient.interceptors.response.handlers[0].fulfilled;
    const mockAxiosResponse = {
      data: {
        success: true,
        data: { id: 101, name: 'Burger' },
        message: 'Success',
      },
    };
    const result = responseInterceptor(mockAxiosResponse);
    expect(result).toEqual({ id: 101, name: 'Burger' });
  });

  it('should handle pagination responses properly', async () => {
    const responseInterceptor = apiClient.interceptors.response.handlers[0].fulfilled;
    const mockAxiosResponse = {
      data: {
        success: true,
        data: [{ id: 1 }, { id: 2 }],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      },
    };
    const result = responseInterceptor(mockAxiosResponse);
    expect(result).toEqual({
      items: [{ id: 1 }, { id: 2 }],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      message: undefined,
    });
  });

  it('should normalize a success envelope without a data key to null (e.g. no active session)', async () => {
    const responseInterceptor = apiClient.interceptors.response.handlers[0].fulfilled;
    const mockAxiosResponse = {
      data: { success: true, requestId: 'req-1' },
    };
    const result = responseInterceptor(mockAxiosResponse);
    expect(result).toBeNull();
  });

  it('should handle 409 Optimistic Locking conflict with generic message and callback', async () => {
    const errorInterceptor = apiClient.interceptors.response.handlers[0].rejected;
    const mockConflictCallback = vi.fn();
    setApiCallbacks({ onConflict409: mockConflictCallback });

    const mockError = {
      config: {},
      response: {
        status: 409,
        data: {
          error: {
            code: 'CONFLICT_ERROR',
            message: 'Conflict',
            requestId: 'req-409',
          },
        },
      },
    };

    try {
      await errorInterceptor(mockError);
    } catch (err) {
      expect(err.status).toBe(409);
      expect(err.message).toBe('حصل تعارض، بنحدّث البيانات الحالية');
      expect(err.requestId).toBe('req-409');
      expect(mockConflictCallback).toHaveBeenCalledWith(err);
    }
  });

  it('should map backend error codes to user-facing UI messages (Section 17)', async () => {
    const errorInterceptor = apiClient.interceptors.response.handlers[0].rejected;

    const buildError = (status, code) => ({
      config: {},
      response: { status, data: { error: { code, message: 'Raw backend message' } } },
    });

    const expectations = [
      [403, 'AUTHORIZATION_ERROR', 'معندكش صلاحية تعمل الإجراء ده'],
      [404, 'NOT_FOUND', 'العنصر ده مش موجود أو اتشال'],
      [429, 'RATE_LIMIT_EXCEEDED', 'طلبات كتير، حاول تاني بعد شوية'],
      [500, 'INTERNAL_SERVER_ERROR', 'حصل خطأ غير متوقع، جرب تاني'],
    ];

    for (const [status, code, expectedMessage] of expectations) {
      try {
        await errorInterceptor(buildError(status, code));
      } catch (err) {
        expect(err.status).toBe(status);
        expect(err.code).toBe(code);
        expect(err.message).toBe(expectedMessage);
      }
    }
  });

  it('should pass through backend message verbatim for BUSINESS_RULE_ERROR (Section 17)', async () => {
    const errorInterceptor = apiClient.interceptors.response.handlers[0].rejected;
    const mockError = {
      config: {},
      response: {
        status: 422,
        data: { error: { code: 'BUSINESS_RULE_ERROR', message: 'الجدول ده محجوز بالفعل' } },
      },
    };

    try {
      await errorInterceptor(mockError);
    } catch (err) {
      expect(err.status).toBe(422);
      expect(err.message).toBe('الجدول ده محجوز بالفعل');
    }
  });

  it('should handle 401 Unauthorized with refresh callback', async () => {
    const errorInterceptor = apiClient.interceptors.response.handlers[0].rejected;
    const mockUnauthorizedCallback = vi.fn();
    setApiCallbacks({ onUnauthorized: mockUnauthorizedCallback });

    const mockError = {
      config: {},
      response: {
        status: 401,
        data: {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token expired',
          },
        },
      },
    };

    try {
      await errorInterceptor(mockError);
    } catch (err) {
      expect(err.status).toBe(401);
      expect(mockUnauthorizedCallback).toHaveBeenCalled();
    }
  });

  it('should retry the original request once after a successful single-flight refresh (Section 16)', async () => {
    const errorInterceptor = apiClient.interceptors.response.handlers[0].rejected;
    const mockRefresh = vi.fn().mockResolvedValue('new-token-abc');
    setApiCallbacks({ onRefresh: mockRefresh });

    apiClient.defaults.adapter = () =>
      Promise.resolve({
        data: { success: true, data: { ok: true } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

    const mockError = {
      config: { headers: {}, _retry: false },
      response: {
        status: 401,
        data: { error: { code: 'UNAUTHORIZED', message: 'expired' } },
      },
    };

    const result = await errorInterceptor(mockError);

    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(mockError.config.headers.Authorization).toBe('Bearer new-token-abc');
    expect(result).toEqual({ ok: true });
  });

  it('should preserve error details (forceLogoutRequired) for the login force-logout UX', async () => {
    const errorInterceptor = apiClient.interceptors.response.handlers[0].rejected;
    const mockError = {
      config: {},
      response: {
        status: 422,
        data: {
          error: {
            code: 'BUSINESS_RULE_ERROR',
            message: 'Active session on another device',
            details: { forceLogoutRequired: true, sessionDevice: 'Chrome on Windows' },
          },
        },
      },
    };

    try {
      await errorInterceptor(mockError);
    } catch (err) {
      expect(err.code).toBe('BUSINESS_RULE_ERROR');
      expect(err.details).toEqual({ forceLogoutRequired: true, sessionDevice: 'Chrome on Windows' });
    }
  });
});
