import { apiClient } from '../api-client.js';

export const getBranchesApi = async (params = {}) => {
  return apiClient.get('/branches', { params });
};

export const getBranchByIdApi = async (id) => {
  return apiClient.get(`/branches/${id}`);
};

export const createBranchApi = async (payload) => {
  return apiClient.post('/branches', payload);
};

export const updateBranchApi = async (id, payload) => {
  return apiClient.patch(`/branches/${id}`, payload);
};

export const getBranchWorkingHoursApi = async (branchId) => {
  return apiClient.get(`/branches/${branchId}/working-hours`);
};

export const updateBranchWorkingHoursApi = async (branchId, workingHoursArray) => {
  return apiClient.put(`/branches/${branchId}/working-hours`, { workingHours: workingHoursArray });
};

export const getBranchSettingsApi = async (branchId) => {
  return apiClient.get(`/branches/${branchId}/settings`);
};

export const updateBranchSettingsApi = async (branchId, payload) => {
  return apiClient.put(`/branches/${branchId}/settings`, payload);
};
