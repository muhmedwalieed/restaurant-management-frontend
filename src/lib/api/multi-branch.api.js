import { apiClient } from '../api-client.js';

export const getMyBranchesApi = async () => {
  return apiClient.get('/employees/me/branches');
};

export const getBranchUsersApi = async (branchId) => {
  return apiClient.get(`/branches/${branchId}/users`);
};

export const grantBranchAccessApi = async (branchId, employeeId) => {
  return apiClient.post(`/branches/${branchId}/users`, { employeeId });
};

export const revokeBranchAccessApi = async (branchId, employeeId) => {
  return apiClient.delete(`/branches/${branchId}/users/${employeeId}`);
};
