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
    <div className="h-14 px-3 sm:px-4 flex items-center gap-2 sm:gap-3 shrink-0 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xs transition-colors">
      {/* Search Input (Responsive Width) */}
      <div className="relative w-44 sm:w-56 md:w-64 lg:w-72 shrink-0">
        <Search
          size={15}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 dark:text-zinc-500"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onChangeSearch(e.target.value)}
          placeholder="ابحث عن صنف أو كود..."
          className="w-full h-10 pr-9 pl-8 rounded-xl text-xs font-medium bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onChangeSearch('')}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md flex items-center justify-center cursor-pointer bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors"
            title="مسح البحث"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Subtle Divider between Search and Categories */}
      <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 shrink-0" />

      {/* Category Pills (Single scrollable row) */}
      <div className="flex-1 flex items-center gap-1.5 overflow-x-auto min-w-0 custom-scrollbar py-1">
        {/* ALL Category Button */}
        <button
          type="button"
          onClick={() => onSelectCategory('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
            activeCategory === 'ALL'
              ? 'bg-zinc-900 dark:bg-zinc-800 text-white font-bold border-zinc-900 dark:border-zinc-700 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/40 font-medium'
          }`}
        >
          <span>الكل</span>
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${activeCategory === 'ALL' ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
            {allProducts.length}
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
              className={`px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                isSel
                  ? 'bg-zinc-900 dark:bg-zinc-800 text-white font-bold border-zinc-900 dark:border-zinc-700 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/40 font-medium'
              }`}
            >
              <span>{c.name}</span>
              {count > 0 && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${isSel ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PosSalesToolbar;
