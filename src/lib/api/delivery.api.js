import { apiClient } from '../api-client.js';

export const getDeliveryOrdersApi = async (branchId, params = {}) => {
  return apiClient.get(`/branches/${branchId}/delivery/orders`, { params });
};

export const pickupDeliveryOrderApi = async (branchId, orderId, payload = {}) => {
  return apiClient.post(`/branches/${branchId}/delivery/orders/${orderId}/pickup`, payload);
};

export const deliverDeliveryOrderApi = async (branchId, orderId, payload = {}) => {
  return apiClient.post(`/branches/${branchId}/delivery/orders/${orderId}/deliver`, payload);
};

export const failDeliveryOrderApi = async (branchId, orderId, payload) => {
  return apiClient.post(`/branches/${branchId}/delivery/orders/${orderId}/fail`, payload);
};

export const getDriverWalletApi = async (branchId, driverId = null) => {
  const params = driverId ? { driverId } : {};
  return apiClient.get(`/branches/${branchId}/delivery/wallet`, { params });
};

export const settleDriverCashApi = async (branchId, payload) => {
  return apiClient.post(`/branches/${branchId}/delivery/settle`, payload);
};

export const getBranchDriversApi = async (branchId) => {
  return apiClient.get(`/branches/${branchId}/delivery/drivers`);
};
