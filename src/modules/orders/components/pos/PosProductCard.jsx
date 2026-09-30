import React from 'react';
import { resolveAssetUrl } from '../../../../lib/asset-url.js';
import { Plus, Minus, Sliders, Utensils } from 'lucide-react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { hasProductModifiers } from '../../constants.js';

export const PosProductCard = ({
  product,
  onSelect,
  onIncrement,
  onDecrement,
  cartQty = 0,
  currency,
}) => {
  const { currency: dc } = useCurrency();
  const cur = currency || dc;
  const hasMod = hasProductModifiers(product);
  const inCart = cartQty > 0;

  return (
    <div
      onClick={() => onSelect(product)}
      className={`group flex flex-col rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
        inCart
          ? 'border-zinc-400 dark:border-zinc-600 bg-white dark:bg-zinc-900 shadow-md ring-2 ring-zinc-900/10 dark:ring-zinc-100/10'
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 shadow-sm hover:shadow-md'
      }`}
    >
      {/* ── Image & Badges Container (4:3 Aspect Ratio) ── */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 shrink-0">
        {product.imageUrl ? (
          <img
            src={resolveAssetUrl(product.imageUrl)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 gap-1">
            <Utensils size={24} />
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{product.name?.[0] || '•'}</span>
          </div>
        )}

        {/* Modifiers Badge */}
        {hasMod && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 dark:bg-zinc-900/90 backdrop-blur border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 shadow-sm">
            <Sliders size={10} /> خيارات
          </span>
        )}

        {/* In-Cart Indicator Badge */}
        {inCart && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center gap-1 shadow-md">
            {cartQty} ×
          </span>
        )}
      </div>

      {/* ── Product Info & Actions ── */}
      <div className="p-3 flex flex-col justify-between flex-1 gap-2.5">
        <h3
          className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1 leading-snug group-hover:text-zinc-950 dark:group-hover:text-white transition-colors"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Bottom Price & Add/Stepper Controls */}
        <div
          className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/80"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-100">
              {Number(product.price).toFixed(0)}
            </span>
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
              {cur}
            </span>
          </div>

          {/* Stepper or Quick Add Button (Standardized h-8 rounded-lg) */}
          {inCart ? (
            <div className="h-8 px-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => onDecrement(product)}
                className="w-6 h-6 rounded flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                title="تقليل الكمية"
              >
                <Minus size={12} />
              </button>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 w-5 text-center font-mono">
                {cartQty}
              </span>
              <button
                type="button"
                onClick={() => onIncrement(product)}
                className="w-6 h-6 rounded flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                title="زيادة الكمية"
              >
                <Plus size={12} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSelect(product)}
              className="h-8 px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 active:scale-95 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1"
              title="إضافة إلى السلة"
            >
              <Plus size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PosProductCard;
