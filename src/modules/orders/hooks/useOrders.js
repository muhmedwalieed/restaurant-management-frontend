import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrdersApi,
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
    mutationFn: ({ branchId, payload, idempotencyKey }) => createPosOrderApi(branchId, payload, idempotencyKey),
    onSuccess: (_, { branchId }) => {
      qc.invalidateQueries({ queryKey: ['orders', branchId] });
      qc.invalidateQueries({ queryKey: ['tables', branchId] });
    },
  });
};

export const usePaymentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, orderId, payload }) => processPaymentApi(branchId, orderId, payload),
    onSuccess: (_, { branchId, orderId }) => {
      qc.invalidateQueries({ queryKey: ['orders', branchId] });
      qc.invalidateQueries({ queryKey: ['order', branchId, orderId] });
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
    refetchInterval: 30000,
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