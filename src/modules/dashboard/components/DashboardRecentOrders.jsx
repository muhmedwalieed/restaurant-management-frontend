import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft } from 'lucide-react';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { ORDER_STATUS_LABELS, ORDER_TYPE_LABELS, orderStatusPill } from '../../orders/schemas/order.schema.js';
import { formatMoney } from './DashboardStatsCards.jsx';

const TYPE_BADGES = {
  DINE_IN: { label: 'صالة' },
  TAKEAWAY: { label: 'استلام' },
  DELIVERY: { label: 'توصيل' },
  DRIVE_THRU: { label: 'استلام' },
};

export const DashboardRecentOrders = ({ isLoading, recentOrders = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="lg:col-span-7 bg-bg-surface border border-border-default rounded-lg p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border-default pb-3">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-txt-primary">أحدث الطلبات المباشرة</h2>
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-bg-surface-elevated text-txt-muted border border-border-subtle">
            {recentOrders.length}
          </span>
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="text-xs text-brand-primary hover:underline font-bold flex items-center gap-1 transition-colors"
        >
          <span>عرض كل الطلبات</span>
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton height={150} />
      ) : recentOrders.length === 0 ? (
        <div className="py-8 text-center space-y-1">
          <Clock className="w-6 h-6 text-txt-muted mx-auto opacity-50" />
          <p className="text-xs font-bold text-txt-primary">لا توجد طلبات حديثة اليوم</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-bg-base border-b border-border-default text-txt-muted font-bold">
              <tr>
                <th className="p-3">رقم الطلب</th>
                <th className="p-3">العميل / النوع</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 text-left">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {recentOrders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => navigate(`/orders/${o.id}`)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                >
                  <td className="p-3 font-mono font-bold text-brand-primary group-hover:underline">
                    #{o.orderNumber}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col text-xs leading-snug">
                      <span className="font-medium text-slate-100">
                        {o.customer?.name || (o.table ? `طاولة ${o.table.label}` : 'عميل مباشر')}
                      </span>
                      <span className="text-[11px] text-txt-muted">
                        {TYPE_BADGES[o.type]?.label || ORDER_TYPE_LABELS[o.type] || o.type}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <StatusPill status={orderStatusPill(o.status)}>
                      {ORDER_STATUS_LABELS[o.status] || o.status}
                    </StatusPill>
                  </td>
                  <td className="p-3 font-mono font-bold tabular-nums text-left text-txt-primary">
                    {formatMoney(o.total)}
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
