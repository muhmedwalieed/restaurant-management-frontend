import { apiClient } from '../api-client.js';

/**
 * Get roles list
 */
export const getRolesApi = async (params = {}) => {
  return apiClient.get('/roles', { params });
};

/**
 * Get role details by ID
 */
export const getRoleByIdApi = async (id) => {
  return apiClient.get(`/roles/${id}`);
};

/**
 * Create a new role
 */
export const createRoleApi = async (payload) => {
  return apiClient.post('/roles', payload);
};

/**
 * Update role details
 */
export const updateRoleApi = async (id, payload) => {
  return apiClient.patch(`/roles/${id}`, payload);
};

/**
 * Delete a role
 */
export const deleteRoleApi = async (id) => {
  return apiClient.delete(`/roles/${id}`);
};

/**
 * Fetch the full permissions catalog grouped by module (GET /roles/permissions/catalog)
 */
export const getPermissionsCatalogApi = async () => {
  return apiClient.get('/roles/permissions/catalog');
};
