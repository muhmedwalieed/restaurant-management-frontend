import React from 'react';
import {
  Clock,
  Printer,
  Bell,
  Plus,
  Receipt,
  UtensilsCrossed,
} from 'lucide-react';
import { ALERT_CONFIG } from '../../../tables/hooks/useTableGridState.js';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';

export const WaiterActiveSessionView = ({
  table,
  onDismissCall,
  onOpenReviewModal,
  onOpenAddItemDrawer,
  onOpenBillModal,
  onCloseSession,
  onPrintPin,
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Session Meta Info Card */}
        <div className="p-3 rounded-xl border space-y-2.5" style={{ background: 'var(--s2)', borderColor: 'var(--bd)' }}>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1" style={{ color: 'var(--t3)' }}>
              <Clock size={12} />
              <span>فُتحت: {session.openedAt}</span>
            </span>

            {session.pin && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]" style={{ color: 'var(--t3)' }}>PIN:</span>
                <span className="mono font-bold text-xs px-1.5 py-0.5 rounded bg-white/5 border border-white/10" style={{ color: 'var(--ac)' }}>
                  {session.pin}
                </span>
                <button
                  type="button"
                  onClick={() => onPrintPin(table, session.pin)}
                  className="p-1 rounded hover:bg-white/10 text-xs text-slate-300"
                  title="طباعة تذكرة PIN"
                >
                  <Printer size={12} />
                </button>
              </div>
            )}
          </div>
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
                  <div className="flex items-center gap-2 font-bold" style={{ color: cfg.color }}>
                    <Bell size={14} className="animate-bounce" />
                    <span>العميل {cfg.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDismissCall(session.dbSessionId, alertKey)}
                    className="px-2 py-1 rounded-lg text-[11px] font-bold bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
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
              className="w-full py-1.5 rounded-lg font-bold text-xs text-white shadow-sm transition-all active:scale-98 cursor-pointer"
              style={{ background: 'var(--ac)' }}
            >
              مراجعة وتأكيد الطلب
            </button>
          </div>
        )}

        {/* Ordered Items List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--t2)' }}>
            <span>الأصناف المطلوبة</span>
            <span className="mono">{items.reduce((s, i) => s + i.qty, 0)} صنف</span>
          </div>

          {items.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: 'var(--t3)' }}>
              لم يتم طلب أصناف بعد في هذه الجلسة.
            </p>
          ) : (
            <div className="space-y-1.5">
              {items.map((it, idx) => (
                <div
                  key={`${it.id || it.productId}_${idx}`}
                  className="p-2.5 rounded-lg border flex items-center justify-between text-xs"
                  style={{ background: 'var(--s2)', borderColor: 'var(--bd)' }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-xs" style={{ color: 'var(--ac)' }}>
                      {it.qty}×
                    </span>
                    <span className="font-medium truncate" style={{ color: 'var(--t1)' }}>
                      {it.name}
                    </span>
                  </div>
                  <span className="mono font-semibold shrink-0" style={{ color: 'var(--t1)' }}>
                    {(it.qty * it.price).toFixed(2)} ج
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions & Bill Summary */}
      <div className="p-4 border-t space-y-3 shrink-0" style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}>
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
            className="py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors hover:bg-white/5 cursor-pointer"
            style={{ borderColor: 'var(--bd)', color: 'var(--t1)' }}
          >
            <Plus size={14} />
            <span>إضافة صنف</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenBillModal(table)}
            className="py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors hover:bg-white/5 cursor-pointer"
            style={{ borderColor: 'var(--bd)', color: 'var(--t1)' }}
          >
            <Receipt size={14} />
            <span>طباعة الشيك</span>
          </button>
        </div>

        <button
          type="button"
          disabled={isClosingSession}
          onClick={() => onCloseSession(table)}
          className="w-full py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
          style={{ background: 'var(--ok)' }}
        >
          {isClosingSession ? 'جاري إغلاق الجلسة...' : 'إنهاء وحساب الطاولة'}
        </button>
      </div>
    </div>
  );
};
