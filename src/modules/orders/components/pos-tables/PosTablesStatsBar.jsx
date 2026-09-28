import React from 'react';

export const PosTablesStatsBar = ({ occupiedCount = 0, availableCount = 0 }) => {
  return (
    <header
      className="flex items-center justify-between px-5 h-14 border-b shrink-0"
      style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}
    >
      <div className="flex items-center gap-4 text-xs">
        <h2 className="text-sm font-bold" style={{ color: 'var(--t1)' }}>الطاولات</h2>
        <span className="text-slate-400">·</span>
        <span><strong style={{ color: 'var(--t1)' }}>{occupiedCount}</strong> مشغولة</span>
        <span className="text-slate-400">·</span>
        <span><strong style={{ color: 'var(--ok)' }}>{availableCount}</strong> متاحة</span>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1.5" style={{ color: 'var(--t2)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--ok)' }} />
          متاحة
        </span>
        <span className="flex items-center gap-1.5" style={{ color: 'var(--t2)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--ac)' }} />
          مشغولة
        </span>
      </div>
    </header>
  );
};
