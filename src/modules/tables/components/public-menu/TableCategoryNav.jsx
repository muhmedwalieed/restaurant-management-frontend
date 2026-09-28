import React from 'react';

export const TableCategoryNav = ({
  categories = [],
  selectedCatId,
  onSelectCategory,
  totalProducts = 0,
}) => {
  if (categories.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs custom-scrollbar sticky top-[68px] z-20 bg-bg-base/95 backdrop-blur py-1 -mx-1 px-1 rounded-xl">
      <button
        onClick={() => onSelectCategory('ALL')}
        className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all shadow-sm cursor-pointer ${
          selectedCatId === 'ALL'
            ? 'bg-brand-primary text-white shadow-sm'
            : 'bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary'
        }`}
      >
        الكل ({totalProducts})
      </button>

      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelectCategory(c.id)}
          className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all shadow-sm cursor-pointer ${
            selectedCatId === c.id
              ? 'bg-brand-primary text-white shadow-sm'
              : 'bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary'
          }`}
        >
          {c.name} ({c.products?.length || 0})
        </button>
      ))}
    </div>
  );
};
