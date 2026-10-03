import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSocket } from '../../../shared/realtime/SocketProvider.jsx';
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
    color: 'var(--err)',
    bg: 'var(--err-bg)',
    border: 'rgba(239,68,68,.25)',
  },
  order: {
    label: 'طلب ينتظر التأكيد',
    color: 'var(--ac)',
    bg: 'var(--ac-bg)',
    border: 'rgba(59,130,246,.25)',
  },
  check: {
    label: 'يطلب الحساب',
    color: 'var(--warn)',
    bg: 'var(--warn-bg)',
    border: 'rgba(245,158,11,.25)',
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

  const { isConnected } = useSocket();

  const {
    data: sessionsData,
    isLoading: isSessionsLoading,
    refetch: refetchSessions,
  } = useBranchSessionsQuery(activeBranchId, !isConnected);



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

  // Active dine-in orders map by tableId — a table may hold several active orders
  const tableOrdersMap = useMemo(() => {
    const map = new Map();
    for (const o of rawOrders) {
      const tid = o.tableId || o.table?.id;
      if (
        tid &&
        o.type === 'DINE_IN' &&
        o.status !== 'DELIVERED' &&
        o.status !== 'CANCELLED'
      ) {
        if (!map.has(tid)) map.set(tid, []);
        map.get(tid).push(o);
      }
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    }
    return map;
  }, [rawOrders]);

  // Format tables sorted naturally
  const tables = useMemo(() => {
    const sorted = [...rawTables].sort((a, b) => {
      const getNum = (item) => {
        const val = String(item.label || item.name || item.tableNumber || item.number || item.id || '');
        const match = val.match(/\d+/);
        return match ? parseInt(match[0], 10) : NaN;
      };
      const numA = getNum(a);
      const numB = getNum(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        if (numA !== numB) return numA - numB;
      }
      const strA = String(a.label || a.name || a.tableNumber || a.id || '');
      const strB = String(b.label || b.name || b.tableNumber || b.id || '');
      return strA.localeCompare(strB, 'ar-EG', { numeric: true });
    });

    return sorted.map((t, idx) => {
      const session = tableSessionMap.get(t.id);
      const activeOrders = tableOrdersMap.get(t.id) || [];
      const activeOrder = activeOrders[0] || null;
      const isOccupied =
        String(t.status || '').toUpperCase() === 'OCCUPIED' ||
        Boolean(session) ||
        activeOrders.length > 0;

      const hasBillCall = session?.waiterCalls?.some(
        (c) => (c.status === 'PENDING' || c.status === 'ACCEPTED') && c.type === 'BILL'
      );
      const hasOrderCall = session?.waiterCalls?.some(
        (c) => (c.status === 'PENDING' || c.status === 'ACCEPTED') && c.type === 'CONFIRM_ORDER'
      );
      const isSessionAwaiting = session?.status === 'AWAITING_CONFIRMATION';
      const isOrderPending = activeOrder?.status === 'PENDING' || activeOrder?.status === 'AWAITING_CONFIRMATION';
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
      const sessionOrderRealIds = new Set();

      const mergeItem = (target, it) => {
        const pId = it.productId || it.id;
        const existing = target.find((i) => (i.productId || i.id) === pId);
        if (existing) {
          existing.qty += it.quantity;
        } else {
          target.push({
            id: pId,
            productId: pId,
            name: it.productName || it.name,
            qty: it.quantity,
            price: Number(it.unitPrice ?? it.price ?? 0),
          });
        }
      };

      if (session) {
        if (session.confirmedOrderId) sessionOrderRealIds.add(session.confirmedOrderId);

        if (Array.isArray(session.orders)) {
          for (const o of session.orders) {
            if (o.orderId) sessionOrderRealIds.add(o.orderId);
            if (Array.isArray(o.items) && o.status === 'CONFIRMED') {
              for (const it of o.items) mergeItem(items, it);
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
      }

      // Standalone active orders on the table — every active order counts toward
      // the table's items and total (a table can hold multiple orders per visit).
      const standaloneOrders = activeOrders.filter((o) => !sessionOrderRealIds.has(o.id));
      for (const o of standaloneOrders) {
        if (Array.isArray(o.items)) {
          for (const it of o.items) mergeItem(items, it);
        }
      }

      const rawOpenedAt = session?.openedAt || session?.createdAt || session?.created_at || session?.createdAtRaw || null;
      let openedAt = '—';
      let openedAtIso = null;
      if (rawOpenedAt) {
        const d = new Date(rawOpenedAt);
        if (!isNaN(d.getTime())) {
          openedAtIso = d.toISOString();
          openedAt = d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        }
      }
      if (openedAt === '—' && activeOrder?.createdAt) {
        const d2 = new Date(activeOrder.createdAt);
        if (!isNaN(d2.getTime())) {
          openedAtIso = d2.toISOString();
          openedAt = d2.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        }
      }

      const confirmedSessionOrders = Array.isArray(session?.orders)
        ? session.orders.filter((o) => o.status === 'CONFIRMED')
        : [];

      const confirmedSessionTotal = Array.isArray(session?.orders)
        ? confirmedSessionOrders.reduce((s, o) => s + Number(o.total || 0), 0)
        : (session ? Number(session.total || session.confirmedTotal || 0) : 0);

      const standaloneTotal = standaloneOrders.reduce((s, o) => s + Number(o.total || 0), 0);
      const computedTotal = confirmedSessionTotal + standaloneTotal;
      const ordersCount = confirmedSessionOrders.length + standaloneOrders.length;

      const toDisplayItem = (it) => ({
        id: it.productId || it.id,
        productId: it.productId || it.id,
        name: it.productName || it.name,
        qty: it.quantity,
        price: Number(it.unitPrice ?? it.price ?? 0),
      });

      const orderNumberById = new Map(rawOrders.map((o) => [o.id, o.orderNumber]));

      // Per-order breakdown: the items of each order, while the table total is their sum.
      const orderGroups = [
        ...confirmedSessionOrders.map((o) => ({
          key: `s-${o.id}`,
          orderNumber: (o.orderId && orderNumberById.get(o.orderId)) ?? o.orderNumber ?? null,
          status: o.status,
          total: Number(o.total || 0),
          items: Array.isArray(o.items) ? o.items.map(toDisplayItem) : [],
        })),
        ...standaloneOrders.map((o) => ({
          key: `o-${o.id}`,
          orderNumber: o.orderNumber ?? null,
          status: o.status,
          total: Number(o.total || 0),
          items: Array.isArray(o.items) ? o.items.map(toDisplayItem) : [],
        })),
      ];

      return {
        id: t.id,
        label: t.label,
        name: t.name,
        number: t.number,
        displayNum: t.label || t.name || (t.number != null ? t.number : idx + 1),
        capacity: t.capacity || 4,
        section: t.section || null,
        status: isOccupied ? 'occupied' : 'available',
        needsWaiter: hasHelpCall,
        pendingOrder: Boolean(hasOrderCall || isSessionAwaiting || isOrderPending),
        needsBill: hasBillCall,
        qrToken: t.qrToken || null,
        qrUrl: t.qrUrl || null,
        session: isOccupied
          ? {
              id: session?.id || activeOrder?.id,
              dbSessionId: session?.id || null,
              openedAt,
              openedAtIso,
              pin: localPins[t.id] || session?.pin || null,
              ordersCount,
              failedAttempts: session?.failedAttempts || 0,
              isPinLocked: Boolean(session?.isLocked),
              pinLockoutUntil: session?.lockoutUntil || null,
              attemptsPerTier: session?.attemptsPerTier || 5,
              membersCount: session?.members?.length || 0,
              itemsCount: items.reduce((s, i) => s + i.qty, 0),
              total: computedTotal,
              alerts,
              activeOrder,
              activeOrders,
              orderGroups,
              items,
              reviewItems,
              pendingOrderNumber,
              waiterCalls: session?.waiterCalls || [],
            }
          : null,
      };
    });
  }, [rawTables, tableOrdersMap, tableSessionMap, rawOrders, localPins]);

  const settleTable = useCallback(async ({ table, paymentMethod = 'CASH' }) => {
    const session = table?.session;
    const tid = table?.id || table?.tableId || table?._id;

    // A table may hold several active orders — settle them all in one action.
    if (session?.dbSessionId) {
      await closeSessionMutation.mutateAsync({
        sessionId: session.dbSessionId,
        payload: { settlePayment: true, paymentMethod },
      });
      return;
    }

    if (tid) {
      const { releaseTableApi } = await import('../../../lib/api/table-sessions.api.js');
      await releaseTableApi(tid, { paymentMethod });
    }
  }, [closeSessionMutation]);

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchTables(), refetchOrders(), refetchSessions()]);
  }, [refetchTables, refetchOrders, refetchSessions]);

  useEffect(() => {
    // Always keep a periodic reconciliation running: fast while offline, and a
    // slower safety-net cadence while connected so a dropped/missed realtime
    // event can never leave waiter and cashier showing different table states.
    const id = setInterval(() => {
      refetchTables();
      refetchOrders();
      refetchSessions();
    }, isConnected ? 20000 : 4000);
    return () => clearInterval(id);
  }, [isConnected, refetchTables, refetchOrders, refetchSessions]);

  const recordLocalPin = useCallback((tableId, pin) => {
    setLocalPins((prev) => ({ ...prev, [tableId]: pin }));
  }, []);

  return {
    tables,
    rawTables,
    rawOrders,
    branchSessions,
    tableSessionMap,
    tableOrdersMap,
    isLoading: isTablesLoading || isOrdersLoading || isSessionsLoading,
    refetchAll,
    recordLocalPin,
    settleTable,
    startSessionMutation,
    closeSessionMutation,
    confirmSessionMutation,
    dismissCallMutation,
    updateTableMutation,
    paymentMutation,
    updateOrderStatusMutation,
  };
};
