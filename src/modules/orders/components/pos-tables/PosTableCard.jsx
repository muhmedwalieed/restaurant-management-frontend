import React, { useMemo } from 'react';
import { Users, Clock, QrCode, Bell, Plus, ArrowLeft } from 'lucide-react';
import { formatTableLabel } from '../../../tables/utils/tableLabel.js';

/**
 * Normalize table label: prevents "طاولة طاولة 1" duplication.
 * If displayNum already starts with "طاولة", use it as-is.
 */
function resolveTableLabel(table) {
  return formatTableLabel(table.displayNum ?? table.number ?? table.label);
}

function computeElapsed(openedAt, openedAtIso) {
  const raw = openedAtIso || openedAt;
  if (!raw || raw === '—') return null;
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    const diffMs = Date.now() - parsed.getTime();
    const totalMins = Math.floor(diffMs / 60000);
    if (totalMins < 1) return 'الآن';
    if (totalMins < 60) return `منذ ${totalMins} د`;
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return mins > 0 ? `منذ ${hrs} س ${mins} د` : `منذ ${hrs} س`;
  }
  return openedAt;
}

export const PosTableCard = ({
  table,
  isSelected,
  onSelect,
  onShowQr,
}) => {
  const occ = table.status === 'occupied';
  const tableLabel = resolveTableLabel(table);
  const elapsed = useMemo(
    () => computeElapsed(table.session?.openedAt, table.session?.openedAtIso),
    [table.session?.openedAt, table.session?.openedAtIso]
  );
  const hasAlert = Boolean(table.session?.alerts && table.session.alerts.length > 0);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(table);
    }
  };

  /* ── OCCUPIED TABLE ─────────────────────────────────────────── */
  if (occ) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(table)}
        onKeyDown={handleKeyDown}
        className={`group relative rounded-2xl flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-200 border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/90 min-h-[160px] sm:min-h-[170px] ${
          isSelected
            ? 'bg-zinc-50 dark:bg-zinc-850 shadow-md'
            : hasAlert
            ? 'border-red-500/60 shadow-xs'
            : 'shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5'
        }`}
      >
        {/* Card Body */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1 gap-2.5 justify-between">
          {/* Header: Table Name + Occupied Status Badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 truncate tracking-tight">
                {tableLabel}
              </h3>
              {table.section && (
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate block mt-0.5">
                  قسم {table.section}
                </span>
              )}
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                مشغولة
              </span>
              {hasAlert && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 animate-bounce">
                  <Bell size={10} className="shrink-0" />
                  نداء
                </span>
              )}
            </div>
          </div>

          {/* Center Info: Live Elapsed Timer */}
          <div className="flex items-center gap-1.5 text-xs py-1.5 px-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 font-medium">
            {elapsed ? (
              <>
                <Clock size={12} className="text-amber-500 shrink-0" />
                <span className="font-mono text-xs">{elapsed}</span>
              </>
            ) : (
              <>
                <Users size={12} className="text-zinc-400" />
                <span>{table.capacity ? `${table.capacity} مقاعد` : ''}</span>
              </>
            )}
          </div>

          {/* Bottom Row: Actions */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
            {onShowQr && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowQr(table);
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer shrink-0"
                title="عرض رمز QR للطاولة"
                aria-label="عرض رمز QR للطاولة"
              >
                <QrCode size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(table);
              }}
              className="h-8 flex-1 rounded-xl text-xs font-bold transition-all cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>إدارة</span>
              <ArrowLeft size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── AVAILABLE TABLE ─────────────────────────────────────────── */
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(table)}
      onKeyDown={handleKeyDown}
      className={`group relative rounded-2xl flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-200 border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/90 min-h-[160px] sm:min-h-[170px] ${
        isSelected
          ? 'bg-zinc-50 dark:bg-zinc-850 shadow-md'
          : 'shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5'
      }`}
    >
      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 gap-2.5 justify-between">
        {/* Header: Table Name + Available Status Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 transition-colors truncate tracking-tight">
              {tableLabel}
            </h3>
            {table.section && (
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate block mt-0.5">
                قسم {table.section}
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            متاحة
          </span>
        </div>

        {/* Center Info: Capacity */}
        <div className="flex items-center gap-1.5 text-xs py-1.5 px-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-300 font-medium">
          <Users size={12} className="text-zinc-400" />
          <span>{table.capacity ? `${table.capacity} مقاعد` : ''}</span>
        </div>

        {/* Bottom Row: Actions */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
          {onShowQr && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShowQr(table);
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer shrink-0"
              title="عرض رمز QR للطاولة"
              aria-label="عرض رمز QR للطاولة"
            >
              <QrCode size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(table);
            }}
            className="h-8 flex-1 rounded-xl text-xs font-bold transition-all cursor-pointer bg-zinc-100 hover:bg-zinc-900 hover:text-white dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-100 dark:hover:text-zinc-950 border border-zinc-200 dark:border-zinc-700 shadow-2xs active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Plus size={13} />
            <span>بدء طلب</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PosTableCard;


