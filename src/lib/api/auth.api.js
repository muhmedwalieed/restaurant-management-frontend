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

export const refreshTokenApi = async (refreshToken) => {
  return apiClient.post('/auth/refresh', { refreshToken }, { skipAuth: true });
};
