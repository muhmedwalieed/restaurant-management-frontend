import { apiClient } from '../api-client.js';

/**
 * Get paginated employees list with search & filter parameters
 */
export const getEmployeesApi = async (params = {}) => {
  return apiClient.get('/employees', { params });
};

/**
 * Get employee details by ID
 */
export const getEmployeeByIdApi = async (id) => {
  return apiClient.get(`/employees/${id}`);
};

/**
 * Create a new employee
 */
export const createEmployeeApi = async (payload) => {
  return apiClient.post('/employees', payload);
};

/**
 * Update employee details
 */
export const updateEmployeeApi = async (id, payload) => {
  return apiClient.patch(`/employees/${id}`, payload);
};

/**
 * Change employee password (PATCH /employees/:id/password)
 */
export const changeEmployeePasswordApi = async (id, payload) => {
  return apiClient.patch(`/employees/${id}/password`, payload);
};

/**
 * Change employee role (PATCH /employees/:id/role)
 */
export const changeEmployeeRoleApi = async (id, payload) => {
  return apiClient.patch(`/employees/${id}/role`, payload);
};

/**
 * Force logout an employee — revoke all their active sessions (POST /auth/force-logout)
 */
export const forceLogoutEmployeeApi = async (id) => {
  return apiClient.post('/auth/force-logout', { employeeId: id });
};

/**
 * Soft-delete an employee
 */
export const deleteEmployeeApi = async (id) => {
  return apiClient.delete(`/employees/${id}`);
};
