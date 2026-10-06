import React, { useState, useMemo, useCallback } from 'react';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import {
  useDeliveryOrdersQuery,
  useDriverWalletQuery,
  useRequestPickupMutation,
  useCancelPickupMutation,
  useDeliverOrderMutation,
  useFailDeliveryMutation,
  useHandoverReturnMutation,
  useAcceptAssignmentMutation,
  useRejectAssignmentMutation,
} from '../hooks/useDelivery.js';
import { toast } from '../../../shared/context/ToastContext.jsx';
import { DeliveryNavHeader } from '../components/delivery/DeliveryNavHeader.jsx';
import { DeliveryOrderCard } from '../components/delivery/DeliveryOrderCard.jsx';
import { DriverWalletModal } from '../components/delivery/DriverWalletModal.jsx';
import { DeliveryFailModal } from '../components/delivery/DeliveryFailModal.jsx';
import { Bike, RotateCcw, AlertTriangle, CheckCircle2, Package, Sparkles } from 'lucide-react';

const PILL_BASE =
  'py-1.5 px-4 rounded-full text-xs whitespace-nowrap flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 border';

const pillClass = (isActive) => {
  if (isActive) {
    return 'bg-zinc-900 dark:bg-zinc-800 text-white font-bold border-zinc-900 dark:border-zinc-700 shadow-sm';
  }
  return 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-900 font-medium';
};

export const DeliveryPage = () => {
  const { activeBranchId, activeBranch, isLoading: isBranchLoading } = useBranch();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('RESTAURANT'); // RESTAURANT | WITH_DRIVER | DELIVERED
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [failOrderTarget, setFailOrderTarget] = useState(null);
  const [processingOrderId, setProcessingOrderId] = useState(null);

  // Queries
  const {
    data: ordersResponse,
    isLoading: isOrdersLoading,
    isFetching,
    isError,
    refetch,
  } = useDeliveryOrdersQuery(activeBranchId);

  const { data: walletResponse } = useDriverWalletQuery(activeBranchId, user?.id);
  const walletData = walletResponse?.data || walletResponse;

  // Mutations
  const requestPickupMutation = useRequestPickupMutation();
  const cancelPickupMutation = useCancelPickupMutation();
  const deliverMutation = useDeliverOrderMutation();
  const failMutation = useFailDeliveryMutation();
  const handoverReturnMutation = useHandoverReturnMutation();
  const acceptAssignmentMutation = useAcceptAssignmentMutation();
  const rejectAssignmentMutation = useRejectAssignmentMutation();

  const allOrders = useMemo(() => {
    if (!ordersResponse) return [];
    if (Array.isArray(ordersResponse)) return ordersResponse;
    if (Array.isArray(ordersResponse?.data)) return ordersResponse.data;
    if (Array.isArray(ordersResponse?.items)) return ordersResponse.items;
    return [];
  }, [ordersResponse]);

  // 1. Orders in Restaurant (Ready, Preparing, or Assigned for pickup)
  const restaurantOrders = useMemo(
    () =>
      allOrders.filter(
        (o) =>
          (o.status === 'READY' || o.status === 'CONFIRMED' || o.status === 'PREPARING') &&
          o.status !== 'OUT_FOR_DELIVERY' &&
          o.status !== 'DELIVERED' &&
          o.status !== 'CANCELLED'
      ),
    [allOrders]
  );

  // 2. Orders Out with the Driver (On the road)
  const withDriverOrders = useMemo(
    () => allOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY'),
    [allOrders]
  );

  // 3. Completed Delivered Orders
  const deliveredOrders = useMemo(
    () => allOrders.filter((o) => o.status === 'DELIVERED' || o.status === 'CANCELLED'),
    [allOrders]
  );

  // Enhanced live wallet data that reactively mirrors active in-transit COD orders
  const enhancedWalletData = useMemo(() => {
    const backendRemaining = Number(walletData?.remainingToSettle || 0);
    const backendInTransit = walletData?.inTransitAmount !== undefined ? Number(walletData.inTransitAmount) : null;

    // Filter COD orders currently out with the driver on screen
    const liveInTransitOrders = withDriverOrders.filter(
      (o) => o.paymentStatus === 'PENDING' || o.paymentMethod === 'CASH' || !o.paymentMethod
    );
    const liveInTransitCash = liveInTransitOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

    const inTransitAmount = backendInTransit !== null && backendInTransit > 0 ? backendInTransit : liveInTransitCash;
    const totalCustody = backendRemaining + inTransitAmount;

    return {
      ...walletData,
      remainingToSettle: backendRemaining,
      inTransitAmount,
      totalCustody,
      inTransitOrders: walletData?.inTransitOrders?.length ? walletData.inTransitOrders : liveInTransitOrders,
    };
  }, [walletData, withDriverOrders]);

  const displayedOrders = useMemo(() => {
    if (tab === 'RESTAURANT') return restaurantOrders;
    if (tab === 'WITH_DRIVER') return withDriverOrders;
    return deliveredOrders;
  }, [tab, restaurantOrders, withDriverOrders, deliveredOrders]);

  // Handlers
  const handlePickup = useCallback(
    async (order) => {
      setProcessingOrderId(order.id);
      try {
        await requestPickupMutation.mutateAsync({
          branchId: activeBranchId,
          orderId: order.id,
        });
        toast.success(`تم إرسال طلب استلام أوردر #${order.orderNumber}، بانتظار موافقة وتسليم الكاشير ⏳`);
      } catch (err) {
        toast.error(err?.message || 'تعذر طلب استلام الطلب');
      } finally {
        setProcessingOrderId(null);
      }
    },
    [activeBranchId, requestPickupMutation]
  );

  const handleCancelPickup = useCallback(
    async (order) => {
      setProcessingOrderId(order.id);
      try {
        await cancelPickupMutation.mutateAsync({
          branchId: activeBranchId,
          orderId: order.id,
        });
        toast.info(`تم إلغاء طلب استلام الأوردر #${order.orderNumber}`);
      } catch (err) {
        toast.error(err?.message || 'تعذر إلغاء الطلب');
      } finally {
        setProcessingOrderId(null);
      }
    },
    [activeBranchId, cancelPickupMutation]
  );

  const handleAcceptAssignment = useCallback(
    async (order) => {
      setProcessingOrderId(order.id);
      try {
        await acceptAssignmentMutation.mutateAsync({
          branchId: activeBranchId,
          orderId: order.id,
        });
        toast.success(`تم قبول واستلام أوردر #${order.orderNumber}، وهو الآن معك قيد التوصيل 🛵`);
        setTab('WITH_DRIVER');
      } catch (err) {
        toast.error(err?.message || 'تعذر قبول الأوردر');
      } finally {
        setProcessingOrderId(null);
      }
    },
    [activeBranchId, acceptAssignmentMutation]
  );

  const handleRejectAssignment = useCallback(
    async (order) => {
      setProcessingOrderId(order.id);
      try {
        await rejectAssignmentMutation.mutateAsync({
          branchId: activeBranchId,
          orderId: order.id,
          payload: { reason: 'رفض المندوب استلام الأوردر' },
        });
        toast.info(`تم رفض استلام أوردر #${order.orderNumber}`);
      } catch (err) {
        toast.error(err?.message || 'تعذر رفض الأوردر');
      } finally {
        setProcessingOrderId(null);
      }
    },
    [activeBranchId, rejectAssignmentMutation]
  );

  const handleDeliver = useCallback(
    async (order) => {
      setProcessingOrderId(order.id);
      try {
        const res = await deliverMutation.mutateAsync({
          branchId: activeBranchId,
          orderId: order.id,
          payload: { expectedVersion: order.version, paymentMethod: 'CASH' },
        });
        if (order.isCod || order.paymentStatus === 'PENDING') {
          toast.success(`تم تسليم طلب #${order.orderNumber} وإضافة ${order.total} ج.م لعهدتك النقدية 💵`);
        } else {
          toast.success(`تم تأكيد تسليم طلب #${order.orderNumber} للعميل بنجاح ✅`);
        }
      } catch (err) {
        toast.error(err?.message || 'تعذر تأكيد التسليم');
      } finally {
        setProcessingOrderId(null);
      }
    },
    [activeBranchId, deliverMutation]
  );

  const handleConfirmFail = useCallback(
    async (order, reason) => {
      setProcessingOrderId(order.id);
      try {
        await failMutation.mutateAsync({
          branchId: activeBranchId,
          orderId: order.id,
          payload: { expectedVersion: order.version, reason },
        });
        setFailOrderTarget(null);
        toast.warning(`تم تسجيل تعذر تسليم طلب #${order.orderNumber}`);
      } catch (err) {
        toast.error(err?.message || 'تعذر تسجيل الحالة');
      } finally {
        setProcessingOrderId(null);
      }
    },
    [activeBranchId, failMutation]
  );

  const handleHandoverReturn = useCallback(
    async (order) => {
      setProcessingOrderId(order.id);
      try {
        await handoverReturnMutation.mutateAsync({
          branchId: activeBranchId,
          orderId: order.id,
        });
        toast.success(`تم إرسال إشعار تسليم المرتجع #${order.orderNumber} للكاشير بالمطعم 📦`);
      } catch (err) {
        toast.error(err?.message || 'تعذر تسليم المرتجع');
      } finally {
        setProcessingOrderId(null);
      }
    },
    [activeBranchId, handoverReturnMutation]
  );

  return (
    <div className="h-screen w-full min-h-screen flex flex-col overflow-hidden bg-zinc-100 dark:bg-black text-zinc-900 dark:text-zinc-100" dir="rtl">
      {/* ── Top Header ── */}
      <DeliveryNavHeader
        user={user}
        activeBranch={activeBranch}
        walletData={enhancedWalletData}
        onRefresh={refetch}
        isFetching={isFetching}
        onOpenWallet={() => setIsWalletOpen(true)}
        onLogout={logout}
      />

      {/* ── 3-Tab Segmented Control (Mobile-Optimized) ── */}
      <div className="h-14 px-3 sm:px-6 flex items-center justify-between gap-2 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 max-w-full overflow-x-auto custom-scrollbar">
          {/* 1. In Restaurant */}
          <button
            type="button"
            onClick={() => setTab('RESTAURANT')}
            className={`h-9 px-3 sm:px-4 rounded-xl text-xs font-bold transition-colors duration-100 flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
              tab === 'RESTAURANT'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs border border-zinc-200/60 dark:border-zinc-700/60'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent'
            }`}
          >
            <Package size={14} className="shrink-0" />
            <span>في المطعم</span>
            <span
              className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                tab === 'RESTAURANT'
                  ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                  : 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {restaurantOrders.length}
            </span>
          </button>

          {/* 2. Out for delivery */}
          <button
            type="button"
            onClick={() => setTab('WITH_DRIVER')}
            className={`h-9 px-3 sm:px-4 rounded-xl text-xs font-bold transition-colors duration-100 flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
              tab === 'WITH_DRIVER'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs border border-zinc-200/60 dark:border-zinc-700/60'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent'
            }`}
          >
            <Bike size={14} className="shrink-0 text-amber-500" />
            <span>قيد التوصيل</span>
            <span
              className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                tab === 'WITH_DRIVER'
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {withDriverOrders.length}
            </span>
          </button>

          {/* 3. Delivered */}
          <button
            type="button"
            onClick={() => setTab('DELIVERED')}
            className={`h-9 px-3 sm:px-4 rounded-xl text-xs font-bold transition-colors duration-100 flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
              tab === 'DELIVERED'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs border border-zinc-200/60 dark:border-zinc-700/60'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent'
            }`}
          >
            <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
            <span>تم التوصيل</span>
            <span
              className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                tab === 'DELIVERED'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {deliveredOrders.length}
            </span>
          </button>
        </div>

        {/* Live Total Orders Icon Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono text-xs font-bold shadow-xs">
          <Package size={14} className="text-zinc-500 dark:text-zinc-400 shrink-0" />
          <span>{allOrders.length}</span>
        </div>
      </div>

      {/* ── Main Orders Canvas ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-5 bg-zinc-50/50 dark:bg-black">
        {isBranchLoading || (isOrdersLoading && !ordersResponse) ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <RotateCcw size={26} className="text-zinc-500 animate-spin" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">جاري تحميل طلبات التوصيل...</p>
          </div>
        ) : !activeBranchId ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-400">
              <Bike size={24} />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">يرجى تحديد فرع العمل</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
              اختر فرع المطعم النشط لعرض شاشة طلبات التوصيل.
            </p>
          </div>
        ) : isError ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-sm font-bold text-red-500">تعذر تحميل طلبات التوصيل</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
              حدث خطأ في الاتصال بالخادم، يرجى إعادة المحاولة.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 sm:p-12 space-y-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-400 shadow-xs">
              {tab === 'RESTAURANT' ? (
                <Package size={24} className="text-zinc-500 dark:text-zinc-400" />
              ) : tab === 'WITH_DRIVER' ? (
                <Bike size={24} className="text-amber-500" />
              ) : (
                <CheckCircle2 size={24} className="text-emerald-500" />
              )}
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {tab === 'RESTAURANT'
                ? 'لا توجد أوردرات جاهزة في المطعم حالياً'
                : tab === 'WITH_DRIVER'
                ? 'لا توجد أوردرات قيد التوصيل معك حالياً'
                : 'لا توجد طلبات مكتملة مسجلة اليوم'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
              {tab === 'RESTAURANT'
                ? 'عندما يجهز المطبخ طلبات دليفري جديدة ستظهر هنا لتطلب استلامها والخروج بها.'
                : tab === 'WITH_DRIVER'
                ? 'الطلبات التي وافق الكاشير على تسليمها لك ستظهر هنا لتأكيد تسليمها للعملاء.'
                : 'جميع الطلبات التي تقوم بتسليمها بنجاح اليوم ستُسجل هنا تلقائياً.'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={14} className={isFetching ? 'animate-spin' : ''} />
              <span>{isFetching ? 'جاري التحديث...' : 'تحديث القائمة'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4.5">
            {displayedOrders.map((order) => (
              <DeliveryOrderCard
                key={order.id}
                order={order}
                onPickup={handlePickup}
                onCancelPickup={handleCancelPickup}
                onDeliver={handleDeliver}
                onFail={(o) => setFailOrderTarget(o)}
                onHandoverReturn={handleHandoverReturn}
                onAcceptAssignment={handleAcceptAssignment}
                onRejectAssignment={handleRejectAssignment}
                isProcessing={processingOrderId === order.id}
                currentDriverId={user?.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <DriverWalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        walletData={enhancedWalletData}
      />

      <DeliveryFailModal
        isOpen={Boolean(failOrderTarget)}
        order={failOrderTarget}
        onClose={() => setFailOrderTarget(null)}
        onConfirmFail={handleConfirmFail}
        isLoading={failMutation.isPending}
      />
    </div>
  );
};

export default DeliveryPage;
