import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { PosProductCard } from './PosProductCard.jsx';

export const PosProductGrid = ({
  products = [],
  onSelectProduct,
  onIncrementProduct,
  onDecrementProduct,
  cartItemMap = {},
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar bg-transparent">
        <div className="grid gap-3.5 sm:gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-44 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }
  return (
  <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar bg-transparent">
    {products.length === 0 ? (
      <div className="h-64 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 shadow-xs">
          <UtensilsCrossed size={22} />
        </div>
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">لا توجد أصناف مطابقة</p>
        <p className="text-xs mt-1 text-zinc-500 dark:text-zinc-400">جرب البحث بكلمة أخرى أو اختر تصنيفاً مختلفاً</p>
      </div>
    ) : (
      <div
        className="grid gap-3.5 sm:gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))' }}
      >
        {products.map((p) => (
          <PosProductCard
            key={p.id}
            product={p}
            onSelect={onSelectProduct}
            onIncrement={onIncrementProduct}
            onDecrement={onDecrementProduct}
            cartQty={cartItemMap[`${p.id}__`] ?? cartItemMap[p.id] ?? 0}
          />
        ))}
      </div>
    )}
  </div>
  );
};

export default PosProductGrid;
