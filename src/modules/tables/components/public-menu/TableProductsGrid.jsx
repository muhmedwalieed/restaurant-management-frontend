import React from 'react';
import { Tag, Utensils, Plus } from 'lucide-react';
import { resolveAssetUrl } from '../../../../lib/asset-url.js';

export const TableProductsGrid = ({
  filteredCategories = [],
  currency = 'EGP',
  locked = false,
  onAddProduct,
}) => {
  if (filteredCategories.length === 0) {
    return (
      <div className="text-center py-12 space-y-2">
        <Tag className="w-6 h-6 text-txt-muted mx-auto" />
        <p className="text-sm font-bold text-txt-primary">قائمة الطعام فارغة</p>
      </div>
    );
  }

  return (
    <div className="-mx-3 sm:-mx-4 lg:mx-0 pb-2">
      {filteredCategories.map((cat) => (
        <section key={cat.id}>
          {/* Category header with a hairline under it */}
          <div className="px-3 sm:px-4 lg:px-0 flex items-center justify-between gap-2 py-3 border-b border-border-subtle">
            <h3 className="text-xs font-bold text-txt-primary flex items-center gap-1.5 min-w-0">
              <Tag className="w-3.5 h-3.5 text-brand-primary shrink-0" aria-hidden="true" />
              <span className="truncate">{cat.name}</span>
            </h3>
            <span className="shrink-0 text-[11px] font-semibold text-txt-muted">
              {cat.products?.length || 0} صنف
            </span>
          </div>

          {/* Items — full width, separated by hairlines */}
          <div className="divide-y divide-border-subtle">
            {cat.products.map((p) => (
              <div
                key={p.id}
                className="px-3 sm:px-4 lg:px-0 py-3 flex items-center gap-3"
              >
                {p.imageUrl ? (
                  <img
                    src={resolveAssetUrl(p.imageUrl)}
                    alt=""
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border border-border-subtle shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-bg-surface-elevated rounded-lg border border-border-subtle shrink-0 flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-txt-muted/50" aria-hidden="true" />
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-0.5 text-right">
                  <h4 className="text-sm font-bold text-txt-primary truncate">{p.name}</h4>
                  {p.description && (
                    <p className="text-[11px] text-txt-muted line-clamp-1">{p.description}</p>
                  )}
                  {Array.isArray(p.ingredients) && p.ingredients.length > 0 && (
                    <div
                      className="flex flex-wrap items-center justify-end gap-1 pt-0.5"
                      aria-label={`المكونات: ${p.ingredients.join('، ')}`}
                    >
                      {p.ingredients.map((ing) => (
                        <span
                          key={ing}
                          className="px-1.5 py-0.5 rounded-md text-[11px] bg-bg-surface-elevated border border-border-default text-txt-muted"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-sm font-bold text-txt-primary font-mono inline-block" dir="ltr">
                    {Number(p.price).toFixed(2)} {currency}
                  </span>
                </div>

                {/* Neutral quick-add chip — same language as the POS product card */}
                <button
                  type="button"
                  onClick={() => onAddProduct(p)}
                  disabled={locked}
                  title="إضافة إلى السلة"
                  className="h-8 px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 active:scale-95 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1 shrink-0 self-center disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="text-xs font-semibold">أضف</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default TableProductsGrid;
