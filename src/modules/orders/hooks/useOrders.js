import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrdersApi,
  getAllOrdersApi,
  getOrderByIdApi,
  createOrderApi,
  updateOrderStatusApi,
  cancelOrderApi,
  getOrderHistoryApi,
  createPosOrderApi,
  processPaymentApi,
  processRefundApi,
  getKdsOrdersApi,
  updateKdsOrderStatusApi,
} from '../../../lib/api/orders.api.js';

export const useOrdersQuery = (branchId, params = {}) => {
  return useQuery({
    queryKey: ['orders', branchId, params],
    queryFn: () => getOrdersApi(branchId, params),
    enabled: Boolean(branchId),
  });
};

export const useAllOrdersQuery = (params = {}) => {
  return useQuery({
    queryKey: ['all-orders', params],
    queryFn: () => getAllOrdersApi(params),
  });
};

export const useOrderQuery = (branchId, id) => {
  return useQuery({
    queryKey: ['order', branchId, id],
    queryFn: () => getOrderByIdApi(branchId, id),
    enabled: Boolean(branchId && id),
  });
};

export const useOrderHistoryQuery = (branchId, id) => {
  return useQuery({
    queryKey: ['order-history', branchId, id],
    queryFn: () => getOrderHistoryApi(branchId, id),
    enabled: Boolean(branchId && id),
  });
};

export const useCreateOrderMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, payload, idempotencyKey }) => createOrderApi(branchId, payload, idempotencyKey),
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: ['orders', branchId] });
      qc.invalidateQueries({ queryKey: ['tables', branchId] });
    },
  });
};

export const useUpdateOrderStatusMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, id, payload }) => updateOrderStatusApi(branchId, id, payload),
    onSuccess: (_, { branchId, id }) => {
      qc.invalidateQueries({ queryKey: ['orders', branchId] });
      qc.invalidateQueries({ queryKey: ['order', branchId, id] });
      qc.invalidateQueries({ queryKey: ['order-history', branchId, id] });
      qc.invalidateQueries({ queryKey: ['tables', branchId] });
    },
  });
};

export const useCancelOrderMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, id, payload }) => cancelOrderApi(branchId, id, payload),
    onSuccess: (_, { branchId, id }) => {
      qc.invalidateQueries({ queryKey: ['orders', branchId] });
      qc.invalidateQueries({ queryKey: ['order', branchId, id] });
      qc.invalidateQueries({ queryKey: ['order-history', branchId, id] });
      qc.invalidateQueries({ queryKey: ['tables', branchId] });
    },
  });
};

export const useCreatePosOrderMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args) => {
      const branchId = args?.branchId;
      const idempotencyKey =
        args?.idempotencyKey ||
        (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pos-${Date.now()}-${Math.random()}`);
      const payload = args?.payload ? { ...args.payload } : { ...args };
      delete payload.branchId;
      delete payload.idempotencyKey;
      return createPosOrderApi(branchId, payload, idempotencyKey);
    },
    onSuccess: (_, args) => {
      const branchId = args?.branchId;
      qc.invalidateQueries({ queryKey: ['orders', branchId] });
      qc.invalidateQueries({ queryKey: ['tables', branchId] });
    },
  });
};

export const usePaymentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, orderId, id, payload, idempotencyKey }) => {
      const key =
        idempotencyKey ||
        payload?.idempotencyKey ||
        (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pay-${Date.now()}-${Math.random()}`);
      return processPaymentApi(branchId, orderId || id, payload, key);
    },
    onSuccess: (_, vars) => {
      const oId = vars?.orderId || vars?.id;
      const bId = vars?.branchId;
      qc.invalidateQueries({ queryKey: ['orders', bId] });
      qc.invalidateQueries({ queryKey: ['tables', bId] });
      qc.invalidateQueries({ queryKey: ['branch-sessions', bId] });
      if (oId) qc.invalidateQueries({ queryKey: ['order', bId, oId] });
    },
  });
};

export const useRefundMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, orderId, payload }) => processRefundApi(branchId, orderId, payload),
    onSuccess: (_, { branchId, orderId }) => {
      qc.invalidateQueries({ queryKey: ['orders', branchId] });
      qc.invalidateQueries({ queryKey: ['order', branchId, orderId] });
    },
  });
};

export const useKdsOrdersQuery = (branchId, params = {}) => {
  return useQuery({
    queryKey: ['kds', branchId, params],
    queryFn: () => getKdsOrdersApi(branchId, params),
    enabled: Boolean(branchId),
  });
};

export const useUpdateKdsStatusMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, orderId, payload }) => updateKdsOrderStatusApi(branchId, orderId, payload),
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: ['kds', branchId] });
      qc.invalidateQueries({ queryKey: ['orders', branchId] });
      qc.invalidateQueries({ queryKey: ['tables', branchId] });
    },
  });
};
