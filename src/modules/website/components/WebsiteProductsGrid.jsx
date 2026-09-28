import React from 'react';
import { resolveAssetUrl } from '../../../lib/asset-url.js';
import { Plus } from 'lucide-react';

export const WebsiteProductsGrid = ({
  categories = [],
  selectedCatId = 'ALL',
  onSelectCategory,
  onAddToCart,
}) => {
  const filtered = selectedCatId === 'ALL' ? categories : categories.filter((c) => c.id === selectedCatId);
  const totalProducts = categories.reduce((a, c) => a + (c.products?.length || 0), 0);

  return (
    <div className="space-y-4">
      {/* Category selector pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          type="button"
          onClick={() => onSelectCategory('ALL')}
          className={`px-3 py-2 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
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
            type="button"
            onClick={() => onSelectCategory(c.id)}
            className={`px-3 py-2 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCatId === c.id
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary'
            }`}
          >
            {c.name} ({c.products?.length || 0})
          </button>
        ))}
      </div>

      {/* Products list grouped by category */}
      <div className="space-y-6">
        {filtered.map((cat) => (
          <div key={cat.id} className="space-y-3">
            <h2 className="text-base font-bold text-txt-primary border-r-2 border-brand-primary pr-2">
              {cat.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(cat.products || []).map((prod) => (
                <div
                  key={prod.id}
                  className="bg-bg-surface border border-border-default rounded-xl p-3 flex gap-3 items-center justify-between shadow-xs hover:border-brand-primary/40 transition-colors"
                >
                  <div className="min-w-0 flex-1 space-y-1 text-right">
                    <p className="font-bold text-xs text-txt-primary truncate">{prod.name}</p>
                    {prod.description && (
                      <p className="text-[11px] text-txt-muted line-clamp-1">{prod.description}</p>
                    )}
                    <p className="font-mono font-bold text-xs text-brand-primary">
                      {Number(prod.price).toFixed(2)} EGP
                    </p>
                  </div>

                  {prod.imageUrl && (
                    <img
                      src={resolveAssetUrl(prod.imageUrl)}
                      alt={prod.name}
                      className="w-14 h-14 object-cover rounded-lg border border-border-default shrink-0"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => onAddToCart(prod)}
                    className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors shrink-0 cursor-pointer"
                    title="أضف للسلة"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
