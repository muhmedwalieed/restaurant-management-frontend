import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusPill } from '../../../../shared/components/StatusPill.jsx';
import { LoadingSkeleton } from '../../../../shared/components/LoadingSkeleton.jsx';
import { ORDER_STATUS_LABELS, orderStatusPill } from '../../../orders/schemas/order.schema.js';
import { ReceiptText } from 'lucide-react';

const formatArabicOrderDate = (dateString) => {
  if (!dateString) return 'غير محدد';
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `اليوم، ${timeStr}`;
  if (isYesterday) return `أمس، ${timeStr}`;
  return `${date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'numeric', year: 'numeric' })}، ${timeStr}`;
};

export const CustomerOrdersHistoryTable = ({
  ordersResponse,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const orders = ordersResponse?.items || [];
  const totalCount = ordersResponse?.pagination?.total || orders.length;

  return (
    <div className="bg-bg-surface border border-border-default rounded-lg p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border-default pb-3">
        <div className="flex items-center gap-2">
          <ReceiptText className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-bold text-txt-primary">سجل الطلبات</h3>
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-bg-surface-elevated text-txt-muted border border-border-subtle">
            {totalCount}
          </span>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton height={180} className="w-full" />
      ) : orders.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <ReceiptText className="w-8 h-8 text-txt-muted mx-auto opacity-50" />
          <p className="text-sm font-bold text-txt-primary">لا توجد طلبات سابقة لهذا العميل</p>
          <p className="text-xs text-txt-muted">عند إنشاء طلب جديد للكاشير أو الواتساب سيظهر هنا فوراً.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-bg-base border-b border-border-default text-txt-muted font-bold">
              <tr>
                <th className="p-3">رقم الطلب</th>
                <th className="p-3">التاريخ والوقت</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">الفرع</th>
                <th className="p-3">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                >
                  <td className="p-3 font-mono font-bold text-brand-primary group-hover:underline">
                    #{order.orderNumber}
                  </td>
                  <td className="p-3 text-txt-muted">
                    {formatArabicOrderDate(order.createdAt)}
                  </td>
                  <td className="p-3">
                    <StatusPill status={orderStatusPill(order.status)}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </StatusPill>
                  </td>
                  <td className="p-3 text-xs text-slate-400 truncate max-w-[140px]">
                    {order.branch?.name || 'غير محدد'}
                  </td>
                  <td className="p-3 font-mono font-bold tabular-nums text-txt-primary">
                    {Number(order.total || 0).toFixed(2)} EGP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
