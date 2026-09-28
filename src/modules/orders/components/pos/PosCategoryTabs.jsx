import React from 'react';

export const PosCategoryTabs = ({
  categories = [],
  activeCategory = 'ALL',
  onSelectCategory,
}) => {
  return (
    <div
      className="flex items-center gap-1.5 overflow-x-auto p-3 border-b shrink-0 select-none scrollbar-thin"
      style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}
    >
      <button
        type="button"
        onClick={() => onSelectCategory('ALL')}
        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
          activeCategory === 'ALL'
            ? 'bg-brand-primary text-white font-bold shadow-sm'
            : 'hover:bg-white/5 text-slate-400'
        }`}
      >
        الكل
      </button>

      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelectCategory(c.id)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeCategory === c.id
              ? 'bg-brand-primary text-white font-bold shadow-sm'
              : 'hover:bg-white/5 text-slate-400'
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
};
