import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTableMenuApi } from '../../../lib/api/tables.api.js';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { resolveAssetUrl } from '../../../lib/asset-url.js';
import { Store, Tag, AlertCircle, UtensilsCrossed } from 'lucide-react';

/**
 * Public table menu page (opened when scanning a table QR).
 * No auth required — fetches the restaurant public menu for the table.
 */
export const PublicTableMenuPage = () => {
  const { qrToken } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCatId, setSelectedCatId] = useState('ALL');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getTableMenuApi(qrToken);
        if (active) setData(res);
      } catch (err) {
        if (active) setError(err?.message || 'تعذر تحميل قائمة الطعام، رمز QR غير صالح أو منتهي.');
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [qrToken]);

  const categories = data?.categories || [];
  const restaurant = data?.restaurant || {};
  const branch = data?.branch || {};
  const table = data?.table || {};

  const filteredCategories =
    selectedCatId === 'ALL' ? categories : categories.filter((c) => c.id === selectedCatId);

  const totalProducts = categories.reduce((acc, c) => acc + (c.products?.length || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-md space-y-4">
          <LoadingSkeleton height={90} className="w-full rounded-lg" />
          <LoadingSkeleton height={40} className="w-40 rounded-full mx-auto" />
          <LoadingSkeleton height={120} className="w-full rounded-lg" />
          <LoadingSkeleton height={120} className="w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-4">
        <div className="bg-bg-surface border border-status-danger/30 rounded-lg p-8 text-center space-y-4 max-w-sm">
          <AlertCircle className="w-6 h-6 text-status-danger mx-auto" />
          <h1 className="text-lg font-bold text-txt-primary">قائمة الطعام غير متاحة</h1>
          <p className="text-sm text-txt-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Restaurant header */}
      <div className="border-b border-border-default">
        <div className="max-w-md mx-auto px-4 py-6 text-center">
          {restaurant.logoUrl ? (
            <img
              src={resolveAssetUrl(restaurant.logoUrl)}
              alt={restaurant.name}
              className="w-20 h-20 object-cover rounded-lg border border-border-default mx-auto"
            />
          ) : (
            <Store className="w-10 h-10 text-brand-primary mx-auto" />
          )}
          <h1 className="mt-4 text-2xl font-bold text-txt-primary">{restaurant.name || 'مطعمنا'}</h1>
          {restaurant.description && (
            <p className="mt-1 text-sm text-txt-muted">{restaurant.description}</p>
          )}
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            {table.label && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-bg-surface border border-border-default text-txt-primary">
                <UtensilsCrossed className="w-4 h-4 text-brand-primary" />
                الطاولة {table.label}
              </span>
            )}
            {branch.name && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-bg-surface border border-border-default text-txt-muted">
                {branch.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Menu body */}
      <div className="max-w-md mx-auto px-4 py-5 space-y-5">
        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setSelectedCatId('ALL')}
              className={`px-3 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${
                selectedCatId === 'ALL'
                  ? 'bg-brand-primary text-white'
                  : 'bg-bg-surface border border-border-default text-txt-muted'
              }`}
            >
              الكل ({totalProducts})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCatId(c.id)}
                className={`px-3 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${
                  selectedCatId === c.id
                    ? 'bg-brand-primary text-white'
                    : 'bg-bg-surface border border-border-default text-txt-muted'
                }`}
              >
                {c.name} ({c.products?.length || 0})
              </button>
            ))}
          </div>
        )}

        {/* Products feed */}
        {categories.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Tag className="w-6 h-6 text-txt-muted mx-auto" />
            <p className="text-sm font-bold text-txt-primary">قائمة الطعام فارغة حاليًا</p>
            <p className="text-xs text-txt-muted">برجاء العودة لاحقًا، يتم تجهيز القائمة.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCategories.map((cat) => (
              <div key={cat.id} className="space-y-3">
                <div className="flex items-center justify-between border-b border-border-default pb-2">
                  <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                    <Tag className="w-4 h-4 text-brand-primary" />
                    {cat.name}
                  </h3>
                  <span className="text-xs text-txt-muted">{cat.products?.length || 0} صنف</span>
                </div>

                {!cat.products || cat.products.length === 0 ? (
                  <p className="text-xs text-txt-muted p-3">لا توجد أصناف متاحة بهذا التصنيف.</p>
                ) : (
                  <div className="space-y-3">
                    {cat.products.map((p) => (
                      <div
                        key={p.id}
                        className="bg-bg-surface border border-border-default rounded-lg p-3 flex items-start justify-between gap-3 hover:border-brand-primary/40 transition-colors"
                      >
                        <div className="flex-1 space-y-1 min-w-0">
                          <h4 className="text-sm font-bold text-txt-primary">{p.name}</h4>
                          {p.description && (
                            <p className="text-xs text-txt-muted line-clamp-2 leading-relaxed">{p.description}</p>
                          )}
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-sm font-bold text-brand-primary">
                              {Number(p.price).toFixed(2)} {restaurant.currency || 'EGP'}
                            </span>
                            {p.modifiers && p.modifiers.length > 0 && (
                              <span className="text-xs bg-bg-surface-elevated px-2 py-1 rounded text-txt-muted">
                                +{p.modifiers.length} إضافات
                              </span>
                            )}
                          </div>
                        </div>
                        {p.imageUrl ? (
                          <img
                            src={resolveAssetUrl(p.imageUrl)}
                            alt={p.name}
                            className="w-16 h-16 object-cover rounded-lg border border-border-default shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-bg-surface-elevated border border-border-default rounded-lg flex items-center justify-center shrink-0">
                            <UtensilsCrossed className="w-6 h-6 text-txt-muted" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 pb-8 text-center">
          <Link to="/">
            <Button variant="outline" size="sm">
              الرجوع للرئيسية
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};