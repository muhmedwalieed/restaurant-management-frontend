import React from 'react';

export const PosCategoryTabs = ({
  categories = [],
  activeCategory = 'ALL',
  onSelectCategory,
  products = [],
}) => {
  const getCount = (id) =>
    id === 'ALL'
      ? products.length
      : products.filter((p) => p.categoryId === id || p.category?.id === id).length;

  return (
    <div
      className="h-14 px-3 flex items-center gap-1.5 overflow-x-auto shrink-0 custom-scrollbar"
      style={{ background: 'var(--s1)', borderBottom: '1px solid var(--bd)' }}
    >
      {/* ALL Category Button */}
      <button
        type="button"
        onClick={() => onSelectCategory('ALL')}
        className={`py-1.5 px-3.5 rounded-full text-[12px] font-bold whitespace-nowrap flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 border ${
          activeCategory === 'ALL' ? 'font-black shadow-sm' : 'hover:opacity-80'
        }`}
        style={
          activeCategory === 'ALL'
            ? {
                background: 'var(--ac)',
                color: 'var(--ti, #ffffff)',
                borderColor: 'transparent',
              }
            : {
                background: 'var(--s2)',
                borderColor: 'var(--bd)',
                color: 'var(--t2)',
              }
        }
      >
        <span>جميع الأصناف</span>
        <span
          className="text-[11px] font-mono opacity-80"
          style={{ color: activeCategory === 'ALL' ? 'var(--ti, #ffffff)' : 'var(--t3)' }}
        >
          ({products.length})
        </span>
      </button>

      {/* Individual Categories */}
      {categories.map((c) => {
        const isSel = activeCategory === c.id;
        const count = getCount(c.id);

        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectCategory(c.id)}
            className={`py-1.5 px-3.5 rounded-full text-[12px] font-bold whitespace-nowrap flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 border ${
              isSel ? 'font-black shadow-sm' : 'hover:opacity-80'
            }`}
            style={
              isSel
                ? {
                    background: 'var(--ac)',
                    color: 'var(--ti, #ffffff)',
                    borderColor: 'transparent',
                  }
                : {
                    background: 'var(--s2)',
                    borderColor: 'var(--bd)',
                    color: 'var(--t2)',
                  }
            }
          >
            <span>{c.name}</span>
            {count > 0 && (
              <span
                className="text-[11px] font-mono opacity-80"
                style={{ color: isSel ? 'var(--ti, #ffffff)' : 'var(--t3)' }}
              >
                ({count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default PosCategoryTabs;
