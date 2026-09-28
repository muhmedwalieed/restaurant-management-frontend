import { useState, useMemo, useCallback } from 'react';
import { useTablesQuery, useUpdateTableMutation } from './useTables.js';
import {
  useBranchSessionsQuery,
  useStartTableSession,
  useCloseTableSession,
  useConfirmTableSession,
  useDismissWaiterCall,
} from './useTableSessions.js';
import { useOrdersQuery, useUpdateOrderStatusMutation, usePaymentMutation } from '../../orders/hooks/useOrders.js';

export const ALERT_PRIORITIES = ['check', 'order', 'help'];

export const ALERT_CONFIG = {
  help: {
    label: 'يطلب مساعدة',
    color: 'var(--warn)',
    bg: 'var(--warn-bg)',
    border: 'rgba(183,134,60,.2)',
  },
  order: {
    label: 'طلب ينتظر التأكيد',
    color: 'var(--ac)',
    bg: 'var(--ac-bg)',
    border: 'rgba(15,23,42,.12)',
  },
  check: {
    label: 'يطلب الحساب',
    color: 'var(--ok)',
    bg: 'var(--ok-bg)',
    border: 'rgba(22,163,74,.2)',
  },
};

/**
 * Custom hook that consolidates tables, sessions, active dine-in orders, and alerts.
 * Shared between WaiterPage, PosTablesView, and related live table components.
 */
export const useTableGridState = (activeBranchId) => {
  const [localPins, setLocalPins] = useState({});

  const {
    data: tablesResponse,
    isLoading: isTablesLoading,
    refetch: refetchTables,
  } = useTablesQuery(activeBranchId, { page: 1, limit: 100 });

  const {
    data: ordersResponse,
    isLoading: isOrdersLoading,
    refetch: refetchOrders,
  } = useOrdersQuery(activeBranchId, { page: 1, limit: 100 });

  const {
    data: sessionsData,
    isLoading: isSessionsLoading,
    refetch: refetchSessions,
  } = useBranchSessionsQuery(activeBranchId, true);

  // Mutations
  const startSessionMutation = useStartTableSession();
  const closeSessionMutation = useCloseTableSession();
  const confirmSessionMutation = useConfirmTableSession();
  const dismissCallMutation = useDismissWaiterCall();
  const updateTableMutation = useUpdateTableMutation();
  const paymentMutation = usePaymentMutation();
  const updateOrderStatusMutation = useUpdateOrderStatusMutation();

  const rawTables = useMemo(() => tablesResponse?.items || [], [tablesResponse]);
  const rawOrders = useMemo(() => ordersResponse?.items || [], [ordersResponse]);
  const branchSessions = useMemo(() => {
    const list = sessionsData?.data || sessionsData || [];
    return Array.isArray(list) ? list : [];
  }, [sessionsData]);

  // Map of tableId -> active session
  const tableSessionMap = useMemo(() => {
    const map = new Map();
    for (const s of branchSessions) {
      if (s.tableId && s.status !== 'CLOSED') {
        map.set(s.tableId, s);
      }
    }
    return map;
  }, [branchSessions]);

  // Active dine-in orders map by tableId
  const tableOrderMap = useMemo(() => {
    const map = new Map();
    for (const o of rawOrders) {
      const tid = o.tableId || o.table?.id;
      if (
        tid &&
        o.type === 'DINE_IN' &&
        o.status !== 'DELIVERED' &&
        o.status !== 'CANCELLED' &&
        o.paymentStatus !== 'PAID'
      ) {
        if (!map.has(tid)) map.set(tid, o);
      }
    }
    return map;
  }, [rawOrders]);

  // Format tables
  const tables = useMemo(() => {
    return rawTables.map((t, idx) => {
      const session = tableSessionMap.get(t.id);
      const activeOrder = tableOrderMap.get(t.id);
      const isOccupied = Boolean(session) || (Boolean(activeOrder) && activeOrder.paymentStatus !== 'PAID');

      const hasBillCall = session?.waiterCalls?.some(
        (c) => (c.status === 'PENDING' || c.status === 'ACCEPTED') && c.type === 'BILL'
      );
      const hasOrderCall = session?.waiterCalls?.some(
        (c) => (c.status === 'PENDING' || c.status === 'ACCEPTED') && c.type === 'CONFIRM_ORDER'
      );
      const isSessionAwaiting = session?.status === 'AWAITING_CONFIRMATION';
      const isOrderPending = activeOrder?.status === 'PENDING';
      const hasHelpCall = session?.waiterCalls?.some(
        (c) => (c.status === 'PENDING' || c.status === 'ACCEPTED') && c.type === 'HELP'
      );

      const alerts = [];
      if (hasBillCall) alerts.push('check');
      if (hasOrderCall || isSessionAwaiting || isOrderPending) alerts.push('order');
      if (hasHelpCall) alerts.push('help');

      let items = [];
      let reviewItems = [];
      let pendingOrderNumber = null;

      if (session) {
        if (Array.isArray(session.orders)) {
          for (const o of session.orders) {
            if (Array.isArray(o.items) && o.status === 'CONFIRMED') {
              for (const it of o.items) {
                const pId = it.productId || it.id;
                const existing = items.find((i) => (i.productId || i.id) === pId);
                if (existing) {
                  existing.qty += it.quantity;
                } else {
                  items.push({
                    id: pId,
                    productId: pId,
                    name: it.productName,
                    qty: it.quantity,
                    price: Number(it.unitPrice || 0),
                  });
                }
              }
            }
          }
        }

        // Review items specifically awaiting waiter confirmation
        const pendingOrders = Array.isArray(session.orders)
          ? session.orders.filter((o) => o.status === 'AWAITING_CONFIRMATION')
          : [];

        if (pendingOrders.length > 0) {
          for (const po of pendingOrders) {
            pendingOrderNumber = po.orderNumber || pendingOrderNumber;
            if (Array.isArray(po.items)) {
              for (const it of po.items) {
                const pId = it.productId || it.id;
                const existing = reviewItems.find((i) => (i.productId || i.id) === pId);
                if (existing) {
                  existing.qty += it.quantity;
                } else {
                  reviewItems.push({
                    id: it.id || pId,
                    itemId: it.id,
                    productId: pId,
                    name: it.productName,
                    qty: it.quantity,
                    price: Number(it.unitPrice || 0),
                    orderNumber: po.orderNumber,
                    orderId: po.id,
                  });
                }
              }
            }
          }
        }
      } else if (activeOrder && Array.isArray(activeOrder.items)) {
        items = activeOrder.items.map((i) => ({
          id: i.productId || i.id,
          productId: i.productId || i.id,
          name: i.productName || i.name,
          qty: i.quantity,
          price: Number(i.unitPrice || i.price || 0),
        }));
      }

      let openedAt = '—';
      if (session?.openedAt) {
        openedAt = new Date(session.openedAt).toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
        });
      } else if (activeOrder?.createdAt) {
        openedAt = new Date(activeOrder.createdAt).toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      const confirmedOrdersTotal = Array.isArray(session?.orders)
        ? session.orders
            .filter((o) => o.status === 'CONFIRMED')
            .reduce((s, o) => s + Number(o.total || 0), 0)
        : (session ? Number(session.total || session.confirmedTotal || 0) : 0);

      const orderTotal = activeOrder ? Number(activeOrder.total || 0) : 0;
      const computedTotal = Math.max(confirmedOrdersTotal, orderTotal);

      return {
        id: t.id,
        number: t.number,
        displayNum: t.number != null ? t.number : idx + 1,
        capacity: t.capacity || 4,
        section: t.section || null,
        status: isOccupied ? 'occupied' : 'available',
        needsWaiter: hasHelpCall,
        pendingOrder: Boolean(hasOrderCall || isSessionAwaiting || isOrderPending),
        needsBill: hasBillCall,
        qrToken: t.qrToken || null,
        session: isOccupied
          ? {
              id: session?.id || activeOrder?.id,
              dbSessionId: session?.id || null,
              openedAt,
              pin: localPins[t.id] || session?.pin || null,
              ordersCount: (session?.orders?.length || (activeOrder ? 1 : 0)),
              membersCount: session?.members?.length || 1,
              itemsCount: items.reduce((s, i) => s + i.qty, 0),
              total: computedTotal,
              alerts,
              activeOrder,
              items,
              reviewItems,
              pendingOrderNumber,
              waiterCalls: session?.waiterCalls || [],
            }
          : null,
      };
    });
  }, [rawTables, tableSessionMap, tableOrderMap, localPins]);

  const refetchAll = useCallback(() => {
    refetchTables();
    refetchOrders();
    refetchSessions();
  }, [refetchTables, refetchOrders, refetchSessions]);

  const recordLocalPin = useCallback((tableId, pin) => {
    setLocalPins((prev) => ({ ...prev, [tableId]: pin }));
  }, []);

  return {
    tables,
    rawTables,
    rawOrders,
    branchSessions,
    tableSessionMap,
    tableOrderMap,
    isLoading: isTablesLoading || isOrdersLoading || isSessionsLoading,
    refetchAll,
    recordLocalPin,
    startSessionMutation,
    closeSessionMutation,
    confirmSessionMutation,
    dismissCallMutation,
    updateTableMutation,
    paymentMutation,
    updateOrderStatusMutation,
  };
};
