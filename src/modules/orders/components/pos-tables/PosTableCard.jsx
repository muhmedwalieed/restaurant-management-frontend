import React, { useMemo } from 'react';
import { Users, Clock, QrCode } from 'lucide-react';
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

const CARD_BASE =
  'relative rounded-2xl flex flex-col overflow-hidden min-h-[11rem] cursor-pointer transition-all duration-200 border';

const QR_BUTTON =
  'h-8 w-8 rounded-lg flex items-center justify-center transition-colors bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-700';

/* ─────────────────────────────────────────────────────── */

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
  const total = table.session?.total || 0;

  const activeOrder = table.session?.activeOrder;
  const ordersCount = table.session?.ordersCount || 0;
  const orderSuffix = activeOrder?.id
    ? String(activeOrder.id).slice(-4)
    : (activeOrder?.orderNumber ? String(activeOrder.orderNumber) : null);

  // Cards expose a full button keyboard model (Enter + Space).
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(table);
    }
  };

  /* ── OCCUPIED ─────────────────────────────────────────── */
  if (occ) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(table)}
        onKeyDown={handleKeyDown}
        className={[
          CARD_BASE,
          'bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800',
          isSelected
            ? 'ring-2 ring-amber-400/60 shadow-lg'
            : 'shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-500/30',
        ].join(' ')}
      >
        <span className="absolute inset-x-0 top-0 h-1 bg-amber-500" aria-hidden="true" />

        {/* Card body */}
        <div className="flex flex-col flex-1 p-3 sm:p-4 gap-2">

          {/* Row 1: Table name + badge */}
          <div className="flex items-start justify-between gap-2">
            <span className="text-base font-bold leading-tight truncate text-zinc-900 dark:text-zinc-100">
              {tableLabel}
            </span>
            <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25">
              مشغولة
            </span>
          </div>

          {/* Row 2: Elapsed time */}
          {elapsed && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <Clock size={11} className="shrink-0 text-amber-500 dark:text-amber-400/70" />
              <span className="truncate">{elapsed}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse mr-auto" />
            </div>
          )}

          {/* Row 3: Order reference (single order # or count when multiple) */}
          {ordersCount > 1 ? (
            <span className="text-[11px] text-zinc-500 dark:text-zinc-500 font-mono">
              {ordersCount} طلبات
            </span>
          ) : orderSuffix ? (
            <span className="text-[11px] text-zinc-500 dark:text-zinc-500 font-mono" dir="ltr">
              طلب #{orderSuffix}
            </span>
          ) : null}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Row 4: Total */}
          <div className="pt-2.5 border-t border-zinc-200 dark:border-zinc-800/80">
            <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-base leading-none">
              {total.toFixed(2)}{' '}
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal">ج.م</span>
            </div>
          </div>

          {/* Row 5: Actions — QR on the right, manage filling to the left */}
          <div className="flex items-center gap-1.5">
            {onShowQr && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onShowQr(table); }}
                className={`${QR_BUTTON} shrink-0`}
                title="عرض رمز QR للطاولة"
              >
                <QrCode size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSelect(table); }}
              className="h-8 flex-1 min-w-0 px-3 rounded-lg text-xs font-medium truncate transition-colors bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-amber-400 dark:border-amber-500/25"
            >
              إدارة الطاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── AVAILABLE ────────────────────────────────────────── */
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(table)}
      onKeyDown={handleKeyDown}
      className={[
        CARD_BASE,
        'group bg-white border-zinc-200 dark:bg-zinc-900/70 dark:border-zinc-800',
        isSelected
          ? 'ring-2 ring-emerald-400/60 shadow-md'
          : 'shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-900',
      ].join(' ')}
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-emerald-500" aria-hidden="true" />

      {/* Card body */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 gap-2">

        {/* Row 1: Table name + badge */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-base font-bold leading-tight truncate text-zinc-900 dark:text-zinc-200 dark:group-hover:text-white transition-colors">
            {tableLabel}
          </span>
          <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
            متاحة
          </span>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-500">
          <Users size={11} className="shrink-0" />
          <span className="truncate">{table.capacity || 4} مقاعد{table.section ? ` · ${table.section}` : ''}</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions — QR on the right, manage filling to the left */}
        <div className="flex items-center gap-1.5 pt-2.5 border-t border-zinc-200 dark:border-zinc-800/80">
          {onShowQr && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onShowQr(table); }}
              className={`${QR_BUTTON} shrink-0`}
              title="عرض رمز QR للطاولة"
            >
              <QrCode size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSelect(table); }}
            className="h-8 flex-1 min-w-0 px-3 rounded-lg text-xs font-medium truncate transition-colors bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-emerald-400 dark:border-emerald-500/25"
          >
            إدارة الطاولة
          </button>
        </div>
      </div>
    </div>
  );
};

export default PosTableCard;
