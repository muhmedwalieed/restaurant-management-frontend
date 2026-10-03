import React, { useState, useMemo, useCallback } from 'react';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import {
  useDeliveryOrdersQuery,
  useDriverWalletQuery,
  usePickupDeliveryMutation,
  useDeliverOrderMutation,
  useFailDeliveryMutation,
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
  const [tab, setTab] = useState('ACTIVE'); // ACTIVE | COMPLETED
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

  const { data: walletResponse } = useDriverWalletQuery(activeBranchId);
  const walletData = walletResponse?.data || walletResponse;

  // Mutations
  const pickupMutation = usePickupDeliveryMutation();
  const deliverMutation = useDeliverOrderMutation();
  const failMutation = useFailDeliveryMutation();

  const allOrders = useMemo(() => {
    if (!ordersResponse) return [];
    if (Array.isArray(ordersResponse)) return ordersResponse;
    if (Array.isArray(ordersResponse?.data)) return ordersResponse.data;
    if (Array.isArray(ordersResponse?.items)) return ordersResponse.items;
    return [];
  }, [ordersResponse]);

  const activeOrders = useMemo(
    () => allOrders.filter((o) => o.status === 'READY' || o.status === 'OUT_FOR_DELIVERY' || o.status === 'CONFIRMED' || o.status === 'PREPARING'),
    [allOrders]
  );

  const completedOrders = useMemo(
    () => allOrders.filter((o) => o.status === 'DELIVERED' || o.status === 'CANCELLED'),
    [allOrders]
  );

  const outForDeliveryCount = useMemo(
    () => allOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length,
    [allOrders]
  );

  const readyCount = useMemo(
    () => allOrders.filter((o) => o.status === 'READY' || o.status === 'CONFIRMED' || o.status === 'PREPARING').length,
    [allOrders]
  );

  const displayedOrders = tab === 'ACTIVE' ? activeOrders : completedOrders;

  // Handlers
  const handlePickup = useCallback(
    async (order) => {
      setProcessingOrderId(order.id);
      try {
        await pickupMutation.mutateAsync({
          branchId: activeBranchId,
          orderId: order.id,
          payload: { expectedVersion: order.version },
        });
        toast.success(`تم استلام طلب #${order.orderNumber} وأصبح في عهدتك للتوصيل 🛵`);
      } catch (err) {
        toast.error(err?.message || 'تعذر استلام الطلب');
      } finally {
        setProcessingOrderId(null);
      }
    },
    [activeBranchId, pickupMutation]
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

  return (
    <div className="h-screen w-full min-h-screen flex flex-col overflow-hidden bg-zinc-100 dark:bg-black text-zinc-900 dark:text-zinc-100" dir="rtl">
      {/* ── Top Header ── */}
      <DeliveryNavHeader
        user={user}
        activeBranch={activeBranch}
        walletData={walletData}
        onRefresh={refetch}
        isFetching={isFetching}
        onOpenWallet={() => setIsWalletOpen(true)}
        onLogout={logout}
      />

      {/* ── Tabs & Stats Toolbar ── */}
      <div className="min-h-14 px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 custom-scrollbar py-1">
          <button
            type="button"
            onClick={() => setTab('ACTIVE')}
            className={`${PILL_BASE} ${pillClass(tab === 'ACTIVE')}`}
          >
            <span>الطلبات الحالية</span>
            <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
              {activeOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab('COMPLETED')}
            className={`${PILL_BASE} ${pillClass(tab === 'COMPLETED')}`}
          >
            <span>المكتملة اليوم</span>
            <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
              {completedOrders.length}
            </span>
          </button>
        </div>

        {/* Quick Active Indicators */}
        <div className="flex items-center gap-2 text-xs">
          {outForDeliveryCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
              <Bike size={13} />
              <span>{outForDeliveryCount} معك بالشارع</span>
            </span>
          )}
          {readyCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
              <Package size={13} />
              <span>{readyCount} بانتظار الاستلام</span>
            </span>
          )}
        </div>
      </div>

      {/* ── Main Orders Canvas ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-5">
        {isBranchLoading || (isOrdersLoading && !ordersResponse) ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <RotateCcw size={28} className="text-emerald-500 animate-spin" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">جاري تحميل طلبات التوصيل...</p>
          </div>
        ) : !activeBranchId ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center bg-zinc-200 dark:bg-zinc-900 text-zinc-400">
              <Bike size={32} />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">يرجى تحديد فرع العمل</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
              اختر فرع المطعم النشط لعرض شاشة طلبات التوصيل.
            </p>
          </div>
        ) : isError ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertTriangle size={30} />
            </div>
            <h3 className="text-sm font-black text-red-500">تعذر تحميل طلبات التوصيل</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
              حدث خطأ في الاتصال بالخادم، يرجى إعادة المحاولة.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-md cursor-pointer border border-emerald-500/20"
            >
              <RotateCcw size={14} />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 sm:p-12 space-y-3">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-400 shadow-sm">
              <Bike size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
              {tab === 'ACTIVE' ? 'لا توجد طلبات توصيل حالياً' : 'لا توجد طلبات مكتملة اليوم'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
              {tab === 'ACTIVE'
                ? 'أنت جاهز تماماً! ستظهر أي طلبات دليفري جديدة جاهزة للتوصيل فوراً هنا.'
                : 'سيظهر هنا سجل الطلبات التي قمت بتسليمها اليوم.'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-md cursor-pointer border border-emerald-500/20 disabled:opacity-50"
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
                onDeliver={handleDeliver}
                onFail={(o) => setFailOrderTarget(o)}
                isProcessing={processingOrderId === order.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <DriverWalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        walletData={walletData}
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
