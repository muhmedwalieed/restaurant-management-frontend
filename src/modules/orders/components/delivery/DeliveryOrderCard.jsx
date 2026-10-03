import React from 'react';
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
} from 'lucide-react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';

export const DeliveryOrderCard = ({
  order,
  onPickup,
  onDeliver,
  onFail,
  isProcessing = false,
}) => {
  const { currency } = useCurrency();
  const customer = order.customer;
  const isReady = order.status === 'READY' || order.status === 'CONFIRMED' || order.status === 'PREPARING';
  const isOut = order.status === 'OUT_FOR_DELIVERY';
  const isDelivered = order.status === 'DELIVERED';
  const isCancelled = order.status === 'CANCELLED';
  const isCod = order.isCod || order.paymentStatus === 'PENDING' || order.paymentMethod === 'CASH';

  const cleanPhone = customer?.phone?.replace(/\D/g, '') || '';
  const waPhone = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;

  return (
    <div
      className={`rounded-2xl border flex flex-col justify-between overflow-hidden shadow-sm transition-all ${
        isOut
          ? 'bg-amber-500/5 border-amber-500/30 dark:bg-amber-500/10 dark:border-amber-500/40 ring-1 ring-amber-500/20'
          : isReady
          ? 'bg-white dark:bg-zinc-950 border-blue-500/30 dark:border-blue-500/40'
          : isDelivered
          ? 'bg-white/60 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 opacity-80'
          : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
      }`}
      dir="rtl"
    >
      {/* ── Top Header ── */}
      <div className="p-3.5 pb-2.5 flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-900 bg-black/2 dark:bg-white/2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-base text-zinc-900 dark:text-zinc-100">
            #{order.orderNumber}
          </span>
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>

        {/* Status Badge */}
        {isReady && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Package size={12} />
            <span>جاهز للاستلام بالمطعم</span>
          </span>
        )}
        {isOut && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
            <Bike size={13} />
            <span>في الطريق للعميل</span>
          </span>
        )}
        {isDelivered && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={12} />
            <span>تم التسليم</span>
          </span>
        )}
        {isCancelled && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <AlertTriangle size={12} />
            <span>تعذر التسليم / ملغي</span>
          </span>
        )}
      </div>

      {/* ── Body: Customer, Address & Items ── */}
      <div className="p-3.5 space-y-3 flex-1 text-xs">
        {/* Customer & Direct Actions */}
        <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/50 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-xs truncate text-zinc-900 dark:text-zinc-100">
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
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 transition-all shadow-xs"
                title="اتصال بالعميل"
              >
                <Phone size={14} />
              </a>
              <a
                href={`https://wa.me/${waPhone}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 active:scale-95 transition-all shadow-xs"
                title="محادثة واتساب"
              >
                <MessageCircle size={15} />
              </a>
            </div>
          )}
        </div>

        {/* Address & Delivery Notes */}
        <div className="space-y-1.5">
          <div className="flex items-start gap-1.5 text-zinc-700 dark:text-zinc-300">
            <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
            <span className="font-medium text-xs leading-relaxed">
              {order.address || 'العنوان غير محدد'}
            </span>
          </div>

          {order.notes && (
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] flex items-start gap-1.5">
              <FileText size={13} className="shrink-0 mt-0.5" />
              <span>{order.notes}</span>
            </div>
          )}
        </div>

        {/* Items list */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 space-y-1">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">الأصناف:</span>
          <div className="space-y-1 max-h-28 overflow-y-auto custom-scrollbar">
            {order.items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-0.5 text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    {it.quantity}×
                  </span>
                  <span className="truncate">{it.productName}</span>
                </div>
                {it.notes && (
                  <span className="text-[10px] text-zinc-400 truncate max-w-[100px]">
                    ({it.notes})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer: Financials & Action Buttons ── */}
      <div className="p-3.5 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
        {/* Pricing & Payment Method */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              {isCod ? 'المطلوب تحصيله (COD):' : 'المبلغ المدفوع:'}
            </span>
            <div className="font-mono font-black text-lg text-zinc-900 dark:text-zinc-100">
              {order.total.toFixed(2)}{' '}
              <span className="text-xs font-normal text-zinc-500">{currency}</span>
            </div>
          </div>

          <div>
            {isCod ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <span>💵 كاش عند الاستلام</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <span>💳 مدفوع أونلاين</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isReady && (
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onPickup(order)}
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Bike size={16} />
            <span>استلام الطلب وبدء التوصيل 🛵</span>
          </button>
        )}

        {isOut && (
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onDeliver(order)}
              className="col-span-2 py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 border border-emerald-500/20"
            >
              <CheckCircle2 size={16} />
              <span>{isCod ? 'تم التسليم وتحصيل المبلغ' : 'تم التسليم للعميل'}</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onFail(order)}
              className="py-3 px-2 rounded-xl font-bold text-xs text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 active:scale-98 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <AlertTriangle size={14} />
              <span>تعذر</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryOrderCard;
