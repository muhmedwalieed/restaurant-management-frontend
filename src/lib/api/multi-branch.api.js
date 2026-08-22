import { apiClient } from '../api-client.js';

/**
 * Branches accessible to the current employee (home + granted) — branch switcher
 * GET /employees/me/branches
 */
export const getMyBranchesApi = async () => {
  return apiClient.get('/employees/me/branches');
};

/**
 * Employees who can operate in a branch (home + granted access)
 * GET /branches/:branchId/users
 */
export const getBranchUsersApi = async (branchId) => {
  return apiClient.get(`/branches/${branchId}/users`);
};

/**
 * Grant an employee access to an additional branch
 * POST /branches/:branchId/users
 * Payload: { employeeId }
 */
export const grantBranchAccessApi = async (branchId, employeeId) => {
  return apiClient.post(`/branches/${branchId}/users`, { employeeId });
};

/**
 * Revoke an employee's access to a branch (home branch cannot be revoked)
 * DELETE /branches/:branchId/users/:employeeId
 */
export const revokeBranchAccessApi = async (branchId, employeeId) => {
  return apiClient.delete(`/branches/${branchId}/users/${employeeId}`);
};