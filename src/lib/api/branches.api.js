import { apiClient } from '../api-client.js';

/**
 * Get paginated branches list with optional status filter
 * GET /branches?page=&limit=&status=
 */
export const getBranchesApi = async (params = {}) => {
  return apiClient.get('/branches', { params });
};

/**
 * Get branch details by ID
 * GET /branches/:id
 */
export const getBranchByIdApi = async (id) => {
  return apiClient.get(`/branches/${id}`);
};

/**
 * Create a new branch
 * POST /branches
 * Payload: { name, code, address, phone, status, isMain }
 */
export const createBranchApi = async (payload) => {
  return apiClient.post('/branches', payload);
};

/**
 * Update branch details
 * PATCH /branches/:id
 * Payload: { name, code, address, phone, status, isMain }
 */
export const updateBranchApi = async (id, payload) => {
  return apiClient.patch(`/branches/${id}`, payload);
};

/**
 * Soft-delete branch (sets status: INACTIVE)
 * DELETE /branches/:id
 */
export const deleteBranchApi = async (id) => {
  return apiClient.delete(`/branches/${id}`);
};

/**
 * Get branch working hours 7-day schedule
 * GET /branches/:id/working-hours
 */
export const getBranchWorkingHoursApi = async (branchId) => {
  return apiClient.get(`/branches/${branchId}/working-hours`);
};

/**
 * Update branch working hours 7-day schedule
 * PUT /branches/:id/working-hours
 * Payload: Array of [ { day: "MON".."SUN", openTime: "HH:mm", closeTime: "HH:mm", isOpen } ]
 */
export const updateBranchWorkingHoursApi = async (branchId, workingHoursArray) => {
  return apiClient.put(`/branches/${branchId}/working-hours`, workingHoursArray);
};

/**
 * Get branch operational settings
 * GET /branches/:id/settings
 */
export const getBranchSettingsApi = async (branchId) => {
  return apiClient.get(`/branches/${branchId}/settings`);
};

/**
 * Update branch operational settings
 * PUT /branches/:id/settings
 * Payload: { currency, timezone }
 */
export const updateBranchSettingsApi = async (branchId, payload) => {
  return apiClient.put(`/branches/${branchId}/settings`, payload);
};
