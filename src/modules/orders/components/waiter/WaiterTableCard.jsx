import React from 'react';
import { Users, Clock } from 'lucide-react';
import { ALERT_CONFIG, ALERT_PRIORITIES } from '../../../tables/hooks/useTableGridState.js';

export const WaiterTableCard = ({ table, isSelected, onSelect }) => {
  const occ = table.status === 'occupied';
  const topAlert = table.session?.alerts?.find((a) => ALERT_PRIORITIES.includes(a));
  const alertCfg = topAlert ? ALERT_CONFIG[topAlert] : null;
  const total = table.session ? table.session.total : 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(table)}
      className="relative flex flex-col rounded-xl text-right transition-colors duration-150 overflow-hidden cursor-pointer w-full select-none"
      style={{
        background: occ ? 'var(--s2)' : 'var(--bg)',
        border: isSelected
          ? '1.5px solid var(--ac)'
          : alertCfg
          ? `1.5px solid ${alertCfg.border}`
          : '1px solid var(--bd)',
        minHeight: 148,
      }}
    >
      {/* Alert top stripe */}
      {alertCfg && <div className="h-1 w-full shrink-0 animate-pulse" style={{ background: alertCfg.color }} />}

      <div className="flex flex-col gap-2 p-4 flex-1">
        {/* Status badge & Table Number */}
        <div className="flex items-start justify-between">
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded"
            style={{
              background: occ ? 'var(--ac-bg)' : 'var(--ok-bg)',
              color: occ ? 'var(--ac)' : 'var(--ok)',
              fontSize: 10,
            }}
          >
            {occ ? 'مشغولة' : 'متاحة'}
          </span>
          <span
            className="mono font-bold"
            style={{
              fontSize: 28,
              lineHeight: 1,
              color: isSelected ? 'var(--ac)' : occ ? 'var(--t1)' : 'var(--t3)',
            }}
          >
            {table.displayNum}
          </span>
        </div>

        {/* Capacity & Section */}
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--t3)' }}>
          <Users size={10} />
          {table.capacity}
          {table.section ? ` — ${table.section}` : ''}
        </div>

        {/* Session info if occupied */}
        {occ && table.session && (
          <div className="mt-auto flex flex-col gap-1 pt-2" style={{ borderTop: '1px solid var(--bd)' }}>
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--t3)' }}>
              <Clock size={9} />
              <span className="mono">{table.session.openedAt}</span>
            </div>
            {total > 0 && (
              <p className="mono font-semibold text-sm" style={{ color: 'var(--t1)' }}>
                {total} <span className="text-xs font-normal" style={{ color: 'var(--t2)' }}>ج</span>
              </p>
            )}
            <div className="flex items-center gap-1 flex-wrap">
              {table.session.alerts?.map((a) => (
                <span
                  key={a}
                  className="text-xs font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    background: ALERT_CONFIG[a]?.bg,
                    color: ALERT_CONFIG[a]?.color,
                    fontSize: 9,
                  }}
                >
                  {ALERT_CONFIG[a]?.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </button>
  );
};
