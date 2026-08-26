import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTablesApi,
  getTableByIdApi,
  createTableApi,
  updateTableApi,
  regenerateQrApi,
} from '../../../lib/api/tables.api.js';

export const useTablesQuery = (branchId, params = {}) => {
  return useQuery({
    queryKey: ['tables', branchId, params],
    queryFn: () => getTablesApi(branchId, params),
    enabled: Boolean(branchId),
  });
};

export const useTableQuery = (branchId, id) => {
  return useQuery({
    queryKey: ['table', branchId, id],
    queryFn: () => getTableByIdApi(branchId, id),
    enabled: Boolean(branchId && id),
  });
};

export const useCreateTableMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, payload }) => createTableApi(branchId, payload),
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: ['tables', branchId] });
      qc.invalidateQueries({ queryKey: ['table', branchId] });
    },
  });
};

export const useUpdateTableMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, id, payload }) => updateTableApi(branchId, id, payload),
    onSuccess: (_, { branchId, id }) => {
      qc.invalidateQueries({ queryKey: ['tables', branchId] });
      qc.invalidateQueries({ queryKey: ['table', branchId, id] });
    },
  });
};

export const useRegenerateQrMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, id }) => regenerateQrApi(branchId, id),
    onSuccess: (_, { branchId, id }) => {
      qc.invalidateQueries({ queryKey: ['table', branchId, id] });
      qc.invalidateQueries({ queryKey: ['tables', branchId] });
    },
  });
};
