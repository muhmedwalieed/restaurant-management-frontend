import React, { useMemo } from 'react';
import { Search, X } from 'lucide-react';

export const PosSalesToolbar = ({
  categories = [],
  activeCategory = 'ALL',
  onSelectCategory,
  allProducts = [],
  searchQuery = '',
  onChangeSearch,
}) => {
  const categoryCounts = useMemo(() => {
    const map = new Map();
    for (const p of allProducts) {
      const catId = p.categoryId || p.category?.id;
      if (catId) map.set(catId, (map.get(catId) || 0) + 1);
    }
    return map;
  }, [allProducts]);

  return (
    <div
      className="min-h-14 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 bg-transparent border-b border-zinc-200 dark:border-zinc-800 transition-colors"
    >
      {/* ── Category Tabs (RTL Right side, scrollable) ── */}
      <div className="flex-1 flex items-center gap-1.5 overflow-x-auto min-w-0 custom-scrollbar py-1">
        {/* ALL Category Button */}
        <button
          type="button"
          onClick={() => onSelectCategory('ALL')}
          className={`py-1.5 px-4 rounded-full text-xs whitespace-nowrap flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
            activeCategory === 'ALL'
              ? 'bg-zinc-900 dark:bg-zinc-800 text-white font-medium border-zinc-900 dark:border-zinc-700 shadow-sm'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 font-medium'
          }`}
        >
          <span>جميع الأصناف</span>
          <span
            className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400"
          >
            ({allProducts.length})
          </span>
        </button>

        {/* Individual Categories */}
        {categories.map((c) => {
          const isSel = activeCategory === c.id;
          const count = categoryCounts.get(c.id) || 0;

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCategory(c.id)}
              className={`py-1.5 px-4 rounded-full text-xs whitespace-nowrap flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                isSel
                  ? 'bg-zinc-900 dark:bg-zinc-800 text-white font-medium border-zinc-900 dark:border-zinc-700 shadow-sm'
                  : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 font-medium'
              }`}
            >
              <span>{c.name}</span>
              {count > 0 && (
                <span
                  className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400"
                >
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Search Input (RTL Left side; its own row on phones) ── */}
      <div className="flex items-center w-full sm:w-auto shrink-0">
        <div className="relative w-full sm:w-48 lg:w-52">
          <Search
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 dark:text-zinc-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearch(e.target.value)}
            placeholder="ابحث عن صنف..."
            className="w-full min-h-[36px] pr-8 pl-7 py-1.5 rounded-full text-base sm:text-xs font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:bg-white dark:focus:bg-zinc-950 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onChangeSearch('')}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
              title="مسح البحث"
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PosSalesToolbar;
