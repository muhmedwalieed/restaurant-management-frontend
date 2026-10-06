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
  const cur = currency || dc || '';
  const hasMod = hasProductModifiers(product);
  const inCart = cartQty > 0;

  return (
    <div
      onClick={() => onSelect(product)}
      className={`group flex flex-col rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer active:scale-[0.98] ${inCart
          ? 'border-zinc-400 dark:border-zinc-600 bg-white dark:bg-zinc-900 shadow-md ring-2 ring-zinc-900/10 dark:ring-zinc-100/10'
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 shadow-sm hover:shadow-md'
        }`}
    >
      {/* ── Image & Badges Container (16:11 Aspect Ratio) ── */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950 shrink-0">
        {product.imageUrl ? (
          <img
            src={resolveAssetUrl(product.imageUrl)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 gap-1">
            <Utensils size={26} />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{product.name?.[0] || '•'}</span>
          </div>
        )}

        {/* Modifiers Badge */}
        {hasMod && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 dark:bg-zinc-900/90 backdrop-blur border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 shadow-sm">
            <Sliders size={10} /> خيارات
          </span>
        )}
      </div>

      {/* ── Product Info & Actions ── */}
      <div className="p-3 flex flex-col justify-between flex-1 gap-2">
        <h3
          className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 leading-snug group-hover:text-zinc-950 dark:group-hover:text-white transition-colors"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Bottom Price & Add/Stepper Controls */}
        <div
          className="flex items-center justify-between gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 min-w-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Price */}
          <div className="flex items-baseline gap-1 shrink-0" dir="rtl">
            <span className="text-sm font-black font-mono text-zinc-900 dark:text-zinc-100">
              {Number(product.price).toFixed(2)}
            </span>
            <span className="text-[10px] font-bold text-zinc-400 font-sans">
              {cur}
            </span>
          </div>

          {/* Stepper or Quick Add Button */}
          {inCart ? (
            <div
              dir="ltr"
              className="h-7 px-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center gap-1 shadow-2xs shrink-0 select-none"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onDecrement(product);
                }}
                className="w-5 h-5 rounded flex items-center justify-center text-zinc-500 dark:text-zinc-400 active:scale-75 active:opacity-60 focus:outline-none transition-transform cursor-pointer select-none"
                title="تقليل الكمية"
              >
                <Minus size={12} strokeWidth={2.5} />
              </button>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 min-w-[16px] text-center font-mono select-none px-0.5">
                {cartQty}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onIncrement(product);
                }}
                className="w-5 h-5 rounded flex items-center justify-center text-zinc-500 dark:text-zinc-400 active:scale-75 active:opacity-60 focus:outline-none transition-transform cursor-pointer select-none"
                title="زيادة الكمية"
              >
                <Plus size={12} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onIncrement(product);
              }}
              className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 active:scale-90 active:opacity-75 focus:outline-none transition-transform cursor-pointer shadow-2xs flex items-center justify-center shrink-0 select-none"
              title="إضافة إلى السلة"
            >
              <Plus size={13} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PosProductCard;
