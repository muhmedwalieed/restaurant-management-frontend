import { useState } from 'react';
import { Receipt, ChevronDown, Users, Utensils } from 'lucide-react';

const ORDER_STATUS = {
  AWAITING_CONFIRMATION: { label: 'قيد المراجعة', cls: 'bg-status-warning/10 text-status-warning border-status-warning/30' },
  CONFIRMED: { label: 'تم التأكيد', cls: 'bg-status-success/10 text-status-success border-status-success/30' },
  CANCELLED: { label: 'ملغي', cls: 'bg-bg-surface-elevated text-txt-muted border-border-subtle' },
};

export const SessionOrdersList = ({ orders = [], currency = 'EGP' }) => {
  const [expandedOrder, setExpandedOrder] = useState(() => (orders.length > 0 ? orders[orders.length - 1].id : null));
  const [activeMember, setActiveMember] = useState(null);

  if (!orders || orders.length === 0) return null;

  const memberMap = new Map();
  for (const order of orders) {
    for (const m of order.byMember || []) {
      if (!memberMap.has(m.name)) memberMap.set(m.name, new Map());
      const items = memberMap.get(m.name);
      for (const it of m.items || []) {
        const key = it.productName;
        if (items.has(key)) {
          const ex = items.get(key);
          ex.quantity += it.quantity || 1;
          ex.total += it.total || 0;
        } else {
          items.set(key, {
            productName: it.productName,
            quantity: it.quantity || 1,
            unitPrice: it.unitPrice || 0,
            total: it.total || 0,
          });
        }
      }
    }
  }
  const members = Array.from(memberMap.entries()).map(([name, items]) => ({
    name,
    items: Array.from(items.values()),
    subtotal: Array.from(items.values()).reduce((acc, i) => acc + i.total, 0),
  }));
  const selectedMember = activeMember
    ? members.find((m) => m.name === activeMember)
    : members[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Receipt className="w-4 h-4 text-brand-primary" />
        <h4 className="text-xs font-bold text-txt-primary">أوردراتك في الجلسة</h4>
      </div>

      {}
      {members.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-txt-muted flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            حساب كل شخص
          </p>
          <div className="flex flex-wrap gap-1.5">
            {members.map((m) => (
              <button
                key={m.name}
                type="button"
                onClick={() => setActiveMember(m.name)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                  selectedMember?.name === m.name
                    ? 'bg-brand-primary text-slate-950 border-brand-primary'
                    : 'bg-bg-surface border-border-default text-txt-muted hover:text-txt-primary'
                }`}
              >
                {m.name}
                <span className="font-mono" dir="ltr"> · {m.subtotal.toFixed(2)}</span>
              </button>
            ))}
          </div>

          {}
          {selectedMember && (
            <div className="p-3 rounded-xl bg-bg-base/60 border border-border-subtle space-y-1.5">
              <p className="text-[11px] font-semibold text-brand-primary flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5" />
                {selectedMember.name} طلب:
              </p>
              {selectedMember.items.map((it) => (
                <div key={it.productName} className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-txt-primary truncate">{it.productName}</p>
                    <p className="text-[10px] text-txt-muted" dir="ltr">
                      {it.quantity} × {it.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-txt-primary shrink-0" dir="ltr">
                    {it.total.toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border-subtle">
                <span className="font-semibold text-txt-muted">إجمالي {selectedMember.name}:</span>
                <span className="font-mono font-bold text-brand-primary" dir="ltr">
                  {selectedMember.subtotal.toFixed(2)} {currency}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {}
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-txt-muted">الأوردرات</p>
        {orders.map((order) => {
          const status = ORDER_STATUS[order.status] || ORDER_STATUS.CANCELLED;
          const isOpen = expandedOrder === order.id;
          return (
            <div key={order.id} className="bg-bg-base/40 border border-border-subtle rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedOrder(isOpen ? null : order.id)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-txt-primary shrink-0">أوردر #{order.orderNumber}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.cls}`}>{status.label}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-txt-primary" dir="ltr">
                    {Number(order.total || 0).toFixed(2)} {currency}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-txt-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isOpen && (
                <div className="px-3 pb-3 pt-1 space-y-2.5">
                  <div className="space-y-1.5">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                        <div className="min-w-0">
                          <p className="font-semibold text-txt-primary truncate">{item.productName}</p>
                          <p className="text-[10px] text-txt-muted">
                            {item.quantity} × {Number(item.unitPrice).toFixed(2)} — {item.addedByName || 'عميل'}
                          </p>
                        </div>
                        <span className="font-mono font-bold text-txt-primary shrink-0" dir="ltr">
                          {Number(item.total || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {(order.byMember || []).length > 1 && (
                    <div className="pt-2 border-t border-border-subtle space-y-1">
                      <p className="text-[10px] font-semibold text-txt-muted">توزيع الحساب:</p>
                      {order.byMember.map((m) => (
                        <div key={m.name} className="flex items-center justify-between text-[11px]">
                          <span className="text-txt-primary">{m.name}</span>
                          <span className="font-mono font-bold" dir="ltr">
                            {Number(m.subtotal || 0).toFixed(2)} {currency}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SessionOrdersList;
