import { apiClient } from '../api-client.js';

/**
 * List tables for a branch
 * GET /branches/:branchId/tables?page=&limit=&status=
 */
export const getTablesApi = async (branchId, params = {}) => {
  return apiClient.get(`/branches/${branchId}/tables`, { params });
};

/**
 * Get single table by id
 * GET /branches/:branchId/tables/:id
 */
export const getTableByIdApi = async (branchId, id) => {
  return apiClient.get(`/branches/${branchId}/tables/${id}`);
};

/**
 * Create a table
 * POST /branches/:branchId/tables
 * Payload: { label, capacity, status }
 */
export const createTableApi = async (branchId, payload) => {
  return apiClient.post(`/branches/${branchId}/tables`, payload);
};

/**
 * Update a table
 * PATCH /branches/:branchId/tables/:id
 * Payload: { label?, capacity?, status? }
 */
export const updateTableApi = async (branchId, id, payload) => {
  return apiClient.patch(`/branches/${branchId}/tables/${id}`, payload);
};

/**
 * Soft delete a table
 * DELETE /branches/:branchId/tables/:id
 */
export const deleteTableApi = async (branchId, id) => {
  return apiClient.delete(`/branches/${branchId}/tables/${id}`);
};

/**
 * Regenerate QR token for a table
 * POST /branches/:branchId/tables/:id/regenerate-qr
 */
export const regenerateQrApi = async (branchId, id) => {
  return apiClient.post(`/branches/${branchId}/tables/${id}/regenerate-qr`);
};

/**
 * Public table menu (QR scan — no auth)
 * GET /menu/table/:qrToken
 */
export const getTableMenuApi = async (qrToken) => {
  return apiClient.get(`/menu/table/${qrToken}`);
};