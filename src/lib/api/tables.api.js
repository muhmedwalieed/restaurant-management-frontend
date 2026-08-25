import { apiClient } from '../api-client.js';

export const getTablesApi = async (branchId, params = {}) => {
  return apiClient.get(`/branches/${branchId}/tables`, { params });
};

export const getTableByIdApi = async (branchId, id) => {
  return apiClient.get(`/branches/${branchId}/tables/${id}`);
};

export const createTableApi = async (branchId, payload) => {
  return apiClient.post(`/branches/${branchId}/tables`, payload);
};

export const updateTableApi = async (branchId, id, payload) => {
  return apiClient.patch(`/branches/${branchId}/tables/${id}`, payload);
};

export const deleteTableApi = async (branchId, id) => {
  return apiClient.delete(`/branches/${branchId}/tables/${id}`);
};

export const regenerateQrApi = async (branchId, id) => {
  return apiClient.post(`/branches/${branchId}/tables/${id}/regenerate-qr`);
};

export const getTableMenuApi = async (qrToken) => {
  return apiClient.get(`/menu/table/${qrToken}`);
};
