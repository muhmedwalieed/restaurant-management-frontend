import { apiClient } from '../api-client.js';

export const getDeliveryOrdersApi = async (branchId, params = {}) => {
  return apiClient.get(`/branches/${branchId}/delivery/orders`, { params });
};

export const getPendingHandoversApi = async (branchId) => {
  return apiClient.get(`/branches/${branchId}/delivery/pending-handovers`);
};

export const requestPickupOrderApi = async (branchId, orderId) => {
  return apiClient.post(`/branches/${branchId}/delivery/orders/${orderId}/request-pickup`);
};

export const approvePickupOrderApi = async (branchId, orderId) => {
  return apiClient.post(`/branches/${branchId}/delivery/orders/${orderId}/approve-pickup`);
};

export const rejectPickupOrderApi = async (branchId, orderId, payload = {}) => {
  return apiClient.post(`/branches/${branchId}/delivery/orders/${orderId}/reject-pickup`, payload);
};

export const cancelPickupOrderApi = async (branchId, orderId) => {
  return apiClient.post(`/branches/${branchId}/delivery/orders/${orderId}/cancel-pickup`);
};

export const assignDriverOrderApi = async (branchId, orderId, driverEmployeeId) => {
  return apiClient.post(`/branches/${branchId}/delivery/orders/${orderId}/assign-driver`, { driverEmployeeId });
};

export const acceptDriverAssignmentApi = async (branchId, orderId) => {
  return apiClient.post(`/branches/${branchId}/delivery/orders/${orderId}/accept-assignment`);
};

export const rejectDriverAssignmentApi = async (branchId, orderId, payload = {}) => {
  return apiClient.post(`/branches/${branchId}/delivery/orders/${orderId}/reject-assignment`, payload);
};

export const cancelDriverAssignmentApi = async (branchId, orderId) => {
  return apiClient.post(`/branches/${branchId}/delivery/orders/${orderId}/cancel-assignment`);
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

export const handoverReturnOrderApi = async (branchId, orderId) => {
  return apiClient.post(`/branches/${branchId}/delivery/orders/${orderId}/handover-return`);
};

export const confirmReturnOrderApi = async (branchId, orderId) => {
  return apiClient.post(`/branches/${branchId}/delivery/orders/${orderId}/confirm-return`);
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
