import React from 'react';
import {
  X,
  Printer,
  UtensilsCrossed,
  Clock,
  Receipt,
  Bell,
  Plus,
} from 'lucide-react';

export const PosTableSidebarDrawer = ({
  table,
  onClose,
  onPrintPin,
  onPrintBill,
  onSelectTableForOrder,
  onDismissCall,
  onSettleAndClose,
  isClosingSession = false,
  currency = 'ج.م',
}) => {
  if (!table) return null;

  return (
    <aside
      className="w-full sm:w-80 shrink-0 flex flex-col border-r overflow-hidden select-none h-full"
      style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}
    >
      <div className="p-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--bd)' }}>
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--t1)' }}>
            طاولة {table.displayNum}
          </h3>
          <span className="text-[11px]" style={{ color: 'var(--t3)' }}>
            {table.capacity} كراسي {table.section ? `— ${table.section}` : ''}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {table.status === 'occupied' && table.session ? (
          <>
            {/* Meta Card */}
            <div className="p-3 rounded-xl border space-y-2 text-xs" style={{ background: 'var(--s2)', borderColor: 'var(--bd)' }}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock size={12} />
                  <span>{table.session.openedAt}</span>
                </span>

                {table.session.pin && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">PIN:</span>
                    <span className="mono font-bold text-xs" style={{ color: 'var(--ac)' }}>
                      {table.session.pin}
                    </span>
                    <button
                      type="button"
                      onClick={() => onPrintPin(table, table.session.pin)}
                      className="p-0.5 rounded text-slate-400 hover:text-white cursor-pointer"
                      title="طباعة إيصال PIN"
                    >
                      <Printer size={11} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Alerts Box */}
            {table.session.alerts?.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <Bell size={14} className="animate-bounce" />
                  <span>تنبيه نداء من الطاولة</span>
                </div>
                <button
                  type="button"
                  onClick={() => onDismissCall(table.session.dbSessionId, 'HELP')}
                  className="w-full py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء التنبيه
                </button>
              </div>
            )}

            {/* Items */}
            <div className="space-y-2">
              <span className="text-xs font-bold" style={{ color: 'var(--t2)' }}>الأصناف الحالية</span>
              <div className="space-y-1.5">
                {table.session.items?.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border text-xs flex items-center justify-between"
                    style={{ background: 'var(--s2)', borderColor: 'var(--bd)' }}
                  >
                    <span style={{ color: 'var(--t1)' }}>{it.qty}× {it.name}</span>
                    <span className="mono font-bold" style={{ color: 'var(--t1)' }}>
                      {(it.qty * it.price).toFixed(2)} {currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="p-3 rounded-xl border flex items-center justify-between text-xs font-bold" style={{ background: 'var(--s2)', borderColor: 'var(--bd)' }}>
              <span style={{ color: 'var(--t2)' }}>الإجمالي:</span>
              <span className="mono text-base" style={{ color: 'var(--ac)' }}>
                {Number(table.session.total || 0).toFixed(2)} {currency}
              </span>
            </div>
          </>
        ) : (
          <div className="py-12 text-center space-y-3">
            <UtensilsCrossed size={32} className="text-slate-600 mx-auto" />
            <p className="text-xs font-semibold" style={{ color: 'var(--t2)' }}>الطاولة متاحة وجاهزة</p>
            {onSelectTableForOrder && (
              <button
                type="button"
                onClick={() => onSelectTableForOrder(table)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                style={{ background: 'var(--ac)' }}
              >
                <Plus size={14} />
                <span>إنشاء طلب صالة لهذه الطاولة</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      {table.status === 'occupied' && (
        <div className="p-4 border-t space-y-2 shrink-0" style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onPrintBill(table)}
              className="py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 text-slate-200 hover:bg-white/5 cursor-pointer"
              style={{ borderColor: 'var(--bd)' }}
            >
              <Receipt size={14} />
              <span>طباعة الشيك</span>
            </button>
            {onSelectTableForOrder && (
              <button
                type="button"
                onClick={() => onSelectTableForOrder(table)}
                className="py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 text-slate-200 hover:bg-white/5 cursor-pointer"
                style={{ borderColor: 'var(--bd)' }}
              >
                <Plus size={14} />
                <span>إضافة طلب</span>
              </button>
            )}
          </div>

          <button
            type="button"
            disabled={isClosingSession}
            onClick={() => onSettleAndClose(table)}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            style={{ background: 'var(--ok)' }}
          >
            {isClosingSession ? 'جاري الإغلاق...' : 'تحصيل وإغلاق الطاولة'}
          </button>
        </div>
      )}
    </aside>
  );
};
