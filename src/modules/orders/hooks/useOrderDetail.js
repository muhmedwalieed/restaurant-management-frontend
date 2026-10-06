import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import {
  getOrderByIdApi,
  updateOrderStatusApi,
  processPaymentApi,
  cancelOrderApi,
} from '../../../lib/api/orders.api.js';
import { toast } from '../../../shared/context/ToastContext.jsx';

export const useOrderDetail = (orderIdFromProps) => {
  const { id: orderIdFromRoute } = useParams();
  const orderId = orderIdFromProps || orderIdFromRoute;
  const { activeBranchId } = useBranch();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['order', activeBranchId, orderId],
    queryFn: () => getOrderByIdApi(activeBranchId, orderId),
    enabled: Boolean(activeBranchId && orderId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, reason }) =>
      updateOrderStatusApi(activeBranchId, orderId, { status, reason }),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['order', activeBranchId, orderId], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['orders', activeBranchId] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      toast.success('تم تحديث حالة الطلب بنجاح');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || 'فشل تحديث حالة الطلب');
    },
  });

  const paymentMutation = useMutation({
    mutationFn: ({ method, amount, reference }) =>
      processPaymentApi(activeBranchId, orderId, {
        method,
        amount,
        reference,
        idempotencyKey: `pay-${Date.now()}-${Math.random()}`,
      }),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['order', activeBranchId, orderId], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['orders', activeBranchId] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      toast.success('تم تسجيل الدفعة بنجاح');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || 'فشل تسجيل الدفعة');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (payload) => cancelOrderApi(activeBranchId, orderId, payload),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['order', activeBranchId, orderId], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['orders', activeBranchId] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      toast.success('تم إلغاء الطلب');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || 'فشل إلغاء الطلب');
    },
  });

  return {
    order: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateStatusMutation,
    paymentMutation,
    cancelMutation,
  };
};

export default useOrderDetail;
