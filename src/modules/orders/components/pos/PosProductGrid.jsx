import React from 'react';
import { Search, UtensilsCrossed } from 'lucide-react';
import { PosProductCard } from './PosProductCard.jsx';

export const PosProductGrid = ({
  products = [],
  searchQuery = '',
  onChangeSearch,
  onSelectProduct,
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Search Input Bar */}
      <div className="p-3 border-b shrink-0" style={{ borderColor: 'var(--bd)' }}>
        <div className="relative w-full">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearch(e.target.value)}
            placeholder="ابحث عن صنف أو كود سريع..."
            className="w-full pr-9 pl-3 py-2 rounded-lg bg-bg-surface border border-border-default text-xs text-txt-primary focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {products.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-4">
            <UtensilsCrossed size={28} className="text-slate-600 mb-2" />
            <p className="text-xs font-semibold" style={{ color: 'var(--t2)' }}>
              لا توجد أصناف مطابقة للبحث أو القسم المحدد
            </p>
          </div>
        ) : (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}
          >
            {products.map((p) => (
              <PosProductCard
                key={p.id}
                product={p}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
