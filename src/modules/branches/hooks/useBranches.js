import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBranchesApi,
  getBranchByIdApi,
  createBranchApi,
  updateBranchApi,
  deleteBranchApi,
  getBranchWorkingHoursApi,
  updateBranchWorkingHoursApi,
  getBranchSettingsApi,
  updateBranchSettingsApi,
} from '../../../lib/api/branches.api.js';

export const useBranchesQuery = (params = {}) => {
  return useQuery({
    queryKey: ['branches', params],
    queryFn: () => getBranchesApi(params),
  });
};

export const useBranchQuery = (id) => {
  return useQuery({
    queryKey: ['branch', id],
    queryFn: () => getBranchByIdApi(id),
    enabled: Boolean(id),
  });
};

export const useCreateBranchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBranchApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
};

export const useUpdateBranchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateBranchApi(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['branch', id] });
    },
  });
};

export const useDeleteBranchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBranchApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
};

export const useBranchWorkingHoursQuery = (branchId) => {
  return useQuery({
    queryKey: ['branch-working-hours', branchId],
    queryFn: () => getBranchWorkingHoursApi(branchId),
    enabled: Boolean(branchId),
  });
};

export const useUpdateWorkingHoursMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, workingHours }) =>
      updateBranchWorkingHoursApi(branchId, workingHours),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['branch-working-hours', branchId] });
    },
  });
};

export const useBranchSettingsQuery = (branchId) => {
  return useQuery({
    queryKey: ['branch-settings', branchId],
    queryFn: () => getBranchSettingsApi(branchId),
    enabled: Boolean(branchId),
  });
};

export const useUpdateBranchSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, settings }) => updateBranchSettingsApi(branchId, settings),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['branch-settings', branchId] });
    },
  });
};
