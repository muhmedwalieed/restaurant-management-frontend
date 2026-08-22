import { apiClient } from '../api-client.js';

/**
 * List branch orders with filters & pagination
 * GET /branches/:branchId/orders?page=&limit=&status=&type=&source=&tableId=
 */
export const getOrdersApi = async (branchId, params = {}) => {
  return apiClient.get(`/branches/${branchId}/orders`, { params });
};

/**
 * Get single order by id
 * GET /branches/:branchId/orders/:id
 */
export const getOrderByIdApi = async (branchId, id) => {
  return apiClient.get(`/branches/${branchId}/orders/${id}`);
};

/**
 * Create an order
 * POST /branches/:branchId/orders
 * Payload: { type, source?, tableId?, customerId?, customerPhone?, items: [{ productId, quantity, modifierIds?, notes? }], notes?, discountAmount? }
 */
export const createOrderApi = async (branchId, payload, idempotencyKey) => {
  const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
  return apiClient.post(`/branches/${branchId}/orders`, payload, { headers });
};

/**
 * Advance / update order status (state machine)
 * PATCH /branches/:branchId/orders/:id/status
 * Payload: { newStatus, expectedVersion, reason? }
 */
export const updateOrderStatusApi = async (branchId, id, payload) => {
  return apiClient.patch(`/branches/${branchId}/orders/${id}/status`, payload);
};

/**
 * Cancel an order
 * POST /branches/:branchId/orders/:id/cancel
 * Payload: { expectedVersion, reason }
 */
export const cancelOrderApi = async (branchId, id, payload) => {
  return apiClient.post(`/branches/${branchId}/orders/${id}/cancel`, payload);
};

/**
 * Get order status history / timeline
 * GET /branches/:branchId/orders/:id/history
 */
export const getOrderHistoryApi = async (branchId, id) => {
  return apiClient.get(`/branches/${branchId}/orders/${id}/history`);
};