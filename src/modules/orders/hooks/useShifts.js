import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCurrentShiftApi,
  openShiftApi,
  getXReportApi,
  closeShiftApi,
  addCashMovementApi,
  getShiftDetailsApi,
  listShiftsApi,
} from '../../../lib/api/shifts.api.js';

export const useCurrentShiftQuery = (branchId) => {
  return useQuery({
    queryKey: ['current-shift', branchId],
    queryFn: () => getCurrentShiftApi(branchId),
    enabled: Boolean(branchId),
    refetchInterval: 10000,
    staleTime: 5000,
  });
};

export const useOpenShiftMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, payload }) => openShiftApi(branchId, payload),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['current-shift', branchId] });
      queryClient.invalidateQueries({ queryKey: ['shifts-list', branchId] });
    },
  });
};

export const useCloseShiftMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, shiftId, payload }) =>
      closeShiftApi(branchId, shiftId, payload),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['current-shift', branchId] });
      queryClient.invalidateQueries({ queryKey: ['shifts-list', branchId] });
    },
  });
};

export const useAddCashMovementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, shiftId, payload }) =>
      addCashMovementApi(branchId, shiftId, payload),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['current-shift', branchId] });
    },
  });
};

export const useXReportQuery = (branchId, shiftId, enabled = false) => {
  return useQuery({
    queryKey: ['x-report', branchId, shiftId],
    queryFn: () => getXReportApi(branchId, shiftId),
    enabled: Boolean(branchId && shiftId && enabled),
    staleTime: 0,
  });
};

export const useShiftsListQuery = (branchId, params = {}) => {
  return useQuery({
    queryKey: ['shifts-list', branchId, params],
    queryFn: () => listShiftsApi(branchId, params),
    enabled: Boolean(branchId),
    staleTime: 10000,
  });
};

export const useShiftDetailsQuery = (branchId, shiftId) => {
  return useQuery({
    queryKey: ['shift-details', branchId, shiftId],
    queryFn: () => getShiftDetailsApi(branchId, shiftId),
    enabled: Boolean(branchId && shiftId),
  });
};
