import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../src/lib/api-client.js';
import {
  getDashboardSummaryApi,
  getChannelStatsApi,
  getOrderStatusStatsApi,
  getSalesTrendApi,
  getBranchComparisonApi,
  getEmployeePerformanceApi,
} from '../../src/lib/api/dashboard.api.js';

vi.mock('../../src/lib/api-client.js', () => ({
  apiClient: { get: vi.fn() },
}));

describe('Module 15 Dashboard API Layer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getDashboardSummaryApi should call GET /dashboard/summary with params', async () => {
    apiClient.get.mockResolvedValueOnce({ totalOrders: 10 });
    await getDashboardSummaryApi({ branchId: 'br-1', from: '2026-01-01' });
    expect(apiClient.get).toHaveBeenCalledWith('/dashboard/summary', {
      params: { branchId: 'br-1', from: '2026-01-01' },
    });
  });

  it('getChannelStatsApi should call GET /dashboard/channel-stats', async () => {
    apiClient.get.mockResolvedValueOnce([]);
    await getChannelStatsApi({ branchId: 'br-1' });
    expect(apiClient.get).toHaveBeenCalledWith('/dashboard/channel-stats', { params: { branchId: 'br-1' } });
  });

  it('getOrderStatusStatsApi should call GET /dashboard/order-status-stats', async () => {
    apiClient.get.mockResolvedValueOnce({});
    await getOrderStatusStatsApi({});
    expect(apiClient.get).toHaveBeenCalledWith('/dashboard/order-status-stats', { params: {} });
  });

  it('getSalesTrendApi should call GET /dashboard/sales-trend with days', async () => {
    apiClient.get.mockResolvedValueOnce([]);
    await getSalesTrendApi({ days: 7, branchId: 'br-1' });
    expect(apiClient.get).toHaveBeenCalledWith('/dashboard/sales-trend', { params: { days: 7, branchId: 'br-1' } });
  });

  it('getBranchComparisonApi should call GET /dashboard/branches-comparison', async () => {
    apiClient.get.mockResolvedValueOnce([]);
    await getBranchComparisonApi({ from: '2026-01-01' });
    expect(apiClient.get).toHaveBeenCalledWith('/dashboard/branches-comparison', { params: { from: '2026-01-01' } });
  });

  it('getEmployeePerformanceApi should call GET /dashboard/employee-performance', async () => {
    apiClient.get.mockResolvedValueOnce([]);
    await getEmployeePerformanceApi({ branchId: 'br-1' });
    expect(apiClient.get).toHaveBeenCalledWith('/dashboard/employee-performance', { params: { branchId: 'br-1' } });
  });
});
