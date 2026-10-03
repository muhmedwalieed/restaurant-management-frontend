import React from 'react';
import {
  Clock,
  Bell,
  Plus,
  Receipt,
  UtensilsCrossed,
} from 'lucide-react';
import { ALERT_CONFIG } from '../../../tables/hooks/useTableGridState.js';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { TableOrdersBreakdown } from '../TableOrdersBreakdown.jsx';
import { TablePinReveal } from '../TablePinReveal.jsx';

export const WaiterActiveSessionView = ({
  table,
  onDismissCall,
  onOpenReviewModal,
  onOpenAddItemDrawer,
  onOpenBillModal,
  onCloseSession,
  isClosingSession,
}) => {
  const { currency } = useCurrency();
  const session = table.session;
  const items = session?.items || [];
  const reviewItems = session?.reviewItems || [];
  const total = session?.total || 0;
  const alerts = session?.alerts || [];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 custom-scrollbar">
        {/* Session meta — divider only, no container */}
        <div
          className="flex items-center justify-between gap-2 pb-3 border-b text-xs"
          style={{ borderColor: 'var(--bd)' }}
        >
          <span className="flex items-center gap-1 shrink-0" style={{ color: 'var(--t3)' }}>
            <Clock size={12} />
            <span>فُتحت: {session.openedAt}</span>
          </span>

          <TablePinReveal table={table} session={session} />
        </div>

        {/* Live Waiter Calls Alert Box */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alertKey) => {
              const cfg = ALERT_CONFIG[alertKey];
              if (!cfg) return null;
              return (
                <div
                  key={alertKey}
                  className="p-3 rounded-xl border flex items-center justify-between gap-2 text-xs"
                  style={{ background: cfg.bg, borderColor: cfg.border }}
                >
                  <div className="flex items-center gap-2 font-bold min-w-0" style={{ color: cfg.color }}>
                    <Bell size={14} className="animate-pulse shrink-0" />
                    <span className="truncate">العميل {cfg.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDismissCall(session.dbSessionId, alertKey)}
                    className="px-2 py-1 rounded-lg text-[11px] font-bold bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-colors cursor-pointer shrink-0"
                    style={{ color: cfg.color }}
                  >
                    تم الحضور
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Review Pending Customer QR Orders */}
        {reviewItems.length > 0 && (
          <div
            className="p-3 rounded-xl border space-y-2 text-xs"
            style={{ background: 'var(--ac-bg)', borderColor: 'rgba(15,23,42,.15)' }}
          >
            <div className="flex items-center justify-between font-bold" style={{ color: 'var(--ac)' }}>
              <div className="flex items-center gap-1.5">
                <UtensilsCrossed size={14} />
                <span>طلبات QR جديدة بانتظار التأكيد ({reviewItems.length})</span>
              </div>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--t2)' }}>
              قام العميل باختيار أصناف عبر هاتفه، يرجى مراجعتها وتأكيدها للمطبخ.
            </p>
            <button
              type="button"
              onClick={() => onOpenReviewModal(table)}
              className="w-full py-2 rounded-lg font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all active:scale-98 cursor-pointer border border-emerald-500/20"
            >
              مراجعة وتأكيد الطلب
            </button>
          </div>
        )}

        {/* Ordered items, grouped per order */}
        <TableOrdersBreakdown
          orderGroups={session?.orderGroups || []}
          ordersCount={session?.ordersCount || 0}
          itemsCount={items.reduce((s, i) => s + i.qty, 0)}
          currency={currency}
          emptyText="لم يتم طلب أصناف بعد في هذه الجلسة."
        />
      </div>

      {/* Footer Actions & Bill Summary */}
      <div className="p-3 sm:p-4 border-t space-y-3 shrink-0" style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color: 'var(--t2)' }}>الإجمالي الكلي:</span>
          <span className="mono text-lg font-bold" style={{ color: 'var(--t1)' }}>
            {total.toFixed(2)} <span className="text-xs font-normal" style={{ color: 'var(--t3)' }}>{currency}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onOpenAddItemDrawer(table)}
            className="py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            style={{ borderColor: 'var(--bd)', color: 'var(--t1)' }}
          >
            <Plus size={14} />
            <span>إضافة صنف</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenBillModal(table)}
            className="py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            style={{ borderColor: 'var(--bd)', color: 'var(--t1)' }}
          >
            <Receipt size={14} />
            <span>عرض الحساب</span>
          </button>
        </div>

        <button
          type="button"
          disabled={isClosingSession}
          onClick={() => onCloseSession(table)}
          className="w-full py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/20"
        >
          {isClosingSession ? 'جاري إغلاق الجلسة...' : 'إنهاء وحساب الطاولة'}
        </button>
      </div>
    </div>
  );
};
