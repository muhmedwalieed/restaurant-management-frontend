import React, { useMemo } from 'react';
import { WaiterTableCard } from './WaiterTableCard.jsx';
import { SlidersHorizontal } from 'lucide-react';

export const WaiterTableGrid = ({
  tables = [],
  selectedTableId,
  onSelectTable,
  filter = 'ALL',
  onChangeFilter,
  selectedSection = 'ALL',
  onChangeSection,
}) => {
  // Extract distinct sections from tables
  const sections = useMemo(() => {
    const s = new Set();
    tables.forEach((t) => {
      if (t.section) s.add(t.section);
    });
    return Array.from(s);
  }, [tables]);

  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchesFilter =
        filter === 'ALL' ||
        (filter === 'OCCUPIED' && t.status === 'occupied') ||
        (filter === 'AVAILABLE' && t.status === 'available') ||
        (filter === 'ALERTS' && t.session?.alerts?.length > 0);

      const matchesSection =
        selectedSection === 'ALL' || t.section === selectedSection;

      return matchesFilter && matchesSection;
    });
  }, [tables, filter, selectedSection]);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Filters Bar */}
      <div
        className="px-4 py-2.5 flex items-center justify-between gap-3 border-b flex-wrap shrink-0"
        style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}
      >
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
          <button
            type="button"
            onClick={() => onChangeFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'ALL' ? 'text-white' : 'text-slate-400 hover:text-white'
            }`}
            style={{ background: filter === 'ALL' ? 'var(--ac)' : 'transparent' }}
          >
            الكل ({tables.length})
          </button>
          <button
            type="button"
            onClick={() => onChangeFilter('OCCUPIED')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'OCCUPIED' ? 'text-white' : 'text-slate-400 hover:text-white'
            }`}
            style={{ background: filter === 'OCCUPIED' ? 'var(--ac)' : 'transparent' }}
          >
            مشغولة ({tables.filter((t) => t.status === 'occupied').length})
          </button>
          <button
            type="button"
            onClick={() => onChangeFilter('AVAILABLE')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'AVAILABLE' ? 'text-white' : 'text-slate-400 hover:text-white'
            }`}
            style={{ background: filter === 'AVAILABLE' ? 'var(--ac)' : 'transparent' }}
          >
            متاحة ({tables.filter((t) => t.status === 'available').length})
          </button>
          <button
            type="button"
            onClick={() => onChangeFilter('ALERTS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'ALERTS' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-amber-300'
            }`}
            style={{ background: filter === 'ALERTS' ? 'var(--warn-bg)' : 'transparent' }}
          >
            نداءات ({tables.filter((t) => t.session?.alerts?.length > 0).length})
          </button>
        </div>

        {/* Section Filter if available */}
        {sections.length > 0 && (
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal size={13} style={{ color: 'var(--t3)' }} />
            <select
              value={selectedSection}
              onChange={(e) => onChangeSection(e.target.value)}
              className="text-xs py-1 px-2 rounded-lg bg-bg-surface border border-border-default text-txt-primary"
            >
              <option value="ALL">جميع الأقسام</option>
              {sections.map((s) => (
                <option key={s} value={s}>
                  قسم {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tables Grid */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {filteredTables.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-4">
            <p className="text-xs font-semibold" style={{ color: 'var(--t2)' }}>
              لا توجد طاولات مطابقة للفلتر المحدد
            </p>
          </div>
        ) : (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}
          >
            {filteredTables.map((t) => (
              <WaiterTableCard
                key={t.id}
                table={t}
                isSelected={selectedTableId === t.id}
                onSelect={onSelectTable}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
