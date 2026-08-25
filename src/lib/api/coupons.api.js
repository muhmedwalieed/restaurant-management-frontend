import { apiClient } from '../api-client.js';

export const getCouponsApi = async (params = {}) => {
  return apiClient.get('/coupons', { params });
};

export const getCouponApi = async (id) => {
  return apiClient.get(`/coupons/${id}`);
};

export const createCouponApi = async (payload) => {
  return apiClient.post('/coupons', payload);
};

export const updateCouponApi = async (id, payload) => {
  return apiClient.patch(`/coupons/${id}`, payload);
};

export const deleteCouponApi = async (id) => {
  return apiClient.delete(`/coupons/${id}`);
};

export const validateCouponApi = async (payload) => {
  return apiClient.post('/coupons/validate', payload);
};
