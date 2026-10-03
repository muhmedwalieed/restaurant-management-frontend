import React from 'react';

export const TableCategoryNav = ({
  categories = [],
  selectedCatId,
  onSelectCategory,
  totalProducts = 0,
}) => {
  if (categories.length === 0) return null;

  // Mirrors the waiter/POS products toolbar: h-14 bar, transparent pills, and a
  // hairline under it that separates the categories from the products section.
  const pillClass = (isActive) =>
    `py-1.5 px-4 rounded-full text-xs whitespace-nowrap flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
      isActive
        ? 'bg-zinc-900 dark:bg-zinc-800 text-white font-medium border-zinc-900 dark:border-zinc-700 shadow-sm'
        : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 font-medium'
    }`;

  return (
    <div className="sticky top-14 z-20 h-14 -mx-3 px-3 sm:-mx-4 sm:px-4 lg:mx-0 lg:px-0 flex items-center gap-1.5 shrink-0 overflow-x-auto custom-scrollbar bg-bg-base/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => onSelectCategory('ALL')}
        className={pillClass(selectedCatId === 'ALL')}
      >
        الكل ({totalProducts})
      </button>

      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelectCategory(c.id)}
          className={pillClass(selectedCatId === c.id)}
        >
          {c.name} ({c.products?.length || 0})
        </button>
      ))}
    </div>
  );
};

export default TableCategoryNav;
