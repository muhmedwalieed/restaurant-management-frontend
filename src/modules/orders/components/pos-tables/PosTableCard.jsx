import React from 'react';
import { Users, QrCode } from 'lucide-react';

export const PosTableCard = ({
  table,
  isSelected,
  onSelect,
  onShowQr,
}) => {
  const occ = table.status === 'occupied';
  const hasAlert = table.session?.alerts?.length > 0;
  const total = table.session?.total || 0;

  return (
    <div
      onClick={() => onSelect(table)}
      className="p-3.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer select-none text-right group relative"
      style={{
        background: occ ? 'var(--s2)' : 'var(--s1)',
        borderColor: isSelected ? 'var(--ac)' : hasAlert ? 'var(--warn)' : 'var(--bd)',
        minHeight: 125,
      }}
    >
      {/* Top row: Status, Table Number, QR shortcut */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: occ ? 'var(--ac-bg)' : 'var(--ok-bg)',
              color: occ ? 'var(--ac)' : 'var(--ok)',
            }}
          >
            {occ ? 'مشغولة' : 'متاحة'}
          </span>

          {hasAlert && (
            <span className="w-2 h-2 rounded-full bg-status-warning animate-pulse" />
          )}
        </div>

        <div className="flex items-center gap-2">
          {table.qrToken && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShowQr(table);
              }}
              className="p-1 rounded text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated transition-colors"
              title="عرض كود QR للطاولة"
            >
              <QrCode size={14} />
            </button>
          )}

          <span className="mono font-bold text-xl" style={{ color: 'var(--t1)' }}>
            {table.displayNum}
          </span>
        </div>
      </div>

      {/* Middle row: Capacity */}
      <div className="flex items-center gap-1.5 text-xs text-txt-muted">
        <Users size={12} />
        <span>{table.capacity} كراسي {table.section ? `— ${table.section}` : ''}</span>
      </div>

      {/* Bottom row: Session total or opened time */}
      <div className="pt-2 border-t border-border-default flex items-center justify-between text-xs">
        {occ && table.session ? (
          <>
            <span className="mono font-bold" style={{ color: 'var(--t1)' }}>
              {total.toFixed(2)} ج
            </span>
            <span className="text-[10px] text-txt-muted mono">
              {table.session.openedAt}
            </span>
          </>
        ) : (
          <span className="text-[11px] text-txt-dim">جاهزة للاستقبال</span>
        )}
      </div>
    </div>
  );
};
