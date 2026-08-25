import { apiClient } from '../api-client.js';

export const getDashboardSummaryApi = async (params = {}) => {
  return apiClient.get('/dashboard/summary', { params });
};

export const getChannelStatsApi = async (params = {}) => {
  return apiClient.get('/dashboard/channel-stats', { params });
};

export const getOrderStatusStatsApi = async (params = {}) => {
  return apiClient.get('/dashboard/order-status-stats', { params });
};

export const getSalesTrendApi = async (params = {}) => {
  return apiClient.get('/dashboard/sales-trend', { params });
};

export const getBranchComparisonApi = async (params = {}) => {
  return apiClient.get('/dashboard/branches-comparison', { params });
};

export const getEmployeePerformanceApi = async (params = {}) => {
  return apiClient.get('/dashboard/employee-performance', { params });
};
