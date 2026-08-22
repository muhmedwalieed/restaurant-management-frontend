import { useQuery } from '@tanstack/react-query';
import {
  getDashboardSummaryApi,
  getChannelStatsApi,
  getOrderStatusStatsApi,
  getSalesTrendApi,
  getBranchComparisonApi,
  getEmployeePerformanceApi,
} from '../../../lib/api/dashboard.api.js';

export const useDashboardSummaryQuery = (branchId, params = {}) => {
  return useQuery({
    queryKey: ['dashboard-summary', branchId, params],
    queryFn: () => getDashboardSummaryApi({ ...params, ...(branchId ? { branchId } : {}) }),
    enabled: Boolean(branchId),
    refetchInterval: 60000,
  });
};

export const useChannelStatsQuery = (branchId, params = {}) => {
  return useQuery({
    queryKey: ['dashboard-channels', branchId, params],
    queryFn: () => getChannelStatsApi({ ...params, ...(branchId ? { branchId } : {}) }),
    enabled: Boolean(branchId),
    refetchInterval: 60000,
  });
};

export const useOrderStatusStatsQuery = (branchId, params = {}) => {
  return useQuery({
    queryKey: ['dashboard-status', branchId, params],
    queryFn: () => getOrderStatusStatsApi({ ...params, ...(branchId ? { branchId } : {}) }),
    enabled: Boolean(branchId),
    refetchInterval: 60000,
  });
};

export const useSalesTrendQuery = (branchId, days = 7) => {
  return useQuery({
    queryKey: ['dashboard-trend', branchId, days],
    queryFn: () => getSalesTrendApi({ days, ...(branchId ? { branchId } : {}) }),
    enabled: Boolean(branchId),
    refetchInterval: 60000,
  });
};

export const useBranchComparisonQuery = () => {
  return useQuery({
    queryKey: ['dashboard-branch-comparison'],
    queryFn: () => getBranchComparisonApi({}),
    refetchInterval: 60000,
  });
};

export const useEmployeePerformanceQuery = (branchId) => {
  return useQuery({
    queryKey: ['dashboard-employees', branchId],
    queryFn: () => getEmployeePerformanceApi(branchId ? { branchId } : {}),
    enabled: Boolean(branchId),
    refetchInterval: 60000,
  });
};