import React from 'react';
import { StatusPill } from '../../../../shared/components/StatusPill.jsx';

const ORDER_STATUS_LABEL = {
  AWAITING_CONFIRMATION: { pill: 'warning', label: 'قيد المراجعة' },
  CONFIRMED: { pill: 'success', label: 'مؤكد' },
  CANCELLED: { pill: 'neutral', label: 'ملغي' },
};

export const TableSessionOrdersHistory = ({ historyOrders = [] }) => {
  if (historyOrders.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold text-txt-muted">طلبات الجلسة السابقة</p>
      {historyOrders.map((order) => {
        const st = ORDER_STATUS_LABEL[order.status] || ORDER_STATUS_LABEL.CANCELLED;
        return (
          <div
            key={order.id}
            className="flex items-center justify-between gap-2 bg-bg-base/40 border border-border-subtle rounded-lg px-3 py-2 text-xs"
          >
            <span className="font-semibold text-txt-primary">طلب #{order.orderNumber}</span>
            <div className="flex items-center gap-2">
              <StatusPill status={st.pill}>{st.label}</StatusPill>
              <span className="font-mono font-bold text-txt-primary" dir="ltr">
                {Number(order.total || 0).toFixed(2)}
              </span>
              {order.orderId && <span className="text-[10px] text-txt-muted">#{order.orderId.slice(-4)}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
