import React from 'react';
import { Store, Users } from 'lucide-react';
import { resolveAssetUrl } from '../../../../lib/asset-url.js';
import { formatTableLabel } from '../../utils/tableLabel.js';

export const TableMenuHeader = ({
  restaurant,
  table,
  branch,
  session,
  isClosed,
  onLeaveSession,
}) => {
  const peopleCount = session?.members?.length || 0;
  const peopleNames = (session?.members || []).map((m) => m.name).filter(Boolean);

  // Same geometry as the POS header: h-14, px-3 / sm:px-6, hairline underneath.
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-zinc-200 dark:border-zinc-800 bg-bg-surface/90 backdrop-blur-md">
      <div className="h-full max-w-6xl mx-auto px-3 sm:px-6 flex items-center gap-3">
        {restaurant?.logoUrl ? (
          <img
            src={resolveAssetUrl(restaurant.logoUrl)}
            alt=""
            className="w-9 h-9 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0"
          />
        ) : (
          <span className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0 flex items-center justify-center">
            <Store className="w-4 h-4 text-brand-primary" aria-hidden="true" />
          </span>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-txt-primary truncate leading-tight">
            {restaurant?.name || 'مطعمنا'}
          </h1>
          <p className="text-xs text-txt-muted truncate leading-tight">
            {table?.label ? formatTableLabel(table.label) : branch?.name}
          </p>
        </div>

        <span
          className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-full text-xs font-semibold text-txt-primary bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shrink-0"
          title={peopleNames.length > 0 ? peopleNames.join('، ') : 'لسه محدش انضم للطاولة'}
          aria-label={`عدد الأشخاص في الطاولة: ${peopleCount}`}
        >
          <Users className="w-3.5 h-3.5 text-brand-primary" aria-hidden="true" />
          <span className="mono">{peopleCount}</span>
          <span className="hidden sm:inline">أشخاص</span>
        </span>

        {isClosed && (
          <button
            type="button"
            onClick={onLeaveSession}
            className="shrink-0 h-9 px-3 rounded-lg text-xs font-semibold text-txt-muted border border-zinc-200 dark:border-zinc-800 hover:text-status-danger hover:border-status-danger/40 transition-colors cursor-pointer"
            title="تسجيل خروج والعودة لشاشة الدخول"
          >
            تسجيل خروج
          </button>
        )}
      </div>
    </header>
  );
};

export default TableMenuHeader;
