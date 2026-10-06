import React, { useState, useMemo } from 'react';
import { PosTableCard } from '../pos-tables/PosTableCard.jsx';
import { Search, X, SlidersHorizontal, LayoutGrid, CheckCircle2, Flame, Bell, Utensils } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');

  // Extract distinct sections from tables
  const sections = useMemo(() => {
    const s = new Set();
    tables.forEach((t) => {
      if (t.section) s.add(t.section);
    });
    return Array.from(s);
  }, [tables]);

  const stats = useMemo(() => {
    const total = tables.length;
    const occupied = tables.filter((t) => t.status === 'occupied').length;
    const available = tables.filter((t) => t.status === 'available').length;
    const alerts = tables.filter((t) => t.session?.alerts?.length > 0).length;
    return { total, occupied, available, alerts };
  }, [tables]);

  const filters = useMemo(
    () => [
      {
        id: 'ALL',
        label: 'الكل',
        count: stats.total,
        icon: LayoutGrid,
        color: 'zinc',
      },
      {
        id: 'AVAILABLE',
        label: 'متاحة',
        count: stats.available,
        icon: CheckCircle2,
        color: 'emerald',
      },
      {
        id: 'OCCUPIED',
        label: 'مشغولة',
        count: stats.occupied,
        icon: Flame,
        color: 'amber',
      },
      {
        id: 'ALERTS',
        label: 'نداءات',
        count: stats.alerts,
        icon: Bell,
        color: 'red',
        hasAlertPulse: stats.alerts > 0,
      },
    ],
    [stats]
  );

  const filteredTables = useMemo(() => {
    const cleanSearch = searchQuery.trim().toLowerCase();

    return tables.filter((t) => {
      const matchesFilter =
        filter === 'ALL' ||
        (filter === 'OCCUPIED' && t.status === 'occupied') ||
        (filter === 'AVAILABLE' && t.status === 'available') ||
        (filter === 'ALERTS' && t.session?.alerts?.length > 0);

      const matchesSection = selectedSection === 'ALL' || t.section === selectedSection;

      if (!matchesFilter || !matchesSection) return false;

      if (!cleanSearch) return true;

      const num = String(t.displayNum ?? t.number ?? '').toLowerCase();
      const label = String(t.label || '').toLowerCase();
      const sec = String(t.section || '').toLowerCase();

      return num.includes(cleanSearch) || label.includes(cleanSearch) || sec.includes(cleanSearch);
    });
  }, [tables, filter, selectedSection, searchQuery]);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Top Controls Bar: Filter Pills + Search + Section Selector */}
      <div className="px-3 sm:px-5 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shrink-0 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xs">
        {/* Status Filter Chips */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto min-w-0 custom-scrollbar py-0.5"
          role="group"
          aria-label="فلترة الطاولات"
        >
          {filters.map((f) => {
            const isActive = filter === f.id;
            const Icon = f.icon;

            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onChangeFilter(f.id)}
                aria-pressed={isActive}
                className={`h-9 px-3.5 rounded-xl text-xs whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-zinc-900 dark:bg-zinc-800 text-white font-bold border-zinc-900 dark:border-zinc-700 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/40 font-medium'
                }`}
              >
                {f.color === 'emerald' && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                {f.color === 'amber' && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
                {f.color === 'red' && <span className={`w-2 h-2 rounded-full bg-red-500 shrink-0 ${f.hasAlertPulse ? 'animate-ping' : ''}`} />}
                {f.color === 'zinc' && <Icon size={13} className="opacity-70 shrink-0" />}

                <span>{f.label}</span>
                <span
                  className={`text-[11px] font-mono ${
                    isActive
                      ? 'text-zinc-300 dark:text-zinc-300 font-bold'
                      : 'text-zinc-500 dark:text-zinc-400 font-normal'
                  }`}
                >
                  ({f.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Section Filter */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Table Search */}
          <div className="relative flex-1 md:w-56">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث عن طاولة..."
              className="w-full h-9 pr-9 pl-7 rounded-xl text-xs bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
                title="مسح البحث"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Section Selector */}
          {sections.length > 0 && (
            <div className="flex items-center gap-1.5 shrink-0">
              <SlidersHorizontal size={13} className="text-zinc-400 dark:text-zinc-500" />
              <select
                value={selectedSection}
                onChange={(e) => onChangeSection(e.target.value)}
                aria-label="فلترة حسب القسم"
                className="h-9 px-2.5 rounded-xl text-xs font-semibold bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 cursor-pointer"
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
      </div>

      {/* Tables Grid Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredTables.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 text-zinc-400 shadow-xs">
              <Utensils size={24} />
            </div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              لا توجد طاولات مطابقة
            </p>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              {searchQuery
                ? `لم يتم العثور على أي طاولة مطابقة لـ "${searchQuery}"`
                : 'جرب تغيير خيارات الفلترة أو عرض جميع الطاولات'}
            </p>
            {(searchQuery || filter !== 'ALL' || selectedSection !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  onChangeFilter('ALL');
                  onChangeSection('ALL');
                }}
                className="mt-3.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 transition-colors cursor-pointer shadow-xs"
              >
                إعادة ضبط الفلاتر
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 p-3.5 sm:p-5">
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

