import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDeliveryOrdersApi,
  getPendingHandoversApi,
  requestPickupOrderApi,
  approvePickupOrderApi,
  rejectPickupOrderApi,
  cancelPickupOrderApi,
  assignDriverOrderApi,
  acceptDriverAssignmentApi,
  rejectDriverAssignmentApi,
  cancelDriverAssignmentApi,
  pickupDeliveryOrderApi,
  deliverDeliveryOrderApi,
  failDeliveryOrderApi,
  handoverReturnOrderApi,
  confirmReturnOrderApi,
  getDriverWalletApi,
  settleDriverCashApi,
  getBranchDriversApi,
} from '../../../lib/api/delivery.api.js';

export const usePendingHandoversQuery = (branchId) => {
  return useQuery({
    queryKey: ['pending-handovers', branchId],
    queryFn: () => getPendingHandoversApi(branchId),
    enabled: Boolean(branchId),
    refetchInterval: 3000,
    staleTime: 1500,
  });
};

export const useRequestPickupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, orderId }) => requestPickupOrderApi(branchId, orderId),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-handovers'] });
      queryClient.invalidateQueries({ queryKey: ['driver-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['branch-drivers'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useApprovePickupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, orderId }) => approvePickupOrderApi(branchId, orderId),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['pending-handovers'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['driver-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['branch-drivers'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useRejectPickupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, orderId, payload }) => rejectPickupOrderApi(branchId, orderId, payload),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['pending-handovers'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['driver-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['branch-drivers'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useCancelPickupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, orderId }) => cancelPickupOrderApi(branchId, orderId),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-handovers'] });
      queryClient.invalidateQueries({ queryKey: ['driver-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['branch-drivers'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useAssignDriverMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, orderId, driverEmployeeId }) =>
      assignDriverOrderApi(branchId, orderId, driverEmployeeId),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-handovers'] });
      queryClient.invalidateQueries({ queryKey: ['driver-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['branch-drivers'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useAcceptAssignmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, orderId }) =>
      acceptDriverAssignmentApi(branchId, orderId),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-handovers'] });
      queryClient.invalidateQueries({ queryKey: ['driver-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['branch-drivers'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useRejectAssignmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, orderId, payload }) =>
      rejectDriverAssignmentApi(branchId, orderId, payload),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-handovers'] });
      queryClient.invalidateQueries({ queryKey: ['driver-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['branch-drivers'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useCancelAssignmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, orderId }) =>
      cancelDriverAssignmentApi(branchId, orderId),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-handovers'] });
      queryClient.invalidateQueries({ queryKey: ['driver-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['branch-drivers'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

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
    refetchInterval: 5000,
    staleTime: 2500,
  });
};

export const usePickupDeliveryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, orderId, payload }) =>
      pickupDeliveryOrderApi(branchId, orderId, payload),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['driver-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['branch-drivers'] });
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
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['driver-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['branch-drivers'] });
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
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-handovers'] });
      queryClient.invalidateQueries({ queryKey: ['driver-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['branch-drivers'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useHandoverReturnMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, orderId }) =>
      handoverReturnOrderApi(branchId, orderId),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-handovers'] });
      queryClient.invalidateQueries({ queryKey: ['driver-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['branch-drivers'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useConfirmReturnMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, orderId }) =>
      confirmReturnOrderApi(branchId, orderId),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-handovers'] });
      queryClient.invalidateQueries({ queryKey: ['driver-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['branch-drivers'] });
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
      queryClient.invalidateQueries({ queryKey: ['driver-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['branch-drivers'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
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
