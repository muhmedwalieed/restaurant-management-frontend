import { apiClient } from '../api-client.js';

/** Public branding for a restaurant's staff login page — no auth, no tenant data. */
export const getPublicRestaurantApi = async (slug) => {
  return apiClient.get(`/restaurant/public/${encodeURIComponent(slug)}`, { skipAuth: true });
};

export const getRestaurantProfileApi = async () => {
  return apiClient.get('/restaurant');
};

export const updateRestaurantProfileApi = async (payload) => {
  return apiClient.patch('/restaurant', payload);
};

export const updateRestaurantStatusApi = async (status) => {
  return apiClient.patch('/restaurant/status', { status });
};
