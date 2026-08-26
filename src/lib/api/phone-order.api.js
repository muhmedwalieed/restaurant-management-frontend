import { apiClient } from '../api-client.js';

export const lookupCallerApi = async (phone) => {
  return apiClient.post('/phone-order/lookup', { phone });
};

export const createPhoneOrderApi = async (branchId, payload) => {
  return apiClient.post(`/phone-order/branches/${branchId}/orders`, payload);
};
