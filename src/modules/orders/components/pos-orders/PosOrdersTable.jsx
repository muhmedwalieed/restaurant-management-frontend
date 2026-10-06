import React, { useMemo } from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Receipt,
  CheckCircle2,
  Hourglass,
  Truck,
  XCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { formatTableLabel } from '../../../tables/utils/tableLabel.js';

const STATUS_CFG = {
  PENDING: { label: 'انتظار', colorClass: 'text-amber-600 dark:text-amber-400', Icon: Hourglass },
  CONFIRMED: { label: 'مؤكد', colorClass: 'text-blue-600 dark:text-blue-400', Icon: CheckCircle2 },
  PREPARING: { label: 'قيد التنفيذ', colorClass: 'text-sky-600 dark:text-sky-400', Icon: Clock },
  READY: { label: 'جاهز', colorClass: 'text-emerald-600 dark:text-emerald-400', Icon: Sparkles },
  OUT_FOR_DELIVERY: { label: 'في الطريق', colorClass: 'text-indigo-600 dark:text-indigo-400', Icon: Truck },
  DELIVERED: { label: 'تم التسليم', colorClass: 'text-emerald-600 dark:text-emerald-400', Icon: CheckCircle2 },
  CANCELLED: { label: 'ملغي', colorClass: 'text-red-600 dark:text-red-400', Icon: XCircle },
};

const TYPE_CFG = {
  PICKUP: { label: 'استلام', Icon: ShoppingBag },
  DELIVERY: { label: 'توصيل', Icon: Bike },
  DINE_IN: { label: 'صالة', Icon: UtensilsCrossed },
};

function PayBadge({ order }) {
  const isPaid = order.paymentStatus === 'PAID';
  const isPartial = order.paymentStatus === 'PARTIAL';

  if (isPaid) {
    return (
      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
        مدفوع
      </span>
    );
  }
  if (isPartial) {
    return (
      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
        دفع جزئي
      </span>
    );
  }
  return (
    <span className="text-xs font-bold text-red-500 dark:text-red-400">
      غير مدفوع
    </span>
  );
}

function getPageNumbers(currentPage, totalPages) {
  if (!totalPages || totalPages <= 1) return [1];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export const PosOrdersTable = ({
  orders = [],
  selectedOrderId,
  onSelectOrder,
  onClearFilters,
  onRefresh,
  isLoading = false,
  isFetching = false,
  pagination = null,
  page = 1,
  limit = 20,
  onPageChange,
  onLimitChange,
}) => {
  const { currency } = useCurrency();

  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.total ?? orders.length;
  const currentLimit = pagination?.limit || limit;
  const fromIndex = totalItems > 0 ? (page - 1) * currentLimit + 1 : 0;
  const toIndex = totalItems > 0 ? Math.min(page * currentLimit, totalItems) : 0;
  const pageNumbers = useMemo(() => getPageNumbers(page, totalPages), [page, totalPages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-4 sm:px-6 py-4">
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    const handleRetry = () => {
      if (onRefresh) onRefresh();
      else if (onClearFilters) onClearFilters();
    };

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center text-zinc-400">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 shadow-2xs">
          <Receipt size={24} />
        </div>
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">لا توجد طلبات</h4>
        <p className="text-xs max-w-sm mb-4 text-zinc-500 dark:text-zinc-400">لا توجد طلبات مطابقة للبحث أو معايير الفلترة المحددة</p>
        <button
          type="button"
          onClick={handleRetry}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          <RotateCcw size={13} className={`shrink-0 ${isFetching ? 'animate-spin' : ''}`} />
          <span>{isFetching ? 'جاري التحميل...' : 'تحديث الطلبات'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden w-full" dir="rtl">
      {/* Table Section (Takes Full Area, Scroll on Rows Only) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-right text-xs border-collapse">
          <thead className="sticky top-0 z-10 border-b font-bold text-[11px] border-zinc-200 dark:border-zinc-800 bg-zinc-100/95 dark:bg-zinc-900/95 backdrop-blur-xs text-zinc-600 dark:text-zinc-400">
            <tr className="h-10">
              <th className="py-0 px-4 sm:px-6">رقم الطلب</th>
              <th className="py-0 px-3 sm:px-4">العميل / الطاولة</th>
              <th className="py-0 px-3 sm:px-4 hidden md:table-cell">النوع</th>
              <th className="py-0 px-3 sm:px-4">حالة الطلب</th>
              <th className="py-0 px-3 sm:px-4">حالة الدفع</th>
              <th className="py-0 px-3 sm:px-4">الإجمالي</th>
              <th className="py-0 px-3 sm:px-4 hidden sm:table-cell">الوقت</th>
              <th className="py-0 px-4 text-center w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/60 bg-transparent">
            {orders.map((o) => {
              const isSel = selectedOrderId === o.id;
              const statusInfo = STATUS_CFG[o.status] || { label: o.status, colorClass: 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800', Icon: Clock };
              const StatusIcon = statusInfo.Icon;
              const typeInfo = TYPE_CFG[o.type] || { label: o.type, Icon: ShoppingBag };
              const TypeIcon = typeInfo.Icon;

              const rawTableVal = o.table ? String(o.table.label || o.table.number || o.table.name || '').trim() : '';
              const tableLabel = rawTableVal ? formatTableLabel(rawTableVal) : '';
              const custName = o.customer?.name || o.customerName || tableLabel || 'عميل مباشر';
              const timeStr = o.createdAt ? new Date(o.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '';
              const total = Number(o.total || o.totalAmount || 0);

              return (
                <tr
                  key={o.id}
                  onClick={() => onSelectOrder(o)}
                  className={`transition-colors cursor-pointer group ${
                    isSel
                      ? 'bg-zinc-100 dark:bg-zinc-900/90 border-r-2 border-zinc-900 dark:border-zinc-100'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
                  }`}
                >
                  {/* Order Number */}
                  <td className="py-3.5 px-4 sm:px-6 font-bold">
                    <span className="bg-zinc-100 text-zinc-800 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800 font-mono text-xs px-2.5 py-1 rounded-lg inline-block font-bold shadow-2xs">
                      #{o.orderNumber || o.id?.slice(0, 6)}
                    </span>
                  </td>

                  {/* Customer / Table */}
                  <td className="py-3.5 px-3 sm:px-4">
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {custName}
                      </span>
                      {o.customer?.phone && (
                        <span className="text-[11px] text-zinc-400 font-medium font-mono mt-0.5" dir="ltr">
                          {o.customer.phone}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-3 sm:px-4 hidden md:table-cell">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      <TypeIcon size={13} className="text-zinc-400 dark:text-zinc-500" />
                      <span>{typeInfo.label}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 sm:px-4">
                    <span className={`text-xs font-bold ${statusInfo.colorClass}`}>
                      {statusInfo.label}
                    </span>
                  </td>

                  {/* Payment Status */}
                  <td className="py-3.5 px-3 sm:px-4">
                    <PayBadge order={o} />
                  </td>

                  {/* Total Amount (Amount on Right, Currency on Left) */}
                  <td className="py-3.5 px-3 sm:px-4">
                    <div className="flex items-baseline gap-1" dir="rtl">
                      <span className="text-sm font-mono font-black text-zinc-900 dark:text-zinc-100">
                        {total.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 font-sans">{currency}</span>
                    </div>
                  </td>

                  {/* Time Column */}
                  <td className="py-3.5 px-3 sm:px-4 hidden sm:table-cell">
                    <span className="text-xs text-zinc-400 font-mono whitespace-nowrap inline-flex items-center gap-1">
                      <Clock size={12} className="text-zinc-400" />
                      <span>{timeStr}</span>
                    </span>
                  </td>

                  {/* Action Arrow */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 group-hover:bg-zinc-200 dark:group-hover:text-zinc-100 dark:group-hover:bg-zinc-800 transition-colors mx-auto">
                      <ChevronLeft size={15} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="h-11 flex items-center justify-between gap-3 px-4 sm:px-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100/95 dark:bg-zinc-900/95 backdrop-blur-xs text-xs shrink-0 select-none">
          {/* Info & Limit Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              <span>عرض</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{fromIndex}</span>
              <span>-</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{toIndex}</span>
              <span>من أصل</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{totalItems}</span>
              <span>طلب</span>
            </div>

            {onLimitChange && (
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />
                <span className="text-[11px] font-medium whitespace-nowrap">لكل صفحة:</span>
                <div className="relative inline-flex items-center">
                  <select
                    value={currentLimit}
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                    disabled={isFetching}
                    className="appearance-none bg-transparent border-0 outline-none p-0 pr-0.5 pl-3.5 text-xs font-black font-mono text-zinc-950 dark:text-zinc-50 cursor-pointer focus:ring-0 focus:outline-none disabled:opacity-50"
                  >
                    <option value={10} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">10</option>
                    <option value={20} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">20</option>
                    <option value={50} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">50</option>
                    <option value={100} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">100</option>
                  </select>
                  <ChevronDown size={11} className="absolute left-0 pointer-events-none text-zinc-700 dark:text-zinc-300" />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls (Always visible) */}
          <div className="flex items-center gap-1.5">
            {/* Previous */}
            <button
              type="button"
              disabled={page <= 1 || isFetching}
              onClick={() => onPageChange?.(page - 1)}
              className="h-7 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors inline-flex items-center gap-1 shadow-2xs"
              title="الصفحة السابقة"
            >
              <ChevronRight size={13} />
              <span>السابق</span>
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((p, idx) => {
                if (p === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-1.5 text-zinc-400 dark:text-zinc-600 font-bold">
                      ...
                    </span>
                  );
                }
                const isCurrent = p === page;
                return (
                  <button
                    key={`page-${p}`}
                    type="button"
                    disabled={isFetching || (totalPages <= 1 && isCurrent)}
                    onClick={() => onPageChange?.(p)}
                    className={`min-w-7 h-7 px-2 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                        : 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-2xs'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Next */}
            <button
              type="button"
              disabled={page >= totalPages || isFetching}
              onClick={() => onPageChange?.(page + 1)}
              className="h-7 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors inline-flex items-center gap-1 shadow-2xs"
              title="الصفحة التالية"
            >
              <span>التالي</span>
              <ChevronLeft size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosOrdersTable;
