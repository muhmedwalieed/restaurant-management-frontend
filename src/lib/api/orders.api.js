import { apiClient } from '../api-client.js';

export const getOrdersApi = async (branchId, params = {}) => {
  return apiClient.get(`/branches/${branchId}/orders`, { params });
};

export const getAllOrdersApi = async (params = {}) => {
  return apiClient.get('/orders', { params });
};

export const getOrderByIdApi = async (branchId, id) => {
  return apiClient.get(`/branches/${branchId}/orders/${id}`);
};

export const createOrderApi = async (branchId, payload, idempotencyKey) => {
  const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
  return apiClient.post(`/branches/${branchId}/orders`, payload, { headers });
};

export const updateOrderStatusApi = async (branchId, id, payload) => {
  return apiClient.patch(`/branches/${branchId}/orders/${id}/status`, payload);
};

export const cancelOrderApi = async (branchId, id, payload) => {
  return apiClient.post(`/branches/${branchId}/orders/${id}/cancel`, payload);
};

export const getOrderHistoryApi = async (branchId, id) => {
  return apiClient.get(`/branches/${branchId}/orders/${id}/history`);
};

export const createPosOrderApi = async (branchId, payload, idempotencyKey) => {
  const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
  return apiClient.post(`/branches/${branchId}/pos/orders`, payload, { headers });
};

export const processPaymentApi = async (branchId, orderId, payload) => {
  return apiClient.post(`/branches/${branchId}/orders/${orderId}/payment`, payload);
};

export const processRefundApi = async (branchId, orderId, payload) => {
  return apiClient.post(`/branches/${branchId}/orders/${orderId}/refund`, payload);
};

export const getKdsOrdersApi = async (branchId, params = {}) => {
  return apiClient.get(`/branches/${branchId}/kds/orders`, { params });
};

export const updateKdsOrderStatusApi = async (branchId, orderId, payload) => {
  return apiClient.patch(`/branches/${branchId}/kds/orders/${orderId}/status`, payload);
};

export const createPublicOrderApi = async (payload, idempotencyKey) => {
  const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
  return apiClient.post('/orders/public', payload, { headers });
};

export const trackOrderApi = async (params = {}) => {
  return apiClient.get('/orders/track', { params });
};
