import { useState, useMemo, useCallback, useEffect } from 'react';
import { useOrdersQuery, useOrderQuery, useUpdateOrderStatusMutation, useCancelOrderMutation, usePaymentMutation } from '../hooks/useOrders.js';
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

export const PosOrdersView = () => {
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const limit = 20;

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

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [status, type, source, date, debouncedQ]);

  const rawOrders = useMemo(() => ordersResponse?.items || [], [ordersResponse]);
  const filteredOrders = rawOrders;
  const pagination = ordersResponse?.pagination || null;

  const { data: fullOrderDetails } = useOrderQuery(activeBranchId, selectedOrder?.id);
  const currentSel = fullOrderDetails && fullOrderDetails.id === selectedOrder?.id ? fullOrderDetails : selectedOrder;

  const updateStatusMutation = useUpdateOrderStatusMutation();
  const cancelMutation = useCancelOrderMutation();
  const paymentMutation = usePaymentMutation();

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
          expectedVersion: currentSel.version,
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
  const handleCancelOrder = useCallback(async (orderId, reason) => {
    if (!currentSel) return;
    try {
      await cancelMutation.mutateAsync({
        branchId: activeBranchId,
        id: orderId,
        payload: {
          expectedVersion: currentSel.version,
          reason: reason || 'إلغاء من الكاشير',
        },
      });

      await refetch();
      toast.success('تم إلغاء الطلب بنجاح');
    } catch (err) {
      if (err?.status === 409 || err?.response?.status === 409) {
        await refetch();
        toast.error('تم تحديث هذا الطلب بواسطة مستخدم آخر. تم تحديث البيانات، يرجى المحاولة ثانية.');
      } else {
        toast.error(err?.message || 'تعذر إلغاء الطلب.');
      }
    }
  }, [currentSel, activeBranchId, cancelMutation, refetch]);

  // Payment settle handler
  const handleAddPayment = useCallback(async (orderId, amount, method) => {
    if (!currentSel) return;
    try {
      await paymentMutation.mutateAsync({
        branchId: activeBranchId,
        orderId,
        payload: {
          amount,
          paymentMethod: method || 'CASH',
          expectedVersion: currentSel.version,
        },
      });

      await refetch();
      toast.success('تم تسجيل الدفعة بنجاح');
    } catch (err) {
      if (err?.status === 409 || err?.response?.status === 409) {
        await refetch();
        toast.error('تم تحديث هذا الطلب بواسطة مستخدم آخر. تم تحديث البيانات، يرجى المحاولة ثانية.');
      } else {
        toast.error(err?.response?.data?.message || err?.message || 'تعذر تسجيل الدفعة.');
      }
    }
  }, [currentSel, activeBranchId, paymentMutation, refetch]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-transparent" dir="rtl">
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
          isLoading={isLoading}
          isFetching={isFetching}
          pagination={pagination}
          page={page}
          onPageChange={setPage}
        />

        {currentSel && (
          <PosOrderDetailDrawer
            order={currentSel}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={handleStatusChange}
            onCancelOrder={handleCancelOrder}
            onAddPayment={handleAddPayment}
            isUpdatingStatus={updateStatusMutation.isPending}
            isCancelling={cancelMutation.isPending}
            isSettlingPayment={paymentMutation.isPending}
          />
        )}
      </div>
    </div>
  );
};

export default PosOrdersView;
