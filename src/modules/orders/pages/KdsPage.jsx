import { useState, useMemo, useCallback } from 'react';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { useKdsOrdersQuery, useUpdateKdsStatusMutation } from '../hooks/useOrders.js';
import { toast } from '../../../shared/context/ToastContext.jsx';
import { KdsNavHeader } from '../components/kds/KdsNavHeader.jsx';
import { KdsOrderCard } from '../components/kds/KdsOrderCard.jsx';
import { ChefHat, RotateCcw, AlertTriangle, Flame } from 'lucide-react';

const PILL_BASE =
  'py-1.5 px-4 rounded-full text-xs whitespace-nowrap flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 border';

const pillClass = (isActive) => {
  if (isActive) {
    return 'bg-zinc-900 dark:bg-zinc-800 text-white font-bold border-zinc-900 dark:border-zinc-700 shadow-sm';
  }
  return 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-900 font-medium';
};

export const KdsPage = () => {
  const { activeBranchId, activeBranch, isLoading: isBranchLoading } = useBranch();
  const { user, logout } = useAuth();
  const [filter, setFilter] = useState('ALL');
  const [advancingOrderId, setAdvancingOrderId] = useState(null);

  const {
    data: kdsResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useKdsOrdersQuery(activeBranchId);

  const advanceMutation = useUpdateKdsStatusMutation();
  const orders = useMemo(() => {
    if (!kdsResponse) return [];
    if (Array.isArray(kdsResponse)) return kdsResponse;
    if (Array.isArray(kdsResponse?.items)) return kdsResponse.items;
    return [];
  }, [kdsResponse]);

  const confirmedCount = useMemo(
    () => orders.filter((o) => o.status === 'CONFIRMED').length,
    [orders]
  );
  const preparingCount = useMemo(
    () => orders.filter((o) => o.status === 'PREPARING').length,
    [orders]
  );

  const filterTabs = useMemo(
    () => [
      { id: 'ALL', label: 'جميع الطلبات', count: orders.length },
      { id: 'CONFIRMED', label: 'جديد', count: confirmedCount },
      { id: 'PREPARING', label: 'قيد التحضير', count: preparingCount },
    ],
    [orders.length, confirmedCount, preparingCount]
  );

  const filteredOrders = useMemo(() => {
    if (filter === 'ALL') return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const handleAdvance = useCallback(
    async (order) => {
      setAdvancingOrderId(order.id);
      const newStatus = order.status === 'CONFIRMED' ? 'PREPARING' : 'READY';
      try {
        await advanceMutation.mutateAsync({
          branchId: activeBranchId,
          orderId: order.id,
          payload: { newStatus, expectedVersion: order.version },
        });
        if (newStatus === 'PREPARING') {
          toast.success(`تم بدء تحضير طلب #${order.orderNumber}`);
        } else {
          toast.success(`تم تجهيز طلب #${order.orderNumber} وهو جاهز للتقديم الآن`);
        }
      } catch (err) {
        toast.error(err?.message || 'تعذر تحديث حالة الطلب بالمطبخ');
      } finally {
        setAdvancingOrderId(null);
      }
    },
    [activeBranchId, advanceMutation]
  );

  return (
    <div className="h-screen w-full min-h-screen flex flex-col overflow-hidden bg-zinc-100 dark:bg-black text-zinc-900 dark:text-zinc-100" dir="rtl">
      {/* ── Top Terminal Nav Header ── */}
      <KdsNavHeader
        user={user}
        activeBranch={activeBranch}
        confirmedCount={confirmedCount}
        preparingCount={preparingCount}
        onRefresh={refetch}
        isFetching={isFetching}
        onLogout={logout}
      />

      {/* ── Secondary Pill Toolbar ── */}
      <div className="min-h-14 px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 custom-scrollbar py-1">
          {filterTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={`${PILL_BASE} ${pillClass(filter === t.id)}`}
            >
              <span>{t.label}</span>
              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Live Pulse Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>تحديث مباشر وتلقائي للمطبخ</span>
        </div>
      </div>

      {/* ── Main Orders Canvas ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-5">
        {isBranchLoading || (isLoading && !kdsResponse) ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <RotateCcw size={28} className="text-amber-500 animate-spin" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">جاري تحميل شاشة المطبخ...</p>
          </div>
        ) : !activeBranchId ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center bg-zinc-200 dark:bg-zinc-900 text-zinc-400">
              <ChefHat size={32} />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">يرجى تحديد فرع العمل</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
              اختر فرع المطعم النشط لعرض شاشة الطلبات الخاصة بالمطبخ.
            </p>
          </div>
        ) : isError ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertTriangle size={30} />
            </div>
            <h3 className="text-sm font-black text-red-500">تعذر تحميل طلبات المطبخ</h3>
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
        ) : filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 sm:p-12 space-y-3">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-400 shadow-sm">
              <ChefHat size={30} className="text-amber-500" />
            </div>
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">لا توجد طلبات نشطة حالياً</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
              المطبخ جاهز بالكامل! ستظهر أي طلبات مؤكدة جديدة تلقائياً وفورياً هنا.
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
          <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4.5">
            {filteredOrders.map((order) => (
              <KdsOrderCard
                key={order.id}
                order={order}
                onAdvance={handleAdvance}
                isAdvancing={advancingOrderId === order.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KdsPage;
