import { apiClient } from '../api-client.js';

export const getRolesApi = async (params = {}) => {
  return apiClient.get('/roles', { params });
};

export const createRoleApi = async (payload) => {
  return apiClient.post('/roles', payload);
};

export const updateRoleApi = async (id, payload) => {
  return apiClient.patch(`/roles/${id}`, payload);
};

export const deleteRoleApi = async (id) => {
  return apiClient.delete(`/roles/${id}`);
};

export const getPermissionsCatalogApi = async () => {
  return apiClient.get('/roles/permissions/catalog');
};
