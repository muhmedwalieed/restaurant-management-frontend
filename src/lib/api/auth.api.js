import { apiClient } from '../api-client.js';

/**
 * Perform login request
 * @param {Object} credentials - { email, password, forceLogout }
 */
export const loginApi = async ({ email, password, forceLogout = false }) => {
  return apiClient.post('/auth/login', {
    email,
    password,
    forceLogout,
  });
};

/**
 * Fetch the current authenticated user profile + permissions (GET /auth/me)
 */
export const getCurrentUserApi = async () => {
  return apiClient.get('/auth/me');
};

/**
 * Perform logout request
 */
export const logoutApi = async () => {
  return apiClient.post('/auth/logout');
};

/**
 * Refresh access token (POST /auth/refresh)
 * @param {string} refreshToken
 */
export const refreshTokenApi = async (refreshToken) => {
  return apiClient.post('/auth/refresh', { refreshToken });
};
