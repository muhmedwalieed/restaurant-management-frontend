import { useState } from 'react';
import { Receipt, ChevronDown, Users } from 'lucide-react';

const ORDER_STATUS = {
  AWAITING_CONFIRMATION: { label: 'قيد المراجعة', cls: 'bg-status-warning/10 text-status-warning border-status-warning/30' },
  CONFIRMED: { label: 'تم التأكيد', cls: 'bg-status-success/10 text-status-success border-status-success/30' },
  CANCELLED: { label: 'ملغي', cls: 'bg-bg-surface-elevated text-txt-muted border-border-subtle' },
};

/**
 * Shows every order round of a table session + each member's share (bill).
 * Used on the customer page (cart drawer + desktop sidebar).
 */
export const SessionOrdersList = ({ orders = [], currency = 'EGP' }) => {
  const [expanded, setExpanded] = useState(() => (orders.length > 0 ? orders[orders.length - 1].id : null));

  if (!orders || orders.length === 0) return null;

  // Per-member bill aggregated across all rounds.
  const memberTotals = {};
  for (const order of orders) {
    for (const m of order.byMember || []) {
      memberTotals[m.name] = (memberTotals[m.name] || 0) + (m.subtotal || 0);
    }
  }
  const members = Object.entries(memberTotals);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Receipt className="w-4 h-4 text-brand-primary" />
        <h4 className="text-xs font-bold text-txt-primary">أوردراتك في الجلسة</h4>
      </div>

      {/* Per-member bill */}
      {members.length > 0 && (
        <div className="p-3 rounded-xl bg-bg-base/60 border border-border-subtle space-y-1.5">
          <p className="text-[11px] font-semibold text-txt-muted flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            حساب كل شخص
          </p>
          {members.map(([name, subtotal]) => (
            <div key={name} className="flex items-center justify-between text-xs">
              <span className="font-semibold text-txt-primary">{name}</span>
              <span className="font-mono font-bold text-brand-primary" dir="ltr">
                {subtotal.toFixed(2)} {currency}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Order rounds */}
      {orders.map((order) => {
        const status = ORDER_STATUS[order.status] || ORDER_STATUS.CANCELLED;
        const isOpen = expanded === order.id;
        return (
          <div key={order.id} className="bg-bg-base/40 border border-border-subtle rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : order.id)}
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
  );
};

export default SessionOrdersList;