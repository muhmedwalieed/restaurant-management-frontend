import { useState, useMemo } from 'react';
import {
  useOrderQuery,
  useOrderHistoryQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  usePaymentMutation,
  useRefundMutation,
} from './useOrders.js';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';

export const useOrderDetail = (branchId, orderId) => {
  const [actionSuccess, setActionSuccess] = useAutoDismiss();
  const [actionError, setActionError] = useState(null);

  // Modals state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const {
    data: order,
    isLoading: isOrderLoading,
    isError,
    error,
    refetch: refetchOrder,
  } = useOrderQuery(branchId, orderId);

  const { data: historyData } = useOrderHistoryQuery(branchId, orderId);

  const updateStatusMutation = useUpdateOrderStatusMutation();
  const cancelMutation = useCancelOrderMutation();
  const paymentMutation = usePaymentMutation();
  const refundMutation = useRefundMutation();

  // Multi-round grouping
  const orderRounds = useMemo(() => {
    const roundsMap = new Map();
    for (const it of order?.items || []) {
      const r = it.round || 1;
      if (!roundsMap.has(r)) roundsMap.set(r, []);
      roundsMap.get(r).push(it);
    }
    return Array.from(roundsMap.entries())
      .map(([round, items]) => ({
        round,
        items,
        subtotal: items.reduce((acc, i) => acc + Number(i.subtotal || i.total || 0), 0),
      }))
      .sort((a, b) => a.round - b.round);
  }, [order?.items]);

  const handleStatusChange = async (newStatus) => {
    setActionError(null);
    try {
      await updateStatusMutation.mutateAsync({
        branchId,
        id: orderId,
        payload: {
          newStatus,
          expectedVersion: order?.version || 1,
        },
      });
      setActionSuccess('تم تحديث حالة الطلب بنجاح.');
      refetchOrder();
    } catch (err) {
      setActionError(err?.message || 'فشل في تحديث حالة الطلب.');
    }
  };

  const handleCancelOrder = async () => {
    setActionError(null);
    try {
      await cancelMutation.mutateAsync({
        branchId,
        id: orderId,
        payload: {
          expectedVersion: order?.version || 1,
          reason: cancelReason.trim() || 'تم الإلغاء بواسطة الموظف',
        },
      });
      setActionSuccess('تم إلغاء الطلب بنجاح.');
      setIsCancelModalOpen(false);
      refetchOrder();
    } catch (err) {
      setActionError(err?.message || 'فشل في إلغاء الطلب.');
    }
  };

  const handlePayment = async () => {
    setActionError(null);
    const amt = parseFloat(paymentAmount);
    if (!amt || amt <= 0) return;

    try {
      await paymentMutation.mutateAsync({
        branchId,
        orderId,
        payload: {
          amount: amt,
          paymentMethod,
          expectedVersion: order?.version || 1,
        },
      });
      setActionSuccess('تم تسجيل الدفعة المالية بنجاح.');
      setIsPaymentModalOpen(false);
      setPaymentAmount('');
      refetchOrder();
    } catch (err) {
      setActionError(err?.message || 'فشل في تسجيل الدفعة.');
    }
  };

  const handleRefund = async () => {
    setActionError(null);
    const amt = parseFloat(refundAmount);
    if (!amt || amt <= 0) return;

    try {
      await refundMutation.mutateAsync({
        branchId,
        orderId,
        payload: {
          amount: amt,
          reason: refundReason.trim() || 'استرداد نقدي للعميل',
        },
      });
      setActionSuccess('تم استرداد المبلغ بنجاح.');
      setIsRefundModalOpen(false);
      setRefundAmount('');
      refetchOrder();
    } catch (err) {
      setActionError(err?.message || 'فشل في استرداد المبلغ.');
    }
  };

  return {
    order,
    isOrderLoading,
    isError,
    error,
    historyData,
    orderRounds,
    actionSuccess,
    actionError,
    isCancelModalOpen,
    setIsCancelModalOpen,
    cancelReason,
    setCancelReason,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    paymentAmount,
    setPaymentAmount,
    paymentMethod,
    setPaymentMethod,
    isRefundModalOpen,
    setIsRefundModalOpen,
    refundAmount,
    setRefundAmount,
    refundReason,
    setRefundReason,
    isPrintModalOpen,
    setIsPrintModalOpen,
    updateStatusMutation,
    cancelMutation,
    paymentMutation,
    refundMutation,
    handleStatusChange,
    handleCancelOrder,
    handlePayment,
    handleRefund,
  };
};
