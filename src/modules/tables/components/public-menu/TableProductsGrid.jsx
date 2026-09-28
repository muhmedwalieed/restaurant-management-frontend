import React from 'react';
import { Tag, Utensils, Plus } from 'lucide-react';
import { Button } from '../../../../shared/components/Button.jsx';
import { resolveAssetUrl } from '../../../../lib/asset-url.js';

export const TableProductsGrid = ({
  filteredCategories = [],
  currency = 'EGP',
  locked = false,
  onAddProduct,
}) => {
  if (filteredCategories.length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <Tag className="w-6 h-6 text-txt-muted mx-auto" />
        <p className="text-sm font-bold text-txt-primary">قائمة الطعام فارغة</p>
      </div>
    );
  }

  return (
    <div className="space-y-7 pt-2 pb-36">
      {filteredCategories.map((cat) => (
        <section key={cat.id} className="space-y-3">
          <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
            <Tag className="w-4 h-4 text-brand-primary" />
            <span>{cat.name}</span>
            <span className="text-xs font-semibold text-txt-muted">
              ({cat.products?.length || 0})
            </span>
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            {cat.products.map((p) => (
              <div
                key={p.id}
                className="bg-bg-surface border border-border-default rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm hover:border-border-default/80 transition-all"
              >
                {p.imageUrl ? (
                  <img
                    src={resolveAssetUrl(p.imageUrl)}
                    alt={p.name}
                    className="w-20 h-20 object-cover rounded-lg border border-border-default shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 bg-bg-surface-elevated rounded-lg border border-border-default shrink-0 flex items-center justify-center">
                    <Utensils className="w-6 h-6 text-txt-muted/40" />
                  </div>
                )}

                <div className="flex-1 space-y-1 min-w-0 text-right">
                  <h4 className="text-sm font-bold text-txt-primary truncate">{p.name}</h4>
                  {p.description && (
                    <p className="text-xs text-txt-muted line-clamp-2">{p.description}</p>
                  )}
                  <span
                    className="text-sm font-bold text-brand-primary font-mono inline-block pt-0.5"
                    dir="ltr"
                  >
                    {Number(p.price).toFixed(2)} {currency}
                  </span>
                </div>

                <Button
                  size="sm"
                  icon={Plus}
                  onClick={() => onAddProduct(p)}
                  disabled={locked}
                  className="shrink-0 text-xs py-1.5 px-3 rounded-lg bg-brand-primary text-white hover:bg-brand-primary-hover font-bold self-center shadow-sm"
                >
                  أضف
                </Button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
