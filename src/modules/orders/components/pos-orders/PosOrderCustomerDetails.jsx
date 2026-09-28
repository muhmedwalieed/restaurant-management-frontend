import React from 'react';
import { User, Phone, MapPin } from 'lucide-react';

export const PosOrderCustomerDetails = ({ order }) => {
  if (!order) return null;

  return (
    <div className="p-3 rounded-xl border space-y-1.5 text-xs" style={{ background: 'var(--s2)', borderColor: 'var(--bd)' }}>
      <div className="flex items-center gap-2" style={{ color: 'var(--t1)' }}>
        <User size={13} className="text-slate-400 shrink-0" />
        <span className="font-semibold">
          {order.customer?.name || order.customerName || 'عميل مباشر'}
        </span>
      </div>

      {(order.customer?.phone || order.customerPhone) && (
        <div className="flex items-center gap-2 text-slate-300 mono">
          <Phone size={13} className="text-slate-400 shrink-0" />
          <span>{order.customer?.phone || order.customerPhone}</span>
        </div>
      )}

      {order.deliveryAddress && (
        <div className="flex items-start gap-2 text-slate-300">
          <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
          <span>{order.deliveryAddress}</span>
        </div>
      )}

      {order.table && (
        <div className="text-[11px] font-bold text-amber-400">
          طاولة {order.table.label || order.table.number || order.table.name}
        </div>
      )}
    </div>
  );
};
