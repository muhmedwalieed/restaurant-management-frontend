import React, { useMemo } from 'react';
import { PosTableCard } from '../pos-tables/PosTableCard.jsx';
import { SlidersHorizontal } from 'lucide-react';

// Pill language shared with the POS toolbars: transparent when idle, a solid chip when active.
const PILL_BASE =
  'py-1.5 px-4 rounded-full text-xs whitespace-nowrap flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 border';

const pillClass = (isActive, tone) => {
  if (isActive) {
    return tone === 'alert'
      ? 'bg-amber-500 text-white font-medium border-amber-500 shadow-sm'
      : 'bg-zinc-900 dark:bg-zinc-800 text-white font-medium border-zinc-900 dark:border-zinc-700 shadow-sm';
  }
  return tone === 'alert'
    ? 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-medium'
    : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 font-medium';
};

export const WaiterTableGrid = ({
  tables = [],
  selectedTableId,
  onSelectTable,
  filter = 'ALL',
  onChangeFilter,
  selectedSection = 'ALL',
  onChangeSection,
  onShowQr,
}) => {
  // Extract distinct sections from tables
  const sections = useMemo(() => {
    const s = new Set();
    tables.forEach((t) => {
      if (t.section) s.add(t.section);
    });
    return Array.from(s);
  }, [tables]);

  const filters = useMemo(
    () => [
      { id: 'ALL', label: 'الكل', count: tables.length },
      { id: 'OCCUPIED', label: 'مشغولة', count: tables.filter((t) => t.status === 'occupied').length },
      { id: 'AVAILABLE', label: 'متاحة', count: tables.filter((t) => t.status === 'available').length },
      {
        id: 'ALERTS',
        label: 'نداءات',
        tone: 'alert',
        count: tables.filter((t) => t.session?.alerts?.length > 0).length,
      },
    ],
    [tables]
  );

  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchesFilter =
        filter === 'ALL' ||
        (filter === 'OCCUPIED' && t.status === 'occupied') ||
        (filter === 'AVAILABLE' && t.status === 'available') ||
        (filter === 'ALERTS' && t.session?.alerts?.length > 0);

      const matchesSection = selectedSection === 'ALL' || t.section === selectedSection;

      return matchesFilter && matchesSection;
    });
  }, [tables, filter, selectedSection]);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-100 dark:bg-black">
      {/* Filters bar — pill style matching the POS toolbars */}
      <div className="min-h-14 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div
          className="flex-1 flex items-center gap-1.5 overflow-x-auto min-w-0 custom-scrollbar py-1"
          role="group"
          aria-label="فلترة الطاولات"
        >
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onChangeFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`${PILL_BASE} ${pillClass(filter === f.id, f.tone)}`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Section filter if the branch uses sections */}
        {sections.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal size={13} style={{ color: 'var(--t3)' }} aria-hidden="true" />
            <select
              value={selectedSection}
              onChange={(e) => onChangeSection(e.target.value)}
              aria-label="فلترة حسب القسم"
              className="text-base sm:text-xs min-h-[36px] py-1 px-2 rounded-lg bg-bg-surface border border-border-default text-txt-primary"
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

      {/* Tables grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredTables.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-4">
            <p className="text-xs font-semibold" style={{ color: 'var(--t2)' }}>
              لا توجد طاولات مطابقة للفلتر المحدد
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 p-3 sm:p-5">
            {filteredTables.map((t) => (
              <PosTableCard
                key={t.id}
                table={t}
                isSelected={selectedTableId === t.id}
                onSelect={onSelectTable}
                onShowQr={onShowQr}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WaiterTableGrid;
