import { apiClient } from '../api-client.js';

/**
 * Get Restaurant Profile (GET /restaurant)
 */
export const getRestaurantProfileApi = async () => {
  return apiClient.get('/restaurant');
};

/**
 * Update Restaurant Profile (PATCH /restaurant)
 * Payload: { name, email, phone, currency, timezone }
 */
export const updateRestaurantProfileApi = async (payload) => {
  return apiClient.patch('/restaurant', payload);
};

/**
 * Update Restaurant Status (PATCH /restaurant/status)
 * Payload: { status } ('ACTIVE' | 'INACTIVE' | 'SUSPENDED')
 */
export const updateRestaurantStatusApi = async (status) => {
  return apiClient.patch('/restaurant/status', { status });
};
