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