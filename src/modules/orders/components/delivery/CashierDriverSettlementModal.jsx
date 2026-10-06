import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import {
  useBranchDriversQuery,
  useSettleDriverMutation,
  usePendingHandoversQuery,
  useApprovePickupMutation,
  useRejectPickupMutation,
  useDeliveryOrdersQuery,
  useAssignDriverMutation,
  useCancelAssignmentMutation,
  useConfirmReturnMutation,
} from '../../hooks/useDelivery.js';
import { toast } from '../../../../shared/context/ToastContext.jsx';
import {
  Coins,
  CheckCircle2,
  Bike,
  User,
  RotateCcw,
  Package,
  XCircle,
  Clock,
  MapPin,
  ChevronRight,
  Send,
  UserCheck,
  Undo2,
} from 'lucide-react';

export const CashierDriverSettlementModal = ({
  isOpen,
  onClose,
  branchId,
  onOpenHandoverModal,
}) => {
  const { currency } = useCurrency();
  const { data: driversResponse, isLoading: isDriversLoading, refetch: refetchDrivers } = useBranchDriversQuery(branchId);
  const { data: handoversResponse, isLoading: isHandoversLoading, refetch: refetchHandovers } = usePendingHandoversQuery(branchId);
  const { data: deliveryOrdersResponse, isLoading: isDeliveryOrdersLoading, refetch: refetchDeliveryOrders } = useDeliveryOrdersQuery(branchId);

  const settleMutation = useSettleDriverMutation();
  const approveMutation = useApprovePickupMutation();
  const rejectMutation = useRejectPickupMutation();
  const assignDriverMutation = useAssignDriverMutation();
  const cancelAssignmentMutation = useCancelAssignmentMutation();
  const confirmReturnMutation = useConfirmReturnMutation();

  const [activeTab, setActiveTab] = useState('handovers'); // 'handovers' | 'assign' | 'settlement'
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNotes, setSettleNotes] = useState('');
  const [showAllDrivers, setShowAllDrivers] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [selectedDriverForOrder, setSelectedDriverForOrder] = useState({});

  const rawDrivers = driversResponse?.data || driversResponse || [];
  const driversList = Array.isArray(rawDrivers) ? rawDrivers : [];

  const rawHandovers = handoversResponse?.data || handoversResponse || [];
  const pendingHandovers = Array.isArray(rawHandovers) ? rawHandovers : [];

  const rawDeliveryOrders = deliveryOrdersResponse?.data || deliveryOrdersResponse || [];
  const allDeliveryOrders = Array.isArray(rawDeliveryOrders) ? rawDeliveryOrders : (rawDeliveryOrders.items || []);

  // Filter orders in restaurant available for cashier assignment
  const unassignedDeliveryOrders = allDeliveryOrders.filter(
    (o) =>
      (o.status === 'READY' || o.status === 'CONFIRMED' || o.status === 'PREPARING') &&
      o.status !== 'OUT_FOR_DELIVERY' &&
      o.status !== 'DELIVERED' &&
      o.status !== 'CANCELLED' &&
      o.deliveryStatus !== 'PENDING_HANDOVER'
  );

  // Filter drivers with active custody (due for settlement or currently in transit)
  const driversWithDueCash = driversList.filter(
    (d) =>
      Number(d.wallet?.remainingToSettle || 0) > 0 ||
      Number(d.wallet?.inTransitAmount || 0) > 0
  );

  const displayedDrivers = showAllDrivers ? driversList : driversWithDueCash;

  // Auto-switch tab if handovers exist or don't exist
  useEffect(() => {
    if (isOpen) {
      if (pendingHandovers.length > 0) {
        setActiveTab('handovers');
      } else {
        setActiveTab('settlement');
      }
    }
  }, [isOpen, pendingHandovers.length]);

  if (!isOpen) return null;

  const handleOpenSettleForm = (driver) => {
    setSelectedDriver(driver);
    setSettleAmount(String(driver.wallet?.remainingToSettle || 0));
    setSettleNotes('');
  };

  const handleConfirmSettle = async (e) => {
    e.preventDefault();
    if (!selectedDriver) return;
    const amountNum = Number(settleAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('يرجى كتابة مبلغ صحيح');
      return;
    }

    try {
      await settleMutation.mutateAsync({
        branchId,
        payload: {
          driverEmployeeId: selectedDriver.id,
          amount: amountNum,
          notes: settleNotes || `استلام نقدية عهدة الطيار ${selectedDriver.name}`,
        },
      });
      toast.success(`تم استلام وتصفية ${amountNum.toFixed(2)} ${currency} من الطيار بنجاح 💵`);
      setSelectedDriver(null);
      refetchDrivers();
    } catch (err) {
      toast.error(err?.message || 'تعذر تصفية العهدة');
    }
  };

  const handleConfirmReturn = async (order) => {
    setProcessingOrderId(order.id);
    try {
      await confirmReturnMutation.mutateAsync({
        branchId,
        orderId: order.id,
      });
      toast.success(`تم تأكيد استلام مرتجع طلب #${order.orderNumber} في المطعم بنجاح ✅`);
      refetchHandovers();
    } catch (err) {
      toast.error(err?.message || 'تعذر تأكيد استلام المرتجع');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleApproveHandover = async (order) => {
    setProcessingOrderId(order.id);
    try {
      await approveMutation.mutateAsync({
        branchId,
        orderId: order.id,
      });
      toast.success(`تمت الموافقة وتسليم طلب #${order.orderNumber} للطيار ${order.driver?.name || 'المندوب'} بنجاح`);
      refetchHandovers();
    } catch (err) {
      toast.error(err?.message || 'تعذر تأكيد التسليم');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectHandover = async (order) => {
    setProcessingOrderId(order.id);
    try {
      await rejectMutation.mutateAsync({
        branchId,
        orderId: order.id,
        payload: { reason: 'تم رفض التسليم من قبل الكاشير' },
      });
      toast.warning(`تم رفض تسليم طلب #${order.orderNumber} للطيار`);
      refetchHandovers();
    } catch (err) {
      toast.error(err?.message || 'تعذر رفض التسليم');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleAssignOrder = async (order, driverId) => {
    if (!driverId) {
      toast.error('يرجى اختيار مندوب التوصيل أولاً');
      return;
    }
    setProcessingOrderId(order.id);
    try {
      await assignDriverMutation.mutateAsync({
        branchId,
        orderId: order.id,
        driverEmployeeId: driverId,
      });
      const targetDriver = driversList.find((d) => d.id === driverId);
      toast.success(`تم إرسال طلب استلام أوردر #${order.orderNumber} للطيار ${targetDriver?.name || 'المندوب'}`);
      refetchDeliveryOrders();
    } catch (err) {
      toast.error(err?.message || 'تعذر إسناد الأوردر');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleCancelAssignment = async (order) => {
    setProcessingOrderId(order.id);
    try {
      await cancelAssignmentMutation.mutateAsync({
        branchId,
        orderId: order.id,
      });
      toast.info(`تم إلغاء إسناد أوردر #${order.orderNumber}`);
      refetchDeliveryOrders();
    } catch (err) {
      toast.error(err?.message || 'تعذر سحب الأوردر');
    } finally {
      setProcessingOrderId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إدارة طلبات وعهد الطيارين"
      size="lg"
    >
      <div className="space-y-4 text-xs select-text" dir="rtl">
        {/* ── Top Tabs Segmented Control (Responsive & Clear) ── */}
        {!selectedDriver && (
          <div className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('handovers')}
              className={`flex-1 h-9 px-3 rounded-xl text-xs font-bold transition-colors duration-100 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'handovers'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs border border-zinc-200/60 dark:border-zinc-700/60'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent'
              }`}
            >
              <Package size={14} className="shrink-0 text-amber-500" />
              <span>استلام الطلبات</span>
              {pendingHandovers.length > 0 && (
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                  {pendingHandovers.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assign')}
              className={`flex-1 h-9 px-3 rounded-xl text-xs font-bold transition-colors duration-100 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'assign'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs border border-zinc-200/60 dark:border-zinc-700/60'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent'
              }`}
            >
              <Bike size={14} className="shrink-0 text-sky-500" />
              <span>إسناد للطيار</span>
              {unassignedDeliveryOrders.length > 0 && (
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold">
                  {unassignedDeliveryOrders.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settlement')}
              className={`flex-1 h-9 px-3 rounded-xl text-xs font-bold transition-colors duration-100 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'settlement'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs border border-zinc-200/60 dark:border-zinc-700/60'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent'
              }`}
            >
              <Coins size={14} className="shrink-0 text-emerald-500" />
              <span>تصفية العهد</span>
              {driversWithDueCash.length > 0 && (
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                  {driversWithDueCash.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* ── Stable Content Container (Prevents Height Jump/Jitter) ── */}
        <div className="min-h-[260px] flex flex-col justify-start">

        {/* ── Tab 1: Pending Pickup Handovers & Returns ── */}
        {activeTab === 'handovers' && !selectedDriver && (
          <div className="space-y-3">
            {isHandoversLoading ? (
              <div className="py-10 flex flex-col items-center justify-center gap-2 text-zinc-400">
                <RotateCcw size={22} className="animate-spin text-zinc-500" />
                <span>جاري تحميل طلبات الاستلام...</span>
              </div>
            ) : pendingHandovers.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 dark:text-zinc-400 space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 flex items-center justify-center mx-auto border border-zinc-200 dark:border-zinc-800">
                  <Bike size={22} />
                </div>
                <div>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                    لا توجد طلبات استلام معلقة حالياً
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-xs mx-auto">
                    عندما يطلب أي طيار استلام أوردر للخروج أو تسليم مرتجع للمطعم، سيصلك إشعار فوري ويمكنك مراجعته هنا.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    طلبات الاستلام والمرتجعات بانتظار تأكيدك:
                  </span>
                  {onOpenHandoverModal && (
                    <button
                      type="button"
                      onClick={() => onOpenHandoverModal()}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 transition-all cursor-pointer"
                    >
                      عرض في نافذة مخصصة
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-2.5">
                  {pendingHandovers.map((order) => {
                    const isProcessing = processingOrderId === order.id;
                    const rawDriver = order.driver?.name || 'مندوب التوصيل';
                    const cleanDriver = rawDriver.replace(/\s*\(.*?\)\s*/g, ' ').trim() || rawDriver;
                    const isReturn =
                      order.deliveryStatus === 'FAILED_DELIVERY' ||
                      order.deliveryStatus === 'RETURNED_TO_CASHIER' ||
                      order.status === 'CANCELLED';

                    if (isReturn) {
                      return (
                        <div
                          key={order.id}
                          className="p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 space-y-3 transition-all shadow-2xs group"
                        >
                          {/* Clickable Header & Info */}
                          <div
                            className="cursor-pointer space-y-2.5"
                            onClick={() => onOpenHandoverModal?.(order.id)}
                            title="اضغط لعرض تفاصيل الطلب وتأكيد الاستلام"
                          >
                            {/* Header: Order Number, Return Tag, Total & Time */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                  طلب #{order.orderNumber}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                  مرتجع تعذر التسليم ⚠️
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                                  {Number(order.total).toFixed(2)} {currency}
                                </span>
                                {order.updatedAt && (
                                  <span className="text-[10px] text-zinc-400 font-mono">
                                    • {new Date(order.updatedAt).toLocaleTimeString('ar-EG', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Reason Alert */}
                            {(order.cancelReason || order.driverNotes) && (
                              <div className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300">
                                <span className="font-bold">سبب التعذر: </span>
                                <span>{order.cancelReason || order.driverNotes}</span>
                              </div>
                            )}

                            {/* Driver and Customer Info */}
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-rose-500/20">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Bike size={14} className="text-rose-500 shrink-0" />
                                <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                  المندوب: {cleanDriver}
                                </span>
                              </div>
                              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[170px]">
                                {order.customer?.name ? `العميل: ${order.customer.name}` : order.address || ''}
                              </span>
                            </div>

                            {/* Items Preview */}
                            {order.items && order.items.length > 0 && (
                              <div className="pt-1.5 flex flex-wrap gap-1">
                                {order.items.map((it) => (
                                  <span
                                    key={it.id}
                                    className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300 font-medium"
                                  >
                                    <strong className="font-mono text-rose-600 dark:text-rose-400">{it.quantity}×</strong> {it.productName}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="flex items-center justify-end gap-2 pt-0.5">
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConfirmReturn(order);
                              }}
                              className="h-8 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5 border border-emerald-500/20"
                            >
                              <CheckCircle2 size={14} />
                              <span>تأكيد استلام المرتجع في المطعم</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={order.id}
                        className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-750 space-y-3 transition-all shadow-2xs group"
                      >
                        {/* Clickable Header & Info to open full Handover Details Modal */}
                        <div
                          className="cursor-pointer space-y-2.5"
                          onClick={() => onOpenHandoverModal?.(order.id)}
                          title="اضغط لعرض تفاصيل الطلب وتسليمه"
                        >
                          {/* Header: Order Number, Tag, Total & Time */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                طلب #{order.orderNumber}
                              </span>
                              {order.isCod ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
                                  كاش تحصيل
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  مدفوع مسبقاً
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                                {Number(order.total).toFixed(2)} {currency}
                              </span>
                              {order.driverRequestedAt && (
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  • {new Date(order.driverRequestedAt).toLocaleTimeString('ar-EG', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Driver and Customer Info */}
                          <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Bike size={14} className="text-zinc-400 group-hover:text-amber-500 shrink-0 transition-colors" />
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                الطيار: {cleanDriver}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[170px]">
                              {order.customer?.name ? `العميل: ${order.customer.name}` : order.address || ''}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-0.5">
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectHandover(order);
                            }}
                            className="h-8 px-3.5 rounded-xl font-bold text-xs text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 transition-all cursor-pointer disabled:opacity-50"
                          >
                            رفض
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveHandover(order);
                            }}
                            className="h-8 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5 border border-emerald-500/20"
                          >
                            <CheckCircle2 size={14} />
                            <span>موافقة وتسليم الأوردر</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab 2: Assign Ready Orders to Drivers ── */}
        {activeTab === 'assign' && !selectedDriver && (
          <div className="space-y-3">
            {isDeliveryOrdersLoading ? (
              <div className="py-10 flex flex-col items-center justify-center gap-2 text-zinc-400">
                <RotateCcw size={22} className="animate-spin text-zinc-500" />
                <span>جاري تحميل أوردرات الدليفري...</span>
              </div>
            ) : unassignedDeliveryOrders.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 dark:text-zinc-400 space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 flex items-center justify-center mx-auto border border-zinc-200 dark:border-zinc-800">
                  <Send size={22} />
                </div>
                <div>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                    لا توجد أوردرات دليفري جاهزة للإسناد حالياً
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-xs mx-auto">
                    عندما يتم إنشاء أوردرات دليفري جديدة في الفرع ستظهر هنا لتتمكن من إسنادها وإرسالها للطيارين.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium px-0.5">
                  اختر مندوب التوصيل لإرسال طلب استلام الأوردر إليه:
                </p>

                <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-2.5">
                  {unassignedDeliveryOrders.map((order) => {
                    const isPendingAcceptance = order.deliveryStatus === 'PENDING_DRIVER_ACCEPTANCE';
                    const assignedDriverName = order.driver?.name || driversList.find((d) => d.id === order.driverEmployeeId)?.name || 'المندوب';
                    const isProcessing = processingOrderId === order.id;
                    const selectedDriverId = selectedDriverForOrder[order.id] || driversList[0]?.id || '';

                    return (
                      <div
                        key={order.id}
                        className={`p-3.5 rounded-2xl border transition-all shadow-2xs space-y-3 ${
                          isPendingAcceptance
                            ? 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60'
                        }`}
                      >
                        {/* Header: Order Number, COD, Total */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                              طلب #{order.orderNumber}
                            </span>
                            {order.isCod ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
                                كاش تحصيل
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                مدفوع مسبقاً
                              </span>
                            )}
                          </div>

                          <div className="font-mono font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                            {Number(order.total).toFixed(2)} {currency}
                          </div>
                        </div>

                        {/* Address */}
                        <div className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                          <MapPin size={13} className="shrink-0 mt-0.5 text-zinc-400" />
                          <span className="truncate">{order.address || 'العنوان غير محدد'}</span>
                        </div>

                        {/* Assignment Controls */}
                        <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-2">
                          {isPendingAcceptance ? (
                            <>
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                <Clock size={14} className="animate-spin shrink-0" />
                                <span>بانتظار قبول: {assignedDriverName.replace(/\s*\(.*?\)\s*/g, ' ').trim()}</span>
                              </div>
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handleCancelAssignment(order)}
                                className="h-9 px-3.5 rounded-xl font-bold text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-700 cursor-pointer disabled:opacity-50"
                              >
                                سحب الطلب
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 w-full">
                              <div className="flex-1 min-w-0">
                                <select
                                  value={selectedDriverId}
                                  onChange={(e) =>
                                    setSelectedDriverForOrder((prev) => ({
                                      ...prev,
                                      [order.id]: e.target.value,
                                    }))
                                  }
                                  disabled={driversList.length === 0 || isProcessing}
                                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
                                >
                                  {driversList.length === 0 ? (
                                    <option value="">لا يوجد طيارين مسجلين</option>
                                  ) : (
                                    driversList.map((d) => {
                                      const cleanName = d.name.replace(/\s*\(.*?\)\s*/g, ' ').trim();
                                      return (
                                        <option key={d.id} value={d.id}>
                                          {cleanName} {d.phone ? `• ${d.phone}` : ''}
                                        </option>
                                      );
                                    })
                                  )}
                                </select>
                              </div>

                              <button
                                type="button"
                                disabled={driversList.length === 0 || isProcessing}
                                onClick={() => handleAssignOrder(order, selectedDriverId)}
                                className="h-9 px-4 rounded-xl font-bold text-xs text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white active:scale-98 transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0 flex items-center justify-center gap-1.5"
                              >
                                <Send size={13} />
                                <span>إرسال للطيار</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab 3: Driver COD Cash Settlements ── */}
        {(activeTab === 'settlement' || selectedDriver) && (
          <div>
            {isDriversLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-400">
                <RotateCcw size={24} className="animate-spin text-zinc-500" />
                <span>جاري تحميل بيانات الطيارين والعهدة...</span>
              </div>
            ) : selectedDriver ? (
              /* ── Settlement Form ── */
              <form onSubmit={handleConfirmSettle} className="space-y-4">
                <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      الطيار: {selectedDriver.name?.replace(/\s*\(.*?\)\s*/g, ' ').trim() || selectedDriver.name}
                    </span>
                    <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {selectedDriver.phone || selectedDriver.email}
                    </p>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-zinc-400 block">العهدة الحالية:</span>
                    <p className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400">
                      {Number(selectedDriver.wallet?.remainingToSettle || 0).toFixed(2)} {currency}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                    المبلغ المستلم توريده إلى درج الكاشير:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="driver_settle_cash_field"
                    id="driver_settle_cash_field"
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-base text-center focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">ملاحظات التوريد:</label>
                  <input
                    type="text"
                    name="driver_settle_notes_field"
                    autoComplete="new-password"
                    value={settleNotes}
                    onChange={(e) => setSettleNotes(e.target.value)}
                    placeholder="مثال: تسليم كامل عهدة وردية المساء"
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDriver(null)}
                    className="px-4 py-2 rounded-xl font-bold text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    رجوع
                  </button>
                  <button
                    type="submit"
                    disabled={settleMutation.isPending}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={15} />
                    <span>{settleMutation.isPending ? 'جاري التسجيل...' : 'تأكيد استلام النقدية'}</span>
                  </button>
                </div>
              </form>
            ) : displayedDrivers.length === 0 ? (
              /* ── Empty State When No Drivers Have Due COD Cash ── */
              <div className="py-8 text-center text-zinc-500 dark:text-zinc-400 space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 flex items-center justify-center mx-auto border border-zinc-200 dark:border-zinc-800">
                  <CheckCircle2 size={22} className="text-emerald-500" />
                </div>
                <div>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                    لا توجد عهد نقدية مستحقة التوريد حالياً
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-xs mx-auto">
                    جميع مناديب التوصيل لا يحملون طلبات كاش معلقة أو تم تصفية عهدتهم بالكامل.
                  </p>
                </div>
                {driversList.length > 0 && !showAllDrivers && (
                  <button
                    type="button"
                    onClick={() => setShowAllDrivers(true)}
                    className="px-3 py-1 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 transition-all pt-1 cursor-pointer"
                  >
                    عرض جميع الطيارين المسجلين
                  </button>
                )}
              </div>
            ) : (
              /* ── Drivers List (With Due Cash) ── */
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-0.5">
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    مندوبو التوصيل والعهد النقدية:
                  </p>
                  {driversList.length > driversWithDueCash.length && (
                    <button
                      type="button"
                      onClick={() => setShowAllDrivers(!showAllDrivers)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
                    >
                      {showAllDrivers ? 'إظهار المستحق فقط' : 'عرض الكل'}
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-2">
                  {displayedDrivers.map((d) => {
                    const remaining = Number(d.wallet?.remainingToSettle || 0);
                    const inTransit = Number(d.wallet?.inTransitAmount || 0);
                    const totalCustody = d.wallet?.totalCustody !== undefined ? Number(d.wallet.totalCustody) : (remaining + inTransit);
                    const cleanName = (d.name || '').replace(/\s*\(.*?\)\s*/g, ' ').trim() || d.name;
                    const hasActiveCash = remaining > 0 || inTransit > 0;

                    return (
                      <div
                        key={d.id}
                        className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 flex items-center justify-between gap-3 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold shrink-0 ${
                              hasActiveCash
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                                : 'bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-400'
                            }`}
                          >
                            <Bike size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                              {cleanName}
                            </p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono" dir="ltr">
                              {d.phone || d.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-left">
                            <span className="text-[10px] text-zinc-400 block">
                              {remaining > 0 ? 'مستحق التوريد:' : inTransit > 0 ? 'بالشارع (توصيل):' : 'العهدة:'}
                            </span>
                            <p
                              className={`font-mono font-bold text-xs sm:text-sm ${
                                remaining > 0
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : inTransit > 0
                                  ? 'text-sky-600 dark:text-sky-400'
                                  : 'text-zinc-400'
                              }`}
                            >
                              {(remaining > 0 ? remaining : inTransit).toFixed(2)}{' '}
                              <span className="text-[10px] font-normal">{currency}</span>
                            </p>
                            {remaining > 0 && inTransit > 0 && (
                              <span className="text-[9.5px] text-sky-600 dark:text-sky-400 font-mono block">
                                +{inTransit.toFixed(2)} بالشارع
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenSettleForm(d)}
                            disabled={remaining <= 0}
                            title={remaining <= 0 && inTransit > 0 ? 'الطلبات لا تزال قيد التوصيل مع العميل بالشارع' : ''}
                            className={`h-8 px-3.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center ${
                              remaining > 0
                                ? 'text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 cursor-pointer border border-emerald-500/20'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-750 cursor-not-allowed opacity-50'
                            }`}
                          >
                            استلام العهدة
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </Modal>
  );
};

export default CashierDriverSettlementModal;
