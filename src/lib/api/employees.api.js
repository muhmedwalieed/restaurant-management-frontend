import { apiClient } from '../api-client.js';

export const getEmployeesApi = async (params = {}) => {
  return apiClient.get('/employees', { params });
};

export const getEmployeeByIdApi = async (id) => {
  return apiClient.get(`/employees/${id}`);
};

export const createEmployeeApi = async (payload) => {
  return apiClient.post('/employees', payload);
};

export const updateEmployeeApi = async (id, payload) => {
  return apiClient.patch(`/employees/${id}`, payload);
};

export const changeEmployeePasswordApi = async (id, payload) => {
  return apiClient.patch(`/employees/${id}/password`, payload);
};

export const changeEmployeeRoleApi = async (id, payload) => {
  return apiClient.patch(`/employees/${id}/role`, payload);
};

export const forceLogoutEmployeeApi = async (id) => {
  return apiClient.post('/auth/force-logout', { employeeId: id });
};

export const deleteEmployeeApi = async (id) => {
  return apiClient.delete(`/employees/${id}`);
};
