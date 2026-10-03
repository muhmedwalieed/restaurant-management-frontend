import React from 'react';
import { Timer, Grid3x3, Flame, CheckCircle2, Loader2, StickyNote, ShoppingBag, Bike, UtensilsCrossed, Phone, MessageSquare, Globe } from 'lucide-react';
import { formatTableLabel } from '../../../tables/utils/tableLabel.js';
import { ORDER_SOURCE_LABELS, ORDER_TYPE_LABELS } from '../../schemas/order.schema.js';

const getSourceIcon = (source) => {
  switch (source) {
    case 'WHATSAPP': return MessageSquare;
    case 'WEBSITE': return Globe;
    case 'PHONE': return Phone;
    case 'QR': return Grid3x3;
    default: return UtensilsCrossed;
  }
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'DELIVERY': return Bike;
    case 'PICKUP': return ShoppingBag;
    default: return UtensilsCrossed;
  }
};

const getUrgencyClasses = (minutes = 0) => {
  if (minutes < 10) {
    return {
      badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      headerBorder: 'border-b border-zinc-200 dark:border-zinc-800',
      timerText: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/40',
    };
  }
  if (minutes < 20) {
    return {
      badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      headerBorder: 'border-b border-amber-500/20',
      timerText: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/40 shadow-sm shadow-amber-500/5',
    };
  }
  return {
    badge: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 animate-pulse',
    headerBorder: 'border-b border-red-500/30',
    timerText: 'text-red-600 dark:text-red-400 font-black',
    border: 'border-red-500/60 ring-1 ring-red-500/30 shadow-md shadow-red-500/10',
  };
};

export const KdsOrderCard = ({ order, onAdvance, isAdvancing = false }) => {
  const urgency = getUrgencyClasses(order.elapsedMinutes || 0);
  const SourceIcon = getSourceIcon(order.source);
  const TypeIcon = getTypeIcon(order.type);
  const isConfirmed = order.status === 'CONFIRMED';
  const isPreparing = order.status === 'PREPARING';

  return (
    <div
      className={`rounded-2xl flex flex-col justify-between overflow-hidden bg-white dark:bg-zinc-950 border transition-all duration-200 shadow-sm ${urgency.border}`}
    >
      {/* ── Card Header: Order #, Table / Type, Timer ── */}
      <div className={`p-3 sm:p-4 bg-zinc-50/70 dark:bg-zinc-900/50 ${urgency.headerBorder} flex items-center justify-between gap-2`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono font-black text-base text-zinc-900 dark:text-zinc-100">
            #{order.orderNumber}
          </span>

          {order.tableLabel ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <Grid3x3 size={12} />
              <span>{formatTableLabel(order.tableLabel)}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
              <TypeIcon size={12} />
              <span>{ORDER_TYPE_LABELS[order.type] || order.type}</span>
            </span>
          )}
        </div>

        {/* Timer Chip */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${urgency.badge}`}>
          <Timer size={13} className="shrink-0" />
          <span className="font-mono">{order.elapsedMinutes || 0} دقيقة</span>
        </div>
      </div>

      {/* ── Metadata Sub-bar: Status, Source Channel ── */}
      <div className="px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-900 bg-transparent flex items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
          <SourceIcon size={12} />
          <span>{ORDER_SOURCE_LABELS[order.source] || order.source}</span>
        </div>

        {isConfirmed ? (
          <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            جديد
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md text-[11px]">
            <Flame size={12} className="animate-pulse" />
            قيد الطهي والتحضير
          </span>
        )}
      </div>

      {/* ── Items List ── */}
      <div className="flex-1 p-3 sm:p-4 space-y-2 overflow-y-auto max-h-[320px] custom-scrollbar">
        {order.items?.map((item) => (
          <div
            key={item.id}
            className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2.5"
          >
            {/* Quantity Pill */}
            <span className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-mono font-black text-xs bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              {item.quantity}×
            </span>

            {/* Product Name & Notes */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                {item.productName}
              </p>
              {item.notes && (
                <span className="inline-block mt-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded px-1.5 py-0.5">
                  ملاحظة: {item.notes}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* General Order Notes */}
        {order.notes && (
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
            <StickyNote size={14} className="shrink-0 text-amber-500" />
            <span className="font-semibold">ملاحظة الطلب: {order.notes}</span>
          </div>
        )}
      </div>

      {/* ── Card Footer: Big Touch Action Button ── */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
        <button
          type="button"
          disabled={isAdvancing}
          onClick={() => onAdvance(order)}
          className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 ${
            isConfirmed
              ? 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-500/20'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/20'
          }`}
        >
          {isAdvancing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>جاري التحديث...</span>
            </>
          ) : isConfirmed ? (
            <>
              <Flame size={16} />
              <span>بدء التحضير الآن</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              <span>جاهز للتقديم (اكتمال الطلب)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default KdsOrderCard;
