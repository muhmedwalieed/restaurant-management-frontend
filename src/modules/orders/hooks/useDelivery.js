import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDeliveryOrdersApi,
  pickupDeliveryOrderApi,
  deliverDeliveryOrderApi,
  failDeliveryOrderApi,
  getDriverWalletApi,
  settleDriverCashApi,
  getBranchDriversApi,
} from '../../../lib/api/delivery.api.js';

export const useDeliveryOrdersQuery = (branchId, params = {}) => {
  return useQuery({
    queryKey: ['delivery-orders', branchId, params],
    queryFn: () => getDeliveryOrdersApi(branchId, params),
    enabled: Boolean(branchId),
    refetchInterval: 5000,
    staleTime: 3000,
  });
};

export const useDriverWalletQuery = (branchId, driverId = null) => {
  return useQuery({
    queryKey: ['driver-wallet', branchId, driverId],
    queryFn: () => getDriverWalletApi(branchId, driverId),
    enabled: Boolean(branchId),
    refetchInterval: 8000,
    staleTime: 4000,
  });
};

export const usePickupDeliveryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, orderId, payload }) =>
      pickupDeliveryOrderApi(branchId, orderId, payload),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders', branchId] });
      queryClient.invalidateQueries({ queryKey: ['driver-wallet', branchId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useDeliverOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, orderId, payload }) =>
      deliverDeliveryOrderApi(branchId, orderId, payload),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders', branchId] });
      queryClient.invalidateQueries({ queryKey: ['driver-wallet', branchId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useFailDeliveryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, orderId, payload }) =>
      failDeliveryOrderApi(branchId, orderId, payload),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders', branchId] });
      queryClient.invalidateQueries({ queryKey: ['driver-wallet', branchId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useSettleDriverMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, payload }) =>
      settleDriverCashApi(branchId, payload),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['driver-wallet', branchId] });
      queryClient.invalidateQueries({ queryKey: ['branch-drivers', branchId] });
      queryClient.invalidateQueries({ queryKey: ['delivery-orders', branchId] });
    },
  });
};

export const useBranchDriversQuery = (branchId) => {
  return useQuery({
    queryKey: ['branch-drivers', branchId],
    queryFn: () => getBranchDriversApi(branchId),
    enabled: Boolean(branchId),
    staleTime: 5000,
  });
};
