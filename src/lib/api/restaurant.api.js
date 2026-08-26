import { apiClient } from '../api-client.js';

export const getRestaurantProfileApi = async () => {
  return apiClient.get('/restaurant');
};

export const updateRestaurantProfileApi = async (payload) => {
  return apiClient.patch('/restaurant', payload);
};

export const updateRestaurantStatusApi = async (status) => {
  return apiClient.patch('/restaurant/status', { status });
};
