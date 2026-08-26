import { apiClient } from '../api-client.js';

export const loginApi = async ({ email, password, forceLogout = false }) => {
  return apiClient.post('/auth/login', {
    email,
    password,
    forceLogout,
  });
};

export const getCurrentUserApi = async () => {
  return apiClient.get('/auth/me');
};

export const logoutApi = async () => {
  return apiClient.post('/auth/logout');
};

export const refreshTokenApi = async () => {
  // The refresh token lives in an httpOnly cookie set by the backend — it is sent
  // automatically (withCredentials), so no token needs to be sent from JS.
  return apiClient.post('/auth/refresh', {}, { skipAuth: true });
};
