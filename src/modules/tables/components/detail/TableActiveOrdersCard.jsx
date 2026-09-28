import React from 'react';
import { Button } from '../../../../shared/components/Button.jsx';
import { StatusPill } from '../../../../shared/components/StatusPill.jsx';
import { LoadingSkeleton } from '../../../../shared/components/LoadingSkeleton.jsx';
import { ORDER_STATUS_LABELS, orderStatusPill } from '../../hooks/useTableOrders.js';
import { Receipt } from 'lucide-react';

const formatSmartRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  const diffMin = Math.floor(diffSec / 60);

  if (diffSec < 60) return 'الآن';
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  if (diffMin < 120) return 'منذ ساعة';

  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (isToday) return `اليوم، ${timeStr}`;
  return `${date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}، ${timeStr}`;
};

export const TableActiveOrdersCard = ({
  activeOrders = [],
  isLoading = false,
  isError = false,
  onRetry,
}) => {
  if (!activeOrders || activeOrders.length === 0) return null;

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-brand-primary" />
          <h3 className="text-xs font-bold text-txt-primary">الطلبات النشطة الحالية</h3>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
          مشغولة • {activeOrders.length} طلب نشط
        </span>
      </div>

      {isLoading ? (
        <LoadingSkeleton height={100} className="w-full" />
      ) : isError ? (
        <div className="p-4 bg-status-danger/10 border border-status-danger/30 rounded-lg text-xs text-status-danger text-center">
          تعذر جلب طلبات الطاولة.
          {onRetry && (
            <Button size="sm" variant="outline" className="mr-2" onClick={onRetry}>
              إعادة المحاولة
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-right text-xs">
            <thead className="bg-bg-base/60 border-b border-border-subtle text-txt-muted font-bold">
              <tr>
                <th className="p-2.5">رقم الطلب</th>
                <th className="p-2.5">الحالة</th>
                <th className="p-2.5">الأصناف</th>
                <th className="p-2.5">المبلغ</th>
                <th className="p-2.5">الوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {activeOrders.map((order) => {
                const itemCount = (order.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
                const itemsSummary = (order.items || [])
                  .map((i) => `${i.product?.name || i.productName || 'صنف'} (${i.quantity}×)`)
                  .join('، ');

                return (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-2.5 font-mono font-bold text-txt-primary">
                      #{order.orderNumber || order.id?.slice(-4)}
                    </td>
                    <td className="p-2.5">
                      <StatusPill status={orderStatusPill(order.status)}>
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </StatusPill>
                    </td>
                    <td className="p-2.5 max-w-[200px]">
                      <span className="truncate block text-txt-muted" title={itemsSummary}>
                        {itemCount} أصناف ({itemsSummary})
                      </span>
                    </td>
                    <td className="p-2.5 font-mono font-bold text-txt-primary">
                      {Number(order.total || 0).toFixed(2)} EGP
                    </td>
                    <td className="p-2.5 text-txt-muted">
                      {formatSmartRelativeTime(order.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
