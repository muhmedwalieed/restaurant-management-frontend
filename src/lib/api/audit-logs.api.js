import { apiClient } from '../api-client.js';

/**
 * List audit log entries with filters + pagination
 * GET /audit-logs?page=&limit=&action=&entityType=&entityId=&actorEmployeeId=&branchId=&from=&to=
 */
export const getAuditLogsApi = async (params = {}) => {
  return apiClient.get('/audit-logs', { params });
};

/**
 * Get a single audit log entry
 * GET /audit-logs/:id
 */
export const getAuditLogApi = async (id) => {
  return apiClient.get(`/audit-logs/${id}`);
};