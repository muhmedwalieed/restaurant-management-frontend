import React from 'react';
import {
  X,
  UtensilsCrossed,
  Clock,
  Receipt,
  Bell,
  Plus,
  QrCode,
} from 'lucide-react';
import { ALERT_CONFIG } from '../../../tables/hooks/useTableGridState.js';
import { formatTableLabel } from '../../../tables/utils/tableLabel.js';
import { TableOrdersBreakdown } from '../TableOrdersBreakdown.jsx';
import { TablePinReveal } from '../TablePinReveal.jsx';

export const PosTableSidebarDrawer = ({
  table,
  onClose,
  onPrintPin,
  onPrintBill,
  onSelectTableForOrder,
  onDismissCall,
  onOpenBillModal,
  onCloseSession,
  onShowQr,
  isClosingSession = false,
  currency = 'ج.م',
}) => {
  if (!table) return null;

  const session = table.session;
  const items = session?.items || [];
  const alerts = session?.alerts || [];

  return (
    <>
      {/* Below `sm` the drawer overlays the grid with a scrim */}
      <div
        className="fixed inset-0 z-30 bg-black/50 sm:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed inset-y-0 left-0 z-40 w-full max-w-sm shrink-0 flex flex-col overflow-hidden border-r h-full sm:static sm:z-auto sm:w-80"
        style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}
      >
        {/* Panel Header */}
        <div
          className="flex items-center justify-between px-4 h-14 shrink-0 border-b"
          style={{ borderColor: 'var(--bd)' }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>
              {formatTableLabel(table.displayNum)}
            </p>
            <p className="text-xs" style={{ color: 'var(--t3)' }}>
              {table.capacity} كراسي {table.section ? `— قسم ${table.section}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {onShowQr && (
              <button
                type="button"
                onClick={() => onShowQr(table)}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                style={{ color: 'var(--t3)' }}
                title="عرض رمز QR للطاولة"
              >
                <QrCode size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              style={{ color: 'var(--t3)' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body: Available vs Occupied */}
        {table.status === 'available' ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 p-6 text-center">
            <div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 border"
                style={{ background: 'var(--ok-bg)', borderColor: 'rgba(22,163,74,.2)' }}
              >
                <UtensilsCrossed size={22} style={{ color: 'var(--ok)' }} />
              </div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{formatTableLabel(table.displayNum)} متاحة</p>
              <p className="text-xs mt-1 text-zinc-500 dark:text-zinc-400">
                اضغط لإنشاء طلب صالة جديد وبدء الجلسة لهذه الطاولة
              </p>
            </div>

            {onSelectTableForOrder && (
              <button
                type="button"
                onClick={() => onSelectTableForOrder(table)}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-md active:scale-95 cursor-pointer bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/20"
              >
                إنشاء طلب صالة لهذه الطاولة
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 custom-scrollbar">
              {/* Session meta — divider only, no container */}
              <div
                className="flex items-center justify-between gap-2 pb-3 border-b text-xs"
                style={{ borderColor: 'var(--bd)' }}
              >
                <span className="flex items-center gap-1 shrink-0 font-medium" style={{ color: 'var(--t3)' }}>
                  <Clock size={12} />
                  <span>فُتحت: {session?.openedAt}</span>
                </span>

                <TablePinReveal table={table} session={session} onPrintPin={onPrintPin} />
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
                        className="p-3 rounded-xl border flex items-center justify-between gap-2 text-xs shadow-sm"
                        style={{ background: cfg.bg, borderColor: cfg.border }}
                      >
                        <div className="flex items-center gap-2 font-bold" style={{ color: cfg.color }}>
                          <Bell size={14} className="animate-pulse" />
                          <span>العميل {cfg.label}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDismissCall(session?.dbSessionId, alertKey)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-colors cursor-pointer"
                          style={{ color: cfg.color }}
                        >
                          تم الحضور
                        </button>
                      </div>
                    );
                  })}
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

            {/* Footer Actions & Bill Summary — identical to Waiter */}
            <div className="p-3 sm:p-4 border-t space-y-3 shrink-0" style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: 'var(--t2)' }}>الإجمالي الكلي:</span>
                <span className="mono text-lg font-bold" style={{ color: 'var(--t1)' }}>
                  {Number(session?.total || 0).toFixed(2)}{' '}
                  <span className="text-xs font-normal" style={{ color: 'var(--t3)' }}>{currency}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {onSelectTableForOrder && (
                  <button
                    type="button"
                    onClick={() => onSelectTableForOrder(table)}
                    className="py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    style={{ borderColor: 'var(--bd)', color: 'var(--t1)' }}
                  >
                    <Plus size={14} />
                    <span>إضافة صنف</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onOpenBillModal?.(table)}
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
                onClick={() => onCloseSession?.(table)}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/20"
              >
                {isClosingSession ? 'جاري إغلاق الجلسة...' : 'إنهاء وحساب الطاولة'}
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default PosTableSidebarDrawer;
