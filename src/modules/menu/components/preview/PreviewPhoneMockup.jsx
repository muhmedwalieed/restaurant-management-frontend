import React from 'react';
import { Store, Tag } from 'lucide-react';
import { EmptyState } from '../../../../shared/components/EmptyState.jsx';
import { resolveAssetUrl } from '../../../../lib/asset-url.js';
import { PreviewProductCard } from './PreviewProductCard.jsx';

export const PreviewPhoneMockup = ({
  restaurantInfo,
  categories = [],
  filteredCategories = [],
  selectedCatId,
  onSelectCategory,
}) => {
  const currency = restaurantInfo?.currency || 'EGP';

  return (
    <div className="flex-1 flex flex-col space-y-3 overflow-y-auto text-right custom-scrollbar">
      {/* Restaurant Header Card */}
      <div className="bg-bg-surface border border-border-default rounded-xl p-3 flex items-center gap-3">
        {restaurantInfo?.logoUrl ? (
          <img
            src={resolveAssetUrl(restaurantInfo.logoUrl)}
            alt={restaurantInfo.name}
            className="w-12 h-12 object-cover rounded-lg border border-border-default shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center shrink-0">
            <Store className="w-5 h-5 text-brand-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-txt-primary truncate">
            {restaurantInfo?.name || 'المطعم'}
          </h4>
          <p className="text-[11px] text-txt-muted truncate">
            {restaurantInfo?.description || 'أشهى المأكولات والمشروبات'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              القائمة نشطة
            </span>
            <span className="text-[10px] text-txt-muted font-mono">
              {currency}
            </span>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      {categories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs shrink-0 custom-scrollbar">
          <button
            type="button"
            onClick={() => onSelectCategory('ALL')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
              selectedCatId === 'ALL'
                ? 'bg-white text-slate-950 font-semibold shadow-sm'
                : 'bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white'
            }`}
          >
            الكل ({categories.reduce((acc, cat) => acc + (cat.products?.length || 0), 0)})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                selectedCatId === cat.id
                  ? 'bg-white text-slate-950 font-semibold shadow-sm'
                  : 'bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              {cat.name} ({cat.products?.length || 0})
            </button>
          ))}
        </div>
      )}

      {/* Products list or Empty State */}
      {categories.length === 0 ? (
        <EmptyState
          title="قائمة الطعام فارغة حالياً"
          description="قم بإضافة تصنيفات ومنتجات نشطة لتظهر في القائمة العامة"
          icon={Tag}
        />
      ) : (
        <div className="space-y-4">
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="space-y-2">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
                <h5 className="text-xs font-bold text-txt-primary flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-primary" />
                  <span>{cat.name}</span>
                </h5>
                <span className="text-[11px] text-txt-muted font-mono">
                  {cat.products?.length || 0} صنف
                </span>
              </div>

              {(!cat.products || cat.products.length === 0) ? (
                <p className="text-[11px] text-txt-muted p-2">لا توجد أصناف متاحة بهذا التصنيف</p>
              ) : (
                <div className="space-y-2">
                  {cat.products.map((prod) => (
                    <PreviewProductCard
                      key={prod.id}
                      product={prod}
                      currency={currency}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
