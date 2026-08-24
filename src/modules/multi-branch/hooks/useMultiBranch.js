import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBranchUsersApi,
  grantBranchAccessApi,
  revokeBranchAccessApi,
} from '../../../lib/api/multi-branch.api.js';

export const useBranchUsersQuery = (branchId) => {
  return useQuery({
    queryKey: ['branch-users', branchId],
    queryFn: () => getBranchUsersApi(branchId),
    enabled: Boolean(branchId),
  });
};

export const useGrantBranchAccessMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, employeeId }) => grantBranchAccessApi(branchId, employeeId),
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: ['branch-users', branchId] });
      qc.invalidateQueries({ queryKey: ['my-branches'] });
    },
  });
};

export const useRevokeBranchAccessMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, employeeId }) => revokeBranchAccessApi(branchId, employeeId),
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: ['branch-users', branchId] });
      qc.invalidateQueries({ queryKey: ['my-branches'] });
    },
  });
};