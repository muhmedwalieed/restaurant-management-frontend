import { useState, useMemo, useCallback } from 'react';
import { useOrdersQuery, useOrderQuery, useUpdateOrderStatusMutation, useCancelOrderMutation, usePaymentMutation } from '../hooks/useOrders.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';

import { PosOrdersFilterBar } from './pos-orders/PosOrdersFilterBar.jsx';
import { PosOrdersTable } from './pos-orders/PosOrdersTable.jsx';
import { PosOrderDetailDrawer } from './pos-orders/PosOrderDetailDrawer.jsx';

export const PosOrdersView = () => {
  const { activeBranchId } = useBranch();

  // Date filter with default to local today YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA'), []);
  const [date, setDate] = useState(todayStr);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [source, setSource] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: ordersResponse, refetch } = useOrdersQuery(activeBranchId, {
    page: 1,
    limit: 100,
  });

  const { data: fullOrderDetails } = useOrderQuery(activeBranchId, selectedOrder?.id);
  const currentSel = fullOrderDetails && fullOrderDetails.id === selectedOrder?.id ? fullOrderDetails : selectedOrder;

  const updateStatusMutation = useUpdateOrderStatusMutation();
  const cancelMutation = useCancelOrderMutation();
  const paymentMutation = usePaymentMutation();

  const filteredOrders = useMemo(() => {
    const orders = ordersResponse?.items || [];
    return orders.filter((o) => {
      if (date) {
        const orderDate = new Date(o.createdAt).toLocaleDateString('en-CA');
        if (orderDate !== date) return false;
      }

      if (status !== 'all' && o.status !== status) return false;
      if (type !== 'all' && o.type !== type) return false;
      if (source !== 'all' && o.source !== source) return false;

      const custName = o.customer?.name || o.customerName || '';
      const custPhone = o.customer?.phone || o.customerPhone || '';
      const numStr = String(o.orderNumber || o.id || '');

      if (
        q.trim() &&
        !numStr.includes(q.trim()) &&
        !custName.toLowerCase().includes(q.toLowerCase()) &&
        !custPhone.includes(q.trim())
      ) {
        return false;
      }
      return true;
    });
  }, [ordersResponse?.items, date, status, type, source, q]);

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
          if (o.paymentStatus === 'PARTIAL') return s + Number(o.amountPaid || tot / 2);
          return s;
        }, 0),
    [filteredOrders]
  );

  // Status transition handler
  const handleStatusChange = useCallback(async (newStatus) => {
    if (!currentSel) return;
    try {
      await updateStatusMutation.mutateAsync({
        branchId: activeBranchId,
        id: currentSel.id,
        payload: {
          newStatus,
          expectedVersion: currentSel.version || 1,
        },
      });

      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus, version: (prev.version || 1) + 1 } : null));
      refetch();
    } catch (err) {
      alert(err?.message || 'تعذر تغيير حالة الطلب.');
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
          expectedVersion: currentSel.version || 1,
          reason: reason || 'إلغاء من الكاشير',
        },
      });

      setSelectedOrder((prev) => (prev ? { ...prev, status: 'CANCELLED', version: (prev.version || 1) + 1 } : null));
      refetch();
    } catch (err) {
      alert(err?.message || 'تعذر إلغاء الطلب.');
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
          expectedVersion: currentSel.version || 1,
        },
      });

      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              paymentStatus: 'PAID',
              paymentMethod: method,
              paidAt: new Date().toISOString(),
              version: (prev.version || 1) + 1,
            }
          : null
      );
      refetch();
    } catch (err) {
      alert(err?.message || 'تعذر تسجيل الدفعة.');
    }
  }, [currentSel, activeBranchId, paymentMutation, refetch]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden" dir="rtl" style={{ background: 'var(--bg)' }}>
      {/* Filters Bar */}
      <PosOrdersFilterBar
        totalOrders={filteredOrders.length}
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
