import React from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Clock,
  ChevronLeft,
  Receipt,
  Phone,
  MessageCircle,
  Globe,
  Monitor,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  Truck,
  XCircle,
} from 'lucide-react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';

const STATUS_CFG = {
  PENDING: { label: 'انتظار', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', Icon: Hourglass },
  CONFIRMED: { label: 'مؤكد', color: 'var(--ac)', bg: 'var(--ac-bg)', Icon: CheckCircle2 },
  PREPARING: { label: 'قيد التنفيذ', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', Icon: Clock },
  READY: { label: 'جاهز', color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', Icon: CheckCircle2 },
  OUT_FOR_DELIVERY: { label: 'في الطريق', color: '#818cf8', bg: 'rgba(129, 140, 248, 0.12)', Icon: Truck },
  DELIVERED: { label: 'تم التسليم', color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', Icon: CheckCircle2 },
  CANCELLED: { label: 'ملغي', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', Icon: XCircle },
};

const TYPE_CFG = {
  PICKUP: { label: 'استلام', Icon: ShoppingBag },
  DELIVERY: { label: 'توصيل', Icon: Bike },
  DINE_IN: { label: 'صالة', Icon: UtensilsCrossed },
};

const SOURCE_CFG = {
  CASHIER: { label: 'كاشير', Icon: Monitor },
  POS: { label: 'كاشير', Icon: Monitor },
  PHONE: { label: 'هاتف', Icon: Phone },
  WHATSAPP: { label: 'واتساب', Icon: MessageCircle },
  WEBSITE: { label: 'موقع', Icon: Globe },
  QR: { label: 'طاولة QR', Icon: QrCode },
};

function PayBadge({ order }) {
  const isPaid = order.paymentStatus === 'PAID';
  const isPartial = order.paymentStatus === 'PARTIAL';
  if (isPaid) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        مدفوع
      </span>
    );
  }
  if (isPartial) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: '#f59e0b' }}>
        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
        دفع جزئي
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: '#ef4444' }}>
      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
      غير مدفوع
    </span>
  );
}

export const PosOrdersTable = ({
  orders = [],
  selectedOrderId,
  onSelectOrder,
  onClearFilters,
  isLoading = false,
  isFetching = false,
  pagination = null,
  page = 1,
  onPageChange,
}) => {
  const { currency } = useCurrency();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-6 py-4">
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center select-none" style={{ color: 'var(--t3)' }}>
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center mb-3 border shadow-sm"
          style={{ background: 'var(--s1)', borderColor: 'var(--bd)', color: 'var(--t3)' }}
        >
          <Receipt size={28} />
        </div>
        <h4 className="text-sm font-black mb-1" style={{ color: 'var(--t1)' }}>لا توجد طلبات</h4>
        <p className="text-xs max-w-sm mb-4">لا توجد طلبات مطابقة للبحث أو معايير الفلترة المحددة لليوم</p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-primary text-white hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
          >
            إعادة ضبط الفلاتر / عرض كل الطلبات
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 flex flex-col min-h-0 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-right text-xs border-collapse">
            <thead
              className="sticky top-0 z-10 border-b font-bold text-[11px] border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400"
            >
              <tr>
                <th className="py-3 px-4">رقم الطلب</th>
                <th className="py-3 px-4">العميل / الطاولة</th>
                <th className="py-3 px-4">النوع</th>
                <th className="py-3 px-4">حالة الطلب</th>
                <th className="py-3 px-4">حالة الدفع</th>
                <th className="py-3 px-4">الإجمالي</th>
                <th className="py-3 px-4">الوقت</th>
                <th className="py-3 px-3 text-center w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {orders.map((o) => {
                const isSel = selectedOrderId === o.id;
                const statusInfo = STATUS_CFG[o.status] || { label: o.status, color: 'var(--t3)', bg: 'var(--s2)', Icon: Clock };
                const StatusIcon = statusInfo.Icon;
                const typeInfo = TYPE_CFG[o.type] || { label: o.type, Icon: ShoppingBag };
                const TypeIcon = typeInfo.Icon;

                const rawTableVal = o.table ? String(o.table.label || o.table.number || o.table.name || '').trim() : '';
                const tableLabel = rawTableVal ? (rawTableVal.startsWith('طاولة') ? rawTableVal : `طاولة ${rawTableVal}`) : '';
                const custName = o.customer?.name || o.customerName || tableLabel || 'عميل مباشر';
                const timeStr = o.createdAt ? new Date(o.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '';
                const total = Number(o.total || o.totalAmount || 0);

                return (
                  <tr
                    key={o.id}
                    onClick={() => onSelectOrder(o)}
                    className={`transition-colors cursor-pointer group ${
                      isSel
                        ? 'bg-zinc-800/60 border-r-2 border-zinc-600'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                    }`}
                  >
                    {/* Order Number */}
                    <td className="py-3.5 px-4 font-bold">
                      <span className="bg-zinc-800/90 text-zinc-200 border border-zinc-700 font-mono text-xs px-2.5 py-1 rounded-lg inline-block">
                        #{o.orderNumber || o.id?.slice(0, 6)}
                      </span>
                    </td>

                    {/* Customer / Table */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {custName}
                        </span>
                        {o.customer?.phone && (
                          <span className="text-xs text-zinc-400 font-normal font-mono mt-0.5" dir="ltr">
                            {o.customer.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4">
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                      >
                        <TypeIcon size={12} className="text-zinc-500 dark:text-zinc-400" />
                        <span>{typeInfo.label}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className="text-xs font-bold inline-flex items-center gap-1.5"
                        style={{ color: statusInfo.color }}
                      >
                        <StatusIcon size={14} style={{ color: statusInfo.color }} />
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-4">
                      <PayBadge order={o} />
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4">
                      <span className="whitespace-nowrap font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                        <span className="text-base font-mono tracking-tight">
                          {total % 1 === 0 ? total.toFixed(0) : total.toFixed(2)}
                        </span>
                        <span className="text-xs font-normal text-zinc-400">{currency || 'ج.م'}</span>
                      </span>
                    </td>

                    {/* Time Column */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-zinc-400 font-mono whitespace-nowrap inline-flex items-center gap-1">
                        <Clock size={12} className="text-zinc-400" />
                        <span>{timeStr}</span>
                      </span>
                    </td>

                    {/* Action Arrow */}
                    <td className="py-3.5 px-3 text-center">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer mx-auto"
                      >
                        <ChevronLeft size={16} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between py-3 border-t border-zinc-200 dark:border-zinc-800 text-xs">
            <span className="text-zinc-500">صفحة {pagination.page} من {pagination.totalPages} — {pagination.total} طلب</span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={page <= 1 || isFetching} onClick={() => onPageChange(page - 1)} className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 cursor-pointer">السابق</button>
              <button type="button" disabled={page >= pagination.totalPages || isFetching} onClick={() => onPageChange(page + 1)} className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 cursor-pointer">التالي</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PosOrdersTable;
