import { apiClient } from '../api-client.js';

/**
 * List branch orders with filters & pagination
 * GET /branches/:branchId/orders?page=&limit=&status=&type=&source=&tableId=
 */
export const getOrdersApi = async (branchId, params = {}) => {
  return apiClient.get(`/branches/${branchId}/orders`, { params });
};

/**
 * List ALL tenant orders (every branch, every source) with filters & pagination
 * GET /orders?page=&limit=&status=&type=&source=&branchId=&tableId=
 */
export const getAllOrdersApi = async (params = {}) => {
  return apiClient.get('/orders', { params });
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

/**
 * Create a POS / cashier order (source is forced to CASHIER server-side)
 * POST /branches/:branchId/pos/orders
 * Payload: { type, tableId?, customerPhone?, customerName?, items: [{ productId, quantity }], notes? }
 */
export const createPosOrderApi = async (branchId, payload, idempotencyKey) => {
  const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
  return apiClient.post(`/branches/${branchId}/pos/orders`, payload, { headers });
};

/**
 * Process an order payment
 * POST /branches/:branchId/orders/:id/payment
 * Payload: { paymentMethod, amount?, expectedVersion }
 */
export const processPaymentApi = async (branchId, orderId, payload) => {
  return apiClient.post(`/branches/${branchId}/orders/${orderId}/payment`, payload);
};

/**
 * Process an order refund
 * POST /branches/:branchId/orders/:id/refund
 * Payload: { reason, expectedVersion }
 */
export const processRefundApi = async (branchId, orderId, payload) => {
  return apiClient.post(`/branches/${branchId}/orders/${orderId}/refund`, payload);
};

/**
 * Get active kitchen (KDS) orders — CONFIRMED/PREPARING FIFO with server-side elapsedMinutes
 * GET /branches/:branchId/kds/orders?status=&page=&limit=
 */
export const getKdsOrdersApi = async (branchId, params = {}) => {
  return apiClient.get(`/branches/${branchId}/kds/orders`, { params });
};

/**
 * Advance a kitchen order status (delegates to the Order Engine state machine)
 * PATCH /branches/:branchId/kds/orders/:id/status
 * Payload: { newStatus, expectedVersion, reason? }
 */
export const updateKdsOrderStatusApi = async (branchId, orderId, payload) => {
  return apiClient.patch(`/branches/${branchId}/kds/orders/${orderId}/status`, payload);
};

/**
 * Create a public / website order (no auth)
 * POST /orders/public
 * Payload: { restaurantId, branchId, type, customerPhone, customerName?, address?, items, notes? }
 */
export const createPublicOrderApi = async (payload, idempotencyKey) => {
  const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
  return apiClient.post('/orders/public', payload, { headers });
};

/**
 * Track a public order (no auth)
 * GET /orders/track?slug=&orderNumber=&phone=
 */
export const trackOrderApi = async (params = {}) => {
  return apiClient.get('/orders/track', { params });
};