import { apiClient } from '../api-client.js';

export const getAuditLogsApi = async (params = {}) => {
  return apiClient.get('/audit-logs', { params });
};

export const getAuditLogApi = async (id) => {
  return apiClient.get(`/audit-logs/${id}`);
};
