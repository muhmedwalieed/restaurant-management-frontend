import { apiClient } from '../api-client.js';
import { restaurantSlug } from '../../shared/tenant/tenant.js';

export const loginApi = async ({ email, password, forceLogout = false }) => {
  return apiClient.post('/auth/login', {
    email,
    password,
    forceLogout,
    // Which restaurant's login page this is — the credentials are only ever
    // matched against that restaurant's staff accounts.
    restaurantSlug,
  });
};

export const getCurrentUserApi = async () => {
  return apiClient.get('/auth/me');
};

export const logoutApi = async () => {
  return apiClient.post('/auth/logout');
};

export const refreshTokenApi = async (refreshToken) => {
  const token = refreshToken || (typeof localStorage !== 'undefined' ? localStorage.getItem('saas_refresh_token') : null);
  return apiClient.post('/auth/refresh', token ? { refreshToken: token } : {}, { skipAuth: true });
};
