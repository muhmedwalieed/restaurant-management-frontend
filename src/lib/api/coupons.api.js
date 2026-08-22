import { apiClient } from '../api-client.js';

/**
 * List coupons with pagination + filters
 * GET /coupons?page=&limit=&isActive=&type=&q=
 */
export const getCouponsApi = async (params = {}) => {
  return apiClient.get('/coupons', { params });
};

/**
 * Get a single coupon
 * GET /coupons/:id
 */
export const getCouponApi = async (id) => {
  return apiClient.get(`/coupons/${id}`);
};

/**
 * Create a coupon
 * POST /coupons
 * Payload: { code, type, value, minSubtotal?, maxDiscount?, usageLimit?, startsAt?, expiresAt?, isActive? }
 */
export const createCouponApi = async (payload) => {
  return apiClient.post('/coupons', payload);
};

/**
 * Update a coupon (partial)
 * PATCH /coupons/:id
 */
export const updateCouponApi = async (id, payload) => {
  return apiClient.patch(`/coupons/${id}`, payload);
};

/**
 * Soft-delete a coupon
 * DELETE /coupons/:id
 */
export const deleteCouponApi = async (id) => {
  return apiClient.delete(`/coupons/${id}`);
};

/**
 * Validate a coupon code for checkout (does NOT consume usage)
 * POST /coupons/validate
 * Payload: { code, subtotal, items: [{ productId, subtotal }] }
 */
export const validateCouponApi = async (payload) => {
  return apiClient.post('/coupons/validate', payload);
};