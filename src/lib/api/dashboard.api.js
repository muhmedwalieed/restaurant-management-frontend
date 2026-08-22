import { apiClient } from '../api-client.js';

/**
 * Restaurant-level KPI summary (optionally scoped to a branch + date range)
 * GET /dashboard/summary?branchId=&from=&to=
 */
export const getDashboardSummaryApi = async (params = {}) => {
  return apiClient.get('/dashboard/summary', { params });
};

/**
 * Orders + revenue split by OrderSource channel
 * GET /dashboard/channel-stats?branchId=&from=&to=
 */
export const getChannelStatsApi = async (params = {}) => {
  return apiClient.get('/dashboard/channel-stats', { params });
};

/**
 * Order status + payment status distribution
 * GET /dashboard/order-status-stats?branchId=&from=&to=
 */
export const getOrderStatusStatsApi = async (params = {}) => {
  return apiClient.get('/dashboard/order-status-stats', { params });
};

/**
 * Daily sales trend (orders + revenue per day) — default last 7 days
 * GET /dashboard/sales-trend?branchId=&days=
 */
export const getSalesTrendApi = async (params = {}) => {
  return apiClient.get('/dashboard/sales-trend', { params });
};

/**
 * Per-branch comparison (orders/revenue/paid/avg) sorted by revenue desc
 * GET /dashboard/branches-comparison?from=&to=
 */
export const getBranchComparisonApi = async (params = {}) => {
  return apiClient.get('/dashboard/branches-comparison', { params });
};

/**
 * Employee performance (payments collected + status actions)
 * GET /dashboard/employee-performance?branchId=&from=&to=
 */
export const getEmployeePerformanceApi = async (params = {}) => {
  return apiClient.get('/dashboard/employee-performance', { params });
};