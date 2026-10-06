import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  User,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { ORDER_STATUSES } from '../../constants.js';

export const OrderHistoryAuditTimeline = ({ order }) => {
  const { currency } = useCurrency();

  if (!order) return null;

  // Build combined events timeline
  const events = [];

  // 1. Order Creation Event
  if (order.createdAt) {
    events.push({
      id: 'created',
      timestamp: new Date(order.createdAt),
      type: 'CREATION',
      title: 'تم إنشاء الطلب',
      description: `تم إنشاء الطلب عبر ${order.source === 'POS' ? 'الكاشير / نقطة البيع' : order.source === 'PHONE' ? 'خدمة الهاتف / الكول سنتر' : order.source === 'WAITER' ? 'الويتر' : 'النظام'}`,
      user: order.createdByUser?.name || order.cashierName || 'الموظف المسئول',
      icon: Sparkles,
      color: 'blue',
    });
  }

  // 2. Status Transition Audit logs
  if (Array.isArray(order.statusHistory)) {
    order.statusHistory.forEach((h, idx) => {
      const st = ORDER_STATUSES.find((s) => s.id === h.toStatus) || { label: h.toStatus };
      events.push({
        id: `status_${idx}`,
        timestamp: new Date(h.createdAt || h.timestamp),
        type: 'STATUS_CHANGE',
        title: `تغيير الحالة إلى: ${st.label}`,
        description: h.reason ? `السبب: ${h.reason}` : undefined,
        user: h.user?.name || h.userName || 'النظام',
        icon: CheckCircle2,
        color: h.toStatus === 'CANCELLED' ? 'red' : 'purple',
      });
    });
  }

  // 3. Payment Transactions
  if (Array.isArray(order.payments)) {
    order.payments.forEach((p, idx) => {
      const methodLabel = p.method === 'INSTAPAY' ? 'انستاباي' : p.method === 'WALLET' ? 'محفظة' : p.method === 'CASH' ? 'نقدي' : p.method;
      events.push({
        id: `pay_${idx}`,
        timestamp: new Date(p.createdAt || p.timestamp),
        type: 'PAYMENT',
        title: `تسجيل دفعة: ${Number(p.amount).toFixed(2)} ${currency}`,
        description: `طريقة الدفع: ${methodLabel}${p.reference ? ` (مرجع: ${p.reference})` : ''}`,
        user: p.processedBy?.name || p.cashierName || 'الكاشير',
        icon: CreditCard,
        color: 'emerald',
      });
    });
  }

  // Sort events chronologically (oldest first or newest first)
  events.sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-4 bg-white dark:bg-zinc-950 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm" dir="rtl">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <Clock size={16} />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">سجل الأحداث والعمليات (History Timeline)</h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full">
          {events.length} حدث
        </span>
      </div>

      <div className="relative pl-2 pr-4 space-y-6 before:absolute before:right-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
        {events.map((ev) => {
          const Icon = ev.icon;
          const colorClasses = {
            blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
            emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
            purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
            red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
          }[ev.color] || 'bg-zinc-500/10 text-zinc-600 border-zinc-500/30';

          return (
            <div key={ev.id} className="relative flex items-start gap-4 animate-fadeIn">
              {/* Timeline marker icon */}
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 z-10 shadow-xs ${colorClasses}`}>
                <Icon size={14} />
              </div>

              {/* Event details card */}
              <div className="flex-1 bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{ev.title}</span>
                  <span className="text-[10px] text-zinc-400 font-mono" dir="ltr">
                    {ev.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })} • {ev.timestamp.toLocaleDateString('ar-EG')}
                  </span>
                </div>

                {ev.description && (
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {ev.description}
                  </p>
                )}

                {ev.user && (
                  <div className="pt-1 flex items-center gap-1.5 text-[10px] text-zinc-400">
                    <User size={11} className="text-zinc-400" />
                    <span>بواسطة: {ev.user}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistoryAuditTimeline;
