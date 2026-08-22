import { apiClient } from '../api-client.js';

/**
 * Caller lookup — find-or-create customer by phone + recent orders + default address
 * POST /phone-order/lookup
 */
export const lookupCallerApi = async (phone) => {
  return apiClient.post('/phone-order/lookup', { phone });
};

/**
 * Create a phone order
 * POST /phone-order/branches/:branchId/orders
 * Payload: { type, customerPhone, customerName?, items: [{ productId, quantity }], notes? }
 */
export const createPhoneOrderApi = async (branchId, payload) => {
  return apiClient.post(`/phone-order/branches/${branchId}/orders`, payload);
};