import { useState, useMemo, useCallback, useEffect } from 'react';
import { useOrdersQuery, useOrderQuery, useUpdateOrderStatusMutation, useCancelOrderMutation, usePaymentMutation, useRefundMutation } from '../hooks/useOrders.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { toast } from '../../../shared/context/ToastContext.jsx';

import { PosOrdersFilterBar } from './pos-orders/PosOrdersFilterBar.jsx';
import { PosOrdersTable } from './pos-orders/PosOrdersTable.jsx';
import { PosOrderDetailDrawer } from './pos-orders/PosOrderDetailDrawer.jsx';

const normalizeCalendarDate = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const PosOrdersView = ({ allowStatusChange = true }) => {
  const { activeBranchId } = useBranch();

  // Date filter with default to local today YYYY-MM-DD
  const todayStr = useMemo(() => normalizeCalendarDate(new Date()), []);
  const [date, setDate] = useState(todayStr);

  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [source, setSource] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Debounce search (250ms) — avoids spamming backend while typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const { data: ordersResponse, refetch, isLoading, isFetching } = useOrdersQuery(activeBranchId, {
    page,
    limit,
    status: status !== 'all' ? status : undefined,
    type: type !== 'all' ? type : undefined,
    source: source !== 'all' ? source : undefined,
    date: date || undefined,
    q: debouncedQ || undefined,
  });

  // Reset to page 1 when filters or limit change
  useEffect(() => { setPage(1); }, [status, type, source, date, debouncedQ, limit]);

  const rawOrders = useMemo(() => ordersResponse?.items || [], [ordersResponse]);
  const filteredOrders = rawOrders;
  const pagination = ordersResponse?.pagination || null;

  const { data: fullOrderDetails } = useOrderQuery(activeBranchId, selectedOrder?.id);
  const currentSel = fullOrderDetails && fullOrderDetails.id === selectedOrder?.id ? fullOrderDetails : selectedOrder;

  const updateStatusMutation = useUpdateOrderStatusMutation();
  const cancelMutation = useCancelOrderMutation();
  const paymentMutation = usePaymentMutation();
  const refundMutation = useRefundMutation();

  const handleResetFilters = useCallback(() => {
    setQ('');
    setDate('');
    setStatus('all');
    setType('all');
    setSource('all');
  }, []);

  const activeCount = useMemo(
    () => filteredOrders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length,
    [filteredOrders]
  );

  const revenue = useMemo(
    () =>
      filteredOrders
        .filter((o) => o.status !== 'CANCELLED')
        .reduce((s, o) => {
          const tot = Number(o.total || o.totalAmount || 0);
          if (o.paymentStatus === 'PAID') return s + tot;
          if (o.paymentStatus === 'PARTIAL') return s + Number(o.amountPaid || 0);
          return s;
        }, 0),
    [filteredOrders]
  );

  // Status transition handler — payment guard lives in PosOrderDetailDrawer
  const handleStatusChange = useCallback(async (newStatus) => {
    if (!currentSel) return;
    try {
      await updateStatusMutation.mutateAsync({
        branchId: activeBranchId,
        id: currentSel.id,
        payload: {
          newStatus,
          expectedVersion: Number(currentSel.version || 1),
        },
      });

      await refetch();
      toast.success('تم تحديث حالة الطلب بنجاح');
    } catch (err) {
      if (err?.status === 409 || err?.response?.status === 409) {
        await refetch();
        toast.error('تم تحديث هذا الطلب بواسطة مستخدم آخر. تم تحديث البيانات، يرجى المحاولة ثانية.');
      } else {
        toast.error(err?.message || 'تعذر تغيير حالة الطلب.');
      }
    }
  }, [currentSel, activeBranchId, updateStatusMutation, refetch]);

  // Cancel order handler
  const handleCancelOrder = useCallback(async (orderId, cancelData) => {
    if (!currentSel) return;
    try {
      const reason = typeof cancelData === 'string' ? cancelData : cancelData?.reason || 'إلغاء الطلب';
      const refund = typeof cancelData === 'object' ? cancelData?.refund : false;
      const refundMethod = typeof cancelData === 'object' ? cancelData?.refundMethod : undefined;
      const refundAmount = typeof cancelData === 'object' ? cancelData?.refundAmount : undefined;

      await cancelMutation.mutateAsync({
        branchId: activeBranchId,
        id: orderId,
        payload: {
          expectedVersion: Number(currentSel.version || 1),
          reason,
          refund,
          refundMethod,
          refundAmount,
        },
      });

      await refetch();
      if (refund) {
        toast.success('تم إلغاء الطلب واسترجاع المبلغ وتحديث حسابات الوردية بنجاح');
      } else {
        toast.success('تم إلغاء الطلب بنجاح');
      }
    } catch (err) {
      if (err?.status === 409 || err?.response?.status === 409) {
        await refetch();
        toast.error('تم تحديث هذا الطلب بواسطة مستخدم آخر. تم تحديث البيانات، يرجى المحاولة ثانية.');
      } else {
        toast.error(err?.message || 'تعذر إلغاء الطلب.');
      }
    }
  }, [currentSel, activeBranchId, cancelMutation, refetch]);

  // Refund order handler (for cancelled or paid orders)
  const handleRefundOrder = useCallback(async (orderId, refundData) => {
    if (!currentSel) return;
    try {
      await refundMutation.mutateAsync({
        branchId: activeBranchId,
        orderId,
        payload: {
          expectedVersion: Number(refundData.expectedVersion || currentSel.version || 1),
          reason: refundData.reason,
          amount: refundData.amount,
          paymentMethod: refundData.paymentMethod,
        },
      });

      await refetch();
      toast.success('تم استرجاع المبلغ بنجاح وتحديث حسابات الوردية');
    } catch (err) {
      if (err?.status === 409 || err?.response?.status === 409) {
        await refetch();
        toast.error('تم تحديث هذا الطلب بواسطة مستخدم آخر. تم تحديث البيانات، يرجى المحاولة ثانية.');
      } else {
        toast.error(err?.message || 'تعذر استرجاع المبلغ.');
      }
    }
  }, [currentSel, activeBranchId, refundMutation, refetch]);

  // Payment settle handler (with optional autoDeliver)
  const handleAddPayment = useCallback(async (orderId, amount, method, autoDeliver = false) => {
    if (!currentSel) return;
    try {
      const payRes = await paymentMutation.mutateAsync({
        branchId: activeBranchId,
        orderId,
        payload: {
          amount,
          paymentMethod: method || 'CASH',
          expectedVersion: currentSel.version,
        },
      });

      const updatedOrder = payRes?.data || payRes;
      const newVersion = updatedOrder?.version || (Number(currentSel.version || 1) + 1);

      if (autoDeliver) {
        await updateStatusMutation.mutateAsync({
          branchId: activeBranchId,
          id: orderId,
          payload: {
            newStatus: 'DELIVERED',
            expectedVersion: newVersion,
          },
        });
        toast.success('تم تحصيل الدفعة وتسليم الطلب بنجاح');
      } else {
        toast.success('تم تسجيل الدفعة بنجاح');
      }

      await refetch();
    } catch (err) {
      if (err?.status === 409 || err?.response?.status === 409) {
        await refetch();
        toast.error('تم تحديث هذا الطلب بواسطة مستخدم آخر. تم تحديث البيانات، يرجى المحاولة ثانية.');
      } else {
        toast.error(err?.response?.data?.message || err?.message || 'تعذر تسجيل الدفعة.');
      }
    }
  }, [currentSel, activeBranchId, paymentMutation, updateStatusMutation, refetch]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-white dark:bg-zinc-950" dir="rtl">
      {/* Filters Bar */}
      <PosOrdersFilterBar
        totalOrders={pagination?.total ?? filteredOrders.length}
        activeCount={activeCount}
        revenue={revenue}
        searchQuery={q}
        onChangeSearch={setQ}
        date={date}
        onChangeDate={setDate}
        status={status}
        onChangeStatus={setStatus}
        type={type}
        onChangeType={setType}
        source={source}
        onChangeSource={setSource}
      />

      {/* Main Workspace (Table + Drawer) */}
      <div className="flex-1 flex overflow-hidden">
        <PosOrdersTable
          orders={filteredOrders}
          selectedOrderId={currentSel?.id}
          onSelectOrder={(o) => setSelectedOrder(o)}
          onClearFilters={handleResetFilters}
          onRefresh={refetch}
          isLoading={isLoading}
          isFetching={isFetching}
          pagination={pagination}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />

        {currentSel && (
          <PosOrderDetailDrawer
            isOpen={true}
            order={currentSel}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={allowStatusChange ? handleStatusChange : null}
            onCancelOrder={handleCancelOrder}
            onRefundOrder={handleRefundOrder}
            onSettlePayment={handleAddPayment}
            onAddPayment={handleAddPayment}
            isUpdatingStatus={updateStatusMutation.isPending}
            isCancelling={cancelMutation.isPending}
            isRefunding={refundMutation.isPending}
            isSettlingPayment={paymentMutation.isPending}
            allowStatusChange={allowStatusChange}
          />
        )}
      </div>
    </div>
  );
};

export default PosOrdersView;
