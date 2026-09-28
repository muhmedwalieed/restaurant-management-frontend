import React from 'react';
import { resolveAssetUrl } from '../../../../lib/asset-url.js';

export const PreviewProductCard = ({ product, currency = 'EGP' }) => {
  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-3 flex items-start justify-between gap-3 hover:border-white/10 transition-colors">
      <div className="flex-1 space-y-1 min-w-0">
        <h6 className="text-xs font-bold text-txt-primary truncate">{product.name}</h6>
        {product.description && (
          <p className="text-[11px] text-txt-muted line-clamp-2 leading-relaxed" dir="auto">
            {product.description}
          </p>
        )}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <span className="text-xs font-bold text-white font-mono tabular-nums">
            {Number(product.price).toFixed(2)} {currency}
          </span>
          {product.modifiers && product.modifiers.length > 0 && (
            <span className="text-[10px] bg-white/[0.06] border border-white/[0.04] px-2 py-0.5 rounded-full text-txt-muted">
              +{product.modifiers.length} إضافات
            </span>
          )}
        </div>
      </div>
      {product.imageUrl && (
        <img
          src={resolveAssetUrl(product.imageUrl)}
          alt={product.name}
          className="w-16 h-16 object-cover rounded-lg border border-border-subtle shrink-0"
        />
      )}
    </div>
  );
};
