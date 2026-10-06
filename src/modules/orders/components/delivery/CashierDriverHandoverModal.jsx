import React, { useState } from 'react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import {
  usePendingHandoversQuery,
  useApprovePickupMutation,
  useRejectPickupMutation,
  useConfirmReturnMutation,
} from '../../hooks/useDelivery.js';
import { toast } from '../../../../shared/context/ToastContext.jsx';
import {
  Bike,
  CheckCircle2,
  X,
  MapPin,
  Phone,
  User,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Package,
} from 'lucide-react';

export const CashierDriverHandoverModal = ({
  isOpen,
  onClose,
  branchId,
  initialOrderId = null,
}) => {
  const { currency } = useCurrency();
  const { data: response } = usePendingHandoversQuery(branchId);
  const approveMutation = useApprovePickupMutation();
  const rejectMutation = useRejectPickupMutation();
  const confirmReturnMutation = useConfirmReturnMutation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const pendingOrders = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
    ? response
    : [];

  // Sync index with initialOrderId whenever modal opens or changes
  React.useEffect(() => {
    if (isOpen && initialOrderId && pendingOrders.length > 0) {
      const foundIdx = pendingOrders.findIndex((o) => o.id === initialOrderId);
      if (foundIdx !== -1) {
        setCurrentIndex(foundIdx);
      }
    } else if (isOpen && !initialOrderId) {
      setCurrentIndex(0);
    }
  }, [isOpen, initialOrderId, pendingOrders.length]);

  // If not open or no pending orders, don't render
  if (!isOpen || pendingOrders.length === 0) return null;

  // Ensure current index is within bounds
  const safeIndex = Math.min(Math.max(0, currentIndex), pendingOrders.length - 1);
  const currentOrder = pendingOrders[safeIndex] || pendingOrders[0];

  if (!currentOrder) return null;

  const isReturn =
    currentOrder.deliveryStatus === 'FAILED_DELIVERY' ||
    currentOrder.deliveryStatus === 'RETURNED_TO_CASHIER' ||
    currentOrder.status === 'CANCELLED';

  const rawDriverName = currentOrder.driver?.name || 'مندوب التوصيل';
  const cleanDriverName = rawDriverName.replace(/\s*\(.*?\)\s*/g, ' ').trim() || rawDriverName;

  const handleConfirmReturn = async () => {
    try {
      await confirmReturnMutation.mutateAsync({
        branchId,
        orderId: currentOrder.id,
      });
      toast.success(
        `تم تأكيد استلام مرتجع طلب #${currentOrder.orderNumber} في المطعم بنجاح ✅`
      );
      if (pendingOrders.length <= 1) {
        onClose?.();
      } else if (safeIndex > 0) {
        setCurrentIndex(safeIndex - 1);
      }
    } catch (err) {
      toast.error(err?.message || 'تعذر تأكيد استلام المرتجع');
    }
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({
        branchId,
        orderId: currentOrder.id,
      });
      toast.success(
        `تمت الموافقة وتسليم طلب #${currentOrder.orderNumber} للطيار ${cleanDriverName} بنجاح`
      );
      setShowRejectInput(false);
      setRejectReason('');
      if (pendingOrders.length <= 1) {
        onClose?.();
      } else if (safeIndex > 0) {
        setCurrentIndex(safeIndex - 1);
      }
    } catch (err) {
      toast.error(err?.message || 'تعذر تأكيد تسليم الطلب للطيار');
    }
  };

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync({
        branchId,
        orderId: currentOrder.id,
        payload: { reason: rejectReason || 'تم رفض التسليم من قبل الكاشير' },
      });
      toast.warning(`تم رفض تسليم طلب #${currentOrder.orderNumber} للطيار`);
      setShowRejectInput(false);
      setRejectReason('');
      if (pendingOrders.length <= 1) {
        onClose?.();
      } else if (safeIndex > 0) {
        setCurrentIndex(safeIndex - 1);
      }
    } catch (err) {
      toast.error(err?.message || 'تعذر رفض تسليم الطلب');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-950 rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] text-right animate-in zoom-in-95 duration-150 select-text"
        dir="rtl"
      >
        {/* ── Modal Header ── */}
        <div className="px-5 py-4 bg-zinc-50/70 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                isReturn
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {isReturn ? <Package size={20} /> : <Bike size={20} />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 leading-tight">
                  {isReturn ? 'استلام مرتجع من الطيار بالمطعم' : 'طلب استلام أوردر ديلفري'}
                </h3>
                {pendingOrders.length > 1 && (
                  <span className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {safeIndex + 1} من {pendingOrders.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-tight">
                {isReturn
                  ? 'المندوب يعيد الأوردر للمطعم لتعذر التسليم'
                  : 'مندوب التوصيل بانتظار موافقة وتسليم الأوردر'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 mr-2">
            {/* Navigation for multiple requests */}
            {pendingOrders.length > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={safeIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed border border-zinc-200 dark:border-zinc-800"
                >
                  <ChevronRight size={15} />
                </button>
                <button
                  type="button"
                  disabled={safeIndex >= pendingOrders.length - 1}
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      Math.min(pendingOrders.length - 1, prev + 1)
                    )
                  }
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed border border-zinc-200 dark:border-zinc-800"
                >
                  <ChevronLeft size={15} />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-200 dark:hover:border-red-800/80 transition-all cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Modal Body / Order & Driver Details ── */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {/* Driver Card */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold flex items-center justify-center border border-zinc-300 dark:border-zinc-700 shrink-0">
                <User size={18} />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block">
                  مندوب التوصيل:
                </span>
                <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                  {cleanDriverName}
                </span>
                {currentOrder.driver?.phone && (
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-mono text-[11px] mt-0.5">
                    <Phone size={11} className="text-zinc-400 shrink-0" />
                    <span dir="ltr">{currentOrder.driver.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-left font-mono">
              <span className="text-[10px] text-zinc-400 block">وقت الطلب:</span>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {currentOrder.driverRequestedAt || currentOrder.updatedAt
                  ? new Date(currentOrder.driverRequestedAt || currentOrder.updatedAt).toLocaleTimeString('ar-EG', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'الآن'}
              </span>
            </div>
          </div>

          {/* Reason Alert if Return */}
          {isReturn && (currentOrder.cancelReason || currentOrder.driverNotes) && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-500/30 space-y-1">
              <span className="font-bold text-rose-700 dark:text-rose-400 text-xs block">
                سبب تعذر التسليم المذكور من الطيار:
              </span>
              <p className="text-xs text-rose-600 dark:text-rose-300">
                {currentOrder.cancelReason || currentOrder.driverNotes}
              </p>
            </div>
          )}

          {/* Order Info & Customer */}
          <div className="bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                  طلب #{currentOrder.orderNumber}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400 text-xs truncate">
                  {currentOrder.customer?.name ? `• ${currentOrder.customer.name}` : ''}
                </span>
              </div>
              <span className="font-mono font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                {Number(currentOrder.total).toFixed(2)} {currency}
              </span>
            </div>

            {/* Address */}
            {currentOrder.address && (
              <div className="flex items-start gap-1.5 text-zinc-600 dark:text-zinc-400 text-xs">
                <MapPin size={13} className="shrink-0 mt-0.5 text-zinc-400" />
                <span className="leading-snug">{currentOrder.address}</span>
              </div>
            )}

            {/* Items summary */}
            {currentOrder.items && currentOrder.items.length > 0 && (
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <span className="text-[11px] text-zinc-400 font-medium block">محتويات الأوردر المرتجع:</span>
                <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar pl-1">
                  {currentOrder.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 py-0.5">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">{it.quantity}×</strong>
                        <span className="truncate">{it.productName}</span>
                      </span>
                      <span className="font-mono text-zinc-400 text-xs shrink-0 mr-2">
                        {(it.subtotal || it.quantity * it.unitPrice).toFixed(2)} {currency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Compact Payment / COD Alert */}
          <div
            className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-between gap-2.5 ${
              isReturn
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400'
                : currentOrder.isCod
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isReturn ? (
                <AlertTriangle size={15} className="shrink-0 text-rose-500" />
              ) : currentOrder.isCod ? (
                <AlertTriangle size={15} className="shrink-0 text-amber-500" />
              ) : (
                <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
              )}
              <span className="font-semibold text-xs truncate">
                {isReturn ? 'طلب ملغي / تعذر التسليم - تم إخلاء العهدة' : currentOrder.isCod ? 'تحصيل كاش عند التسليم' : 'مدفوع مسبقاً'}
              </span>
            </div>

            <span className="font-mono font-bold text-xs shrink-0">
              {Number(currentOrder.total).toFixed(2)} {currency}
            </span>
          </div>

          {/* Reject Input Field */}
          {showRejectInput && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-500/30 space-y-2 animate-in fade-in">
              <label className="font-bold text-red-700 dark:text-red-400 block text-xs">
                سبب رفض التسليم:
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="مثال: الأوردر غير جاهز بعد / سيخرج مع مندوب آخر"
                className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          )}
        </div>

        {/* ── Modal Actions ── */}
        <div className="p-4 sm:p-5 bg-zinc-50/70 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          {isReturn ? (
            <button
              type="button"
              onClick={handleConfirmReturn}
              disabled={confirmReturnMutation.isPending}
              className="w-full py-2.5 px-5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 border border-emerald-500/20"
            >
              <CheckCircle2 size={16} />
              <span>
                {confirmReturnMutation.isPending
                  ? 'جاري التأكيد...'
                  : 'تأكيد استلام المرتجع في المطعم'}
              </span>
            </button>
          ) : showRejectInput ? (
            <div className="w-full flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectInput(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={rejectMutation.isPending}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-500 cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <X size={15} />
                <span>{rejectMutation.isPending ? 'جاري الرفض...' : 'تأكيد الرفض'}</span>
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowRejectInput(true)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 active:scale-98 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <X size={14} />
                <span>رفض الاستلام</span>
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                className="flex-1 py-2.5 px-5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 border border-emerald-500/20"
              >
                <CheckCircle2 size={16} />
                <span>
                  {approveMutation.isPending
                    ? 'جاري التسليم...'
                    : `تسليم الأوردر للطيار`}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashierDriverHandoverModal;
