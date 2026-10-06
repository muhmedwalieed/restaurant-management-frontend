import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Bike,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Package,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';

export const DeliveryOrderCard = ({
  order,
  onPickup,
  onCancelPickup,
  onDeliver,
  onFail,
  onHandoverReturn,
  onAcceptAssignment,
  onRejectAssignment,
  isProcessing = false,
  currentDriverId = null,
}) => {
  const { currency } = useCurrency();
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleCancelClick = async () => {
    if (!onCancelPickup || isProcessing || cooldown > 0) return;
    setCooldown(15);
    await onCancelPickup(order);
  };

  const handlePickupClick = async () => {
    if (isProcessing || cooldown > 0) return;
    await onPickup(order);
  };
  const customer = order.customer;
  const isPendingHandover = order.deliveryStatus === 'PENDING_HANDOVER';
  const isPendingDriverAcceptance =
    order.deliveryStatus === 'PENDING_DRIVER_ACCEPTANCE' &&
    (!currentDriverId || order.driverEmployeeId === currentDriverId || order.driver?.id === currentDriverId);
  const isAssignedToOther =
    order.deliveryStatus === 'PENDING_DRIVER_ACCEPTANCE' &&
    currentDriverId &&
    order.driverEmployeeId &&
    order.driverEmployeeId !== currentDriverId;
  const isReady =
    (order.status === 'READY' || order.status === 'CONFIRMED' || order.status === 'PREPARING') &&
    !isPendingHandover &&
    !isPendingDriverAcceptance &&
    !isAssignedToOther;
  const isOut = order.status === 'OUT_FOR_DELIVERY';
  const isDelivered = order.status === 'DELIVERED';
  const isCancelled = order.status === 'CANCELLED';
  const isCod = order.isCod || order.paymentStatus === 'PENDING' || order.paymentMethod === 'CASH';

  const cleanPhone = customer?.phone?.replace(/\D/g, '') || '';
  const waPhone = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;

  return (
    <div
      className={`rounded-2xl border flex flex-col justify-between overflow-hidden shadow-xs transition-all select-text ${
        isPendingDriverAcceptance
          ? 'bg-white dark:bg-zinc-950 border-amber-500 dark:border-amber-500 shadow-md ring-2 ring-amber-500/20'
          : isOut
          ? 'bg-white dark:bg-zinc-950 border-amber-500/40 dark:border-amber-500/40 shadow-sm'
          : isPendingHandover
          ? 'bg-white dark:bg-zinc-950 border-amber-500/30 dark:border-amber-500/30'
          : isReady
          ? 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
          : isDelivered
          ? 'bg-white/80 dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-850 opacity-85'
          : isCancelled
          ? 'bg-white dark:bg-zinc-950 border-red-500/30 dark:border-red-500/30'
          : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
      }`}
      dir="rtl"
    >
      {/* ── Top Header ── */}
      <div className="px-4 py-3 flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-base text-zinc-900 dark:text-zinc-100">
            #{order.orderNumber}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>

        {/* Status Badge */}
        {isPendingDriverAcceptance && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
            <Sparkles size={12} className="text-amber-500" />
            <span>طلب توصيل موجه إليك</span>
          </span>
        )}
        {isPendingHandover && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock size={12} className="animate-spin" />
            <span>بانتظار موافقة الكاشير</span>
          </span>
        )}
        {isReady && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
            <Package size={12} className="text-zinc-500" />
            <span>جاهز للاستلام بالمطعم</span>
          </span>
        )}
        {isOut && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Bike size={13} />
            <span>في الطريق للعميل</span>
          </span>
        )}
        {isDelivered && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={12} />
            <span>تم التسليم</span>
          </span>
        )}
        {isCancelled && (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
              order.deliveryStatus === 'RETURN_CONFIRMED'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : order.deliveryStatus === 'RETURNED_TO_CASHIER'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
            }`}
          >
            {order.deliveryStatus === 'RETURN_CONFIRMED' ? (
              <>
                <CheckCircle2 size={12} />
                <span>مرتجع مستلم بالمطعم</span>
              </>
            ) : order.deliveryStatus === 'RETURNED_TO_CASHIER' ? (
              <>
                <Clock size={12} className="animate-spin" />
                <span>بانتظار استلام الكاشير</span>
              </>
            ) : (
              <>
                <AlertTriangle size={12} />
                <span>تعذر التسليم (مرتجع)</span>
              </>
            )}
          </span>
        )}
      </div>

      {/* ── Body: Customer, Address & Items ── */}
      <div className="p-4 space-y-3 flex-1 text-xs">
        {/* Customer & Direct Actions (Only revealed once order is accepted / out for delivery / delivered) */}
        {(isOut || isDelivered) && customer && (
          <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-xs truncate text-zinc-900 dark:text-zinc-100">
                {customer?.name || 'عميل توصيل'}
              </p>
              <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5" dir="ltr">
                {customer?.phone || 'بدون هاتف'}
              </p>
            </div>

            {customer?.phone && (
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`tel:${customer.phone}`}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-200/70 dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white text-zinc-700 dark:text-zinc-300 border border-zinc-300/60 dark:border-zinc-700 active:scale-95 transition-all shadow-xs"
                  title="اتصال بالعميل"
                >
                  <Phone size={13} />
                </a>
                <a
                  href={`https://wa.me/${waPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-200/70 dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white text-zinc-700 dark:text-zinc-300 border border-zinc-300/60 dark:border-zinc-700 active:scale-95 transition-all shadow-xs"
                  title="محادثة واتساب"
                >
                  <MessageCircle size={14} />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Address & Delivery Notes */}
        <div className="space-y-1.5">
          <div className="flex items-start gap-1.5 text-zinc-700 dark:text-zinc-300">
            <MapPin size={14} className="text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5" />
            <span className="font-medium text-xs leading-relaxed">
              {order.address || 'العنوان غير محدد'}
            </span>
          </div>

          {order.notes && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
              <FileText size={13} className="shrink-0 mt-0.5" />
              <span>{order.notes}</span>
            </div>
          )}
        </div>

        {/* Cancellation Reason Callout */}
        {isCancelled && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-500" />
            <div className="space-y-0.5 min-w-0">
              <span className="font-bold block text-xs">سبب تعذر التسليم (مرتجع):</span>
              <span className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-normal block">
                {order.cancelReason || order.driverNotes || 'تعذر الوصول إلى العميل'}
              </span>
            </div>
          </div>
        )}

        {/* Items list */}
        <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-855 space-y-1.5">
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">الأصناف:</span>
          <div className="space-y-1 max-h-28 overflow-y-auto custom-scrollbar">
            {order.items?.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-0.5 text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    {it.quantity}×
                  </span>
                  <span className="truncate">{it.productName}</span>
                </div>
                {it.notes && (
                  <span className="text-[11px] text-zinc-400 truncate max-w-[100px]">
                    {it.notes}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer: Financials & Action Buttons ── */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
        {/* Pricing & Payment Method */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              {isCod ? 'المطلوب تحصيله:' : 'المبلغ المدفوع:'}
            </span>
            <div className="font-mono font-black text-lg text-zinc-900 dark:text-zinc-100">
              {Number(order.total || 0).toFixed(2)}{' '}
              <span className="text-xs font-normal text-zinc-500">{currency}</span>
            </div>
          </div>

          <div>
            {isCod ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <span>كاش عند الاستلام</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span>مدفوع أونلاين</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isPendingDriverAcceptance && (
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onAcceptAssignment && onAcceptAssignment(order)}
              className="col-span-2 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-emerald-500/20"
            >
              <CheckCircle2 size={15} />
              <span>قبول واستلام الأوردر</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onRejectAssignment && onRejectAssignment(order)}
              className="py-2.5 px-2 rounded-xl font-bold text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-700 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <XCircle size={14} />
              <span>رفض</span>
            </button>
          </div>
        )}

        {isAssignedToOther && (
          <div className="w-full py-2.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-center font-medium text-xs flex items-center justify-center gap-2">
            <Clock size={13} />
            <span>بانتظار موافقة طيار آخر</span>
          </div>
        )}

        {isPendingHandover && (
          <div className="flex items-center gap-2">
            <div className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-center font-semibold text-xs flex items-center justify-center gap-2">
              <Clock size={14} className="animate-spin" />
              <span>بانتظار تسليم الكاشير</span>
            </div>
            {onCancelPickup && (
              <button
                type="button"
                disabled={isProcessing || cooldown > 0}
                onClick={handleCancelClick}
                className="px-3 py-2.5 rounded-xl font-semibold text-xs text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/30 border border-zinc-200 dark:border-zinc-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إلغاء
              </button>
            )}
          </div>
        )}

        {isReady && (
          <button
            type="button"
            disabled={isProcessing || cooldown > 0}
            onClick={handlePickupClick}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white active:scale-98 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Clock size={14} className="animate-spin" />
                <span>جاري إرسال الطلب...</span>
              </>
            ) : cooldown > 0 ? (
              <>
                <Clock size={14} className="text-amber-500 animate-pulse" />
                <span>يرجى الانتظار ({cooldown} ث)</span>
              </>
            ) : (
              <>
                <Bike size={15} />
                <span>طلب استلام الأوردر للخروج</span>
              </>
            )}
          </button>
        )}

        {isOut && (
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onDeliver(order)}
              className="col-span-2 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-emerald-500/20"
            >
              <CheckCircle2 size={15} />
              <span>{isCod ? 'تم التسليم وتحصيل المبلغ' : 'تم التسليم للعميل'}</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onFail(order)}
              className="py-2.5 px-2 rounded-xl font-bold text-xs text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <AlertTriangle size={14} />
              <span>تعذر</span>
            </button>
          </div>
        )}

        {/* Cancelled / Return Handover to Cashier Controls */}
        {isCancelled && (
          <div>
            {order.deliveryStatus === 'RETURN_CONFIRMED' ? (
              <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-center font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                <span>تم استلام المرتجع في المطعم بنجاح</span>
              </div>
            ) : order.deliveryStatus === 'RETURNED_TO_CASHIER' ? (
              <div className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-center font-semibold text-xs flex items-center justify-center gap-2">
                <Clock size={15} className="animate-spin text-amber-500 shrink-0" />
                <span>تم تسليم الطلب، بانتظار تأكيد استلام الكاشير</span>
              </div>
            ) : (
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => onHandoverReturn && onHandoverReturn(order)}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white active:scale-98 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Package size={15} />
                <span>تسليم المرتجع للكاشير بالمطعم</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryOrderCard;
