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
    mutationFn: ({ branchId, id, tableId, payload }) => {
      const targetId = id || tableId;
      return updateTableApi(branchId, targetId, payload);
    },
    onSuccess: (_, { branchId, id, tableId }) => {
      const targetId = id || tableId;
      qc.invalidateQueries({ queryKey: ['tables', branchId] });
      if (targetId) {
        qc.invalidateQueries({ queryKey: ['table', branchId, targetId] });
      }
    },
  });
};

export const useRegenerateQrMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, id, tableId }) => {
      const targetId = id || tableId;
      return regenerateQrApi(branchId, targetId);
    },
    onSuccess: (_, { branchId, id, tableId }) => {
      const targetId = id || tableId;
      if (targetId) {
        qc.invalidateQueries({ queryKey: ['table', branchId, targetId] });
      }
      qc.invalidateQueries({ queryKey: ['tables', branchId] });
    },
  });
};
