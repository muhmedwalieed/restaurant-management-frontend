import { resolveAssetUrl } from '../../../../lib/asset-url.js';
import { Plus, Sliders } from 'lucide-react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';

export const PosProductCard = ({ product, onSelect, currency }) => {
  const { currency: defaultCurrency } = useCurrency();
  const displayCurrency = currency || defaultCurrency;
  const hasModifiers = Boolean(
    product.hasModifiers || (product.modifierGroups && product.modifierGroups.length > 0)
  );

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="p-3 rounded-xl border flex flex-col justify-between text-right transition-all hover:border-slate-500 hover:shadow-md cursor-pointer select-none group relative overflow-hidden"
      style={{ background: 'var(--s1)', borderColor: 'var(--bd)', minHeight: 120 }}
    >
      {/* Product Image if available */}
      {product.imageUrl && (
        <div className="w-full h-24 rounded-lg overflow-hidden mb-2 bg-black/20">
          <img
            src={resolveAssetUrl(product.imageUrl)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        </div>
      )}

      <div>
        <div className="flex items-start justify-between gap-1.5">
          <h3 className="text-xs font-bold leading-snug line-clamp-2" style={{ color: 'var(--t1)' }}>
            {product.name}
          </h3>
          {hasModifiers && (
            <span
              className="text-[10px] px-1 py-0.5 rounded flex items-center gap-0.5 shrink-0"
              style={{ background: 'var(--ac-bg)', color: 'var(--ac)' }}
              title="يحتوي على خيارات وإضافات"
            >
              <Sliders size={10} />
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
        <span className="mono font-bold text-xs" style={{ color: 'var(--ac)' }}>
          {Number(product.price).toFixed(2)} <span className="text-[10px] font-normal" style={{ color: 'var(--t3)' }}>{displayCurrency}</span>
        </span>

        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors group-hover:bg-brand-primary group-hover:text-white"
          style={{ background: 'var(--s2)', color: 'var(--t2)' }}
        >
          <Plus size={13} />
        </div>
      </div>
    </button>
  );
};
