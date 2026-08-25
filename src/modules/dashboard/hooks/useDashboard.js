import { useQuery } from '@tanstack/react-query';
import {
  getDashboardSummaryApi,
  getChannelStatsApi,
  getSalesTrendApi,
  getBranchComparisonApi,
} from '../../../lib/api/dashboard.api.js';

export const useDashboardSummaryQuery = (branchId, params = {}) => {
  return useQuery({
    queryKey: ['dashboard-summary', branchId, params],
    queryFn: () => getDashboardSummaryApi({ ...params, ...(branchId ? { branchId } : {}) }),
    enabled: Boolean(branchId),
  });
};

export const useChannelStatsQuery = (branchId, params = {}) => {
  return useQuery({
    queryKey: ['dashboard-channels', branchId, params],
    queryFn: () => getChannelStatsApi({ ...params, ...(branchId ? { branchId } : {}) }),
    enabled: Boolean(branchId),
  });
};

export const useSalesTrendQuery = (branchId, days = 7) => {
  return useQuery({
    queryKey: ['dashboard-trend', branchId, days],
    queryFn: () => getSalesTrendApi({ days, ...(branchId ? { branchId } : {}) }),
    enabled: Boolean(branchId),
  });
};

export const useBranchComparisonQuery = () => {
  return useQuery({
    queryKey: ['dashboard-branch-comparison'],
    queryFn: () => getBranchComparisonApi({}),
  });
};
