import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTableGridState } from '../../tables/hooks/useTableGridState.js';
import { useProductsQuery, useCategoriesQuery } from '../../menu/hooks/useMenu.js';
import { useCreatePosOrderMutation } from './useOrders.js';
import { printTablePinReceipt, printTableBillReceipt } from '../../tables/utils/tableThermalPrinting.js';
import {
  useRejectPendingOrder,
  useUpdateSessionItemStaff,
  useRemoveSessionItemStaff,
  useAddSessionItemsStaff,
} from '../../tables/hooks/useTableSessions.js';
import { toast } from '../../../shared/context/ToastContext.jsx';

export const useWaiterPage = ({ activeBranchId, activeBranch, user }) => {
  const {
    tables,
    rawOrders,
    tableOrderMap,
    refetchAll,
    recordLocalPin,
    startSessionMutation,
    closeSessionMutation,
    confirmSessionMutation,
    dismissCallMutation,
    updateTableMutation,
    paymentMutation,
  } = useTableGridState(activeBranchId);

  const { data: productsResponse } = useProductsQuery({ page: 1, limit: 100 });
  const { data: categoriesResponse } = useCategoriesQuery({ page: 1, limit: 100 });
  const createPosOrderMutation = useCreatePosOrderMutation();

  const rejectOrderMutation = useRejectPendingOrder();
  const updateItemStaffMutation = useUpdateSessionItemStaff();
  const removeItemStaffMutation = useRemoveSessionItemStaff();
  const addItemStaffMutation = useAddSessionItemsStaff();

  const products = useMemo(() => productsResponse?.items || [], [productsResponse]);
  const categories = useMemo(() => categoriesResponse?.items || [], [categoriesResponse]);

  const [selectedTableId, setSelectedTableId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');

  const [reviewTable, setReviewTable] = useState(null);
  const [addItemTable, setAddItemTable] = useState(null);
  const [billTable, setBillTable] = useState(null);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isClosingSession, setIsClosingSession] = useState(false);

  // Sync open review modal data when tables query refetches
  useEffect(() => {
    if (reviewTable?.id) {
      const updated = tables.find((t) => t.id === reviewTable.id);
      if (updated) {
        setReviewTable(updated);
      }
    }
  }, [tables, reviewTable?.id]);

  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedTableId) || null,
    [tables, selectedTableId]
  );

  const totalOccupied = useMemo(
    () => tables.filter((t) => t.status === 'occupied').length,
    [tables]
  );
  const totalAlerts = useMemo(
    () => tables.filter((t) => t.session?.alerts?.length > 0).length,
    [tables]
  );

  const handlePrintPin = useCallback((table, pin) => {
    printTablePinReceipt({
      branchName: activeBranch?.name || 'مطعمنا',
      displayNum: table.displayNum,
      pin,
      waiterName: user?.name || 'طاقم الخدمة',
    });
  }, [activeBranch, user]);

  const handlePrintBill = useCallback((table) => {
    printTableBillReceipt({
      branchName: activeBranch?.name || 'مطعمنا',
      displayNum: table.displayNum,
      items: table.session?.items || [],
      total: table.session?.total || 0,
      currency: activeBranch?.settings?.currency || 'ج.م',
    });
  }, [activeBranch]);

  const handleOpenSession = async (tableId) => {
    setIsStartingSession(true);
    try {
      const res = await startSessionMutation.mutateAsync({
        branchId: activeBranchId,
        tableId,
        payload: {
          guestCount: 1,
          customerName: 'طاولة ' + (selectedTable?.displayNum || ''),
        },
      });

      const pin = res?.pin || res?.data?.pin;
      if (pin) {
        recordLocalPin(tableId, pin);
        handlePrintPin(selectedTable, pin);
      }
      await refetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'تعذر فتح الجلسة للطاولة');
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleDismissCall = async (sessionId, callType) => {
    try {
      await dismissCallMutation.mutateAsync({
        sessionId,
        payload: { callType },
      });
      await refetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'تعذر تأكيد الحضور');
    }
  };

  const handleConfirmReviewOrder = async (table) => {
    try {
      await confirmSessionMutation.mutateAsync({
        sessionId: table.session.dbSessionId,
      });
      setReviewTable(null);
      await refetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'تعذر تأكيد الطلب');
    }
  };

  const handleRejectReviewOrder = async (table) => {
    const isConfirmed = await toast.confirm(
      'هل أنت متأكد من رغبتك في إلغاء ورفض هذا الطلب بالكامل؟',
      'إلغاء الطلب',
      { type: 'danger', confirmText: 'نعم، إلغاء الطلب', cancelText: 'تراجع' }
    );
    if (!isConfirmed) return;
    try {
      await rejectOrderMutation.mutateAsync({
        sessionId: table.session.dbSessionId,
      });
      setReviewTable(null);
      await refetchAll();
      toast.success('تم رفض وإلغاء الطلب بنجاح');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'تعذر رفض الطلب');
    }
  };

  const handleUpdateReviewItemQty = async (item, newQty) => {
    const table = reviewTable;
    if (!table?.session?.dbSessionId) return;
    try {
      await updateItemStaffMutation.mutateAsync({
        sessionId: table.session.dbSessionId,
        itemId: item.itemId || item.id,
        quantity: newQty,
      });
      await refetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'تعذر تعديل الكمية');
    }
  };

  const handleRemoveReviewItem = async (item) => {
    const table = reviewTable;
    if (!table?.session?.dbSessionId) return;
    const isConfirmed = await toast.confirm(
      `هل أنت متأكد من حذف «${item.name}» من الطلب؟`,
      'حذف الصنف',
      { type: 'danger', confirmText: 'حذف الصنف', cancelText: 'إلغاء' }
    );
    if (!isConfirmed) return;
    try {
      await removeItemStaffMutation.mutateAsync({
        sessionId: table.session.dbSessionId,
        itemId: item.itemId || item.id,
      });
      await refetchAll();
      toast.success(`تم حذف «${item.name}» من الطلب`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'تعذر حذف الصنف');
    }
  };

  const handleAddReviewItem = async (product, qty = 1) => {
    const table = reviewTable;
    if (!table?.session?.dbSessionId) return;
    try {
      await addItemStaffMutation.mutateAsync({
        sessionId: table.session.dbSessionId,
        items: [{ productId: product.id, quantity: qty }],
      });
      await refetchAll();
      toast.success(`تمت إضافة ${product.name} للطلب`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'تعذر إضافة الصنف للطلب');
    }
  };

  const handleAddItemsToSession = async (table, items) => {
    try {
      if (table.session?.dbSessionId) {
        await addItemStaffMutation.mutateAsync({
          sessionId: table.session.dbSessionId,
          items: items.map((it) => ({
            productId: it.productId,
            quantity: it.qty,
          })),
        });
      } else {
        await createPosOrderMutation.mutateAsync({
          branchId: activeBranchId,
          payload: {
            type: 'DINE_IN',
            tableId: table.id,
            items: items.map((it) => ({
              productId: it.productId,
              quantity: it.qty,
            })),
          },
        });
      }
      setAddItemTable(null);
      await refetchAll();
      toast.success('تمت إضافة الأصناف بنجاح');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'تعذر إضافة الأصناف للجلسة');
    }
  };

  const handleSettleAndClose = async (table, paymentMethod = 'CASH') => {
    if (!table) return;
    setIsClosingSession(true);
    const session = table?.session;
    const tid = table?.id || table?.tableId || table?._id;
    const orderId = session?.activeOrder?.id || (tid ? tableOrderMap.get(tid)?.id : null);
    const total = session?.total || 0;

    try {
      if (orderId) {
        const matchedOrder = rawOrders.find((o) => o.id === orderId);
        const amountToPay = matchedOrder ? Number(matchedOrder.total) : total;

        if (matchedOrder?.paymentStatus !== 'PAID') {
          try {
            await paymentMutation.mutateAsync({
              branchId: activeBranchId,
              orderId,
              payload: {
                amount: amountToPay > 0 ? amountToPay : total,
                paymentMethod: paymentMethod || 'CASH',
              },
            });
          } catch (payErr) {
            console.warn('Payment warning during close:', payErr);
          }
        }
      }

      if (session?.dbSessionId) {
        await closeSessionMutation.mutateAsync({
          sessionId: session.dbSessionId,
          payload: { settlePayment: true, paymentMethod },
        });
      }

      if (tid) {
        try {
          await updateTableMutation.mutateAsync({
            branchId: activeBranchId,
            id: tid,
            tableId: tid,
            payload: { status: 'AVAILABLE' },
          });
        } catch (_tableErr) {
          // backend closeSession may have already updated table status
        }
      }

      setBillTable(null);
      setSelectedTableId(null);
      await refetchAll();
      toast.success('تم تأكيد السداد وإغلاق الطاولة بنجاح');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'تعذر تسوية الحساب وإغلاق الجلسة');
    } finally {
      setIsClosingSession(false);
    }
  };

  return {
    tables,
    selectedTable,
    selectedTableId,
    setSelectedTableId,
    statusFilter,
    setStatusFilter,
    selectedSection,
    setSelectedSection,
    totalOccupied,
    totalAlerts,
    reviewTable,
    setReviewTable,
    addItemTable,
    setAddItemTable,
    billTable,
    setBillTable,
    products,
    categories,
    isStartingSession,
    isClosingSession,
    refetchAll,
    confirmSessionMutation,
    createPosOrderMutation,
    handlePrintPin,
    handlePrintBill,
    handleOpenSession,
    handleDismissCall,
    handleConfirmReviewOrder,
    handleRejectReviewOrder,
    handleUpdateReviewItemQty,
    handleRemoveReviewItem,
    handleAddReviewItem,
    handleAddItemsToSession,
    handleSettleAndClose,
    rejectOrderMutation,
    updateItemStaffMutation,
    removeItemStaffMutation,
    addItemStaffMutation,
  };
};
