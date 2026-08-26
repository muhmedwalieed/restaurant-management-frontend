import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { getRestaurantProfileApi } from '../../../lib/api/restaurant.api.js';
import { resolveAssetUrl } from '../../../lib/asset-url.js';
import { usePublicMenuQuery } from '../hooks/useMenu.js';
import { Store, Tag } from 'lucide-react';

export const PublicMenuPreviewModal = ({ isOpen, onClose }) => {
  const [restaurantSlug, setRestaurantSlug] = useState('');
  const [restaurantProfile, setRestaurantProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [selectedCatId, setSelectedCatId] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      setIsProfileLoading(true);
      setProfileError(null);
      getRestaurantProfileApi()
        .then((data) => {
          if (isMounted) {
            setRestaurantProfile(data);
            setRestaurantSlug(data.slug || '');
          }
        })
        .catch(() => {
          if (isMounted) {
            setProfileError('فشل جلب بيانات المطعم للحصول على رابط قائمة الطعام');
          }
        })
        .finally(() => {
          if (isMounted) setIsProfileLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const {
    data: publicData,
    isLoading: isMenuLoading,
    isError: isMenuError,
    error: menuErrorMsg,
    refetch,
  } = usePublicMenuQuery({ slug: restaurantSlug });

  const categories = publicData?.categories || [];
  const restaurantInfo = publicData?.restaurant || restaurantProfile;

  const filteredCategories =
    selectedCatId === 'ALL'
      ? categories
      : categories.filter((cat) => cat.id === selectedCatId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="معاينة القائمة الرقمية للعميل"
      subtitle="محاكي طريقة عرض قائمة الطعام على موبايل العملاء عند مسح رمز الـ QR"
      size="lg"
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        {}
        <div className="w-full max-w-sm bg-bg-base border-4 border-border-default rounded-[32px] p-4 shadow-lg overflow-hidden relative min-h-[580px] flex flex-col">
          {}
          <div className="w-24 h-3.5 bg-border-default rounded-b-xl mx-auto mb-3 shrink-0" />

          {}
          {(isProfileLoading || isMenuLoading) && (
            <div className="p-4 space-y-4 flex-1">
              <LoadingSkeleton height={80} className="w-full rounded-lg" />
              <div className="flex gap-2">
                <LoadingSkeleton height={32} className="w-20 rounded-full" />
                <LoadingSkeleton height={32} className="w-20 rounded-full" />
                <LoadingSkeleton height={32} className="w-20 rounded-full" />
              </div>
              <LoadingSkeleton height={100} className="w-full rounded-lg" />
              <LoadingSkeleton height={100} className="w-full rounded-lg" />
            </div>
          )}

          {}
          {(profileError || isMenuError) && !isProfileLoading && !isMenuLoading && (
            <div className="p-6 text-center space-y-3 flex-1 flex flex-col items-center justify-center">
              <Store className="w-6 h-6 text-status-danger mx-auto" />
              <p className="text-xs text-status-danger font-medium">
                {profileError || menuErrorMsg?.message || 'تعذر تحميل القائمة العامة'}
              </p>
              <button
                onClick={() => refetch()}
                className="text-xs text-brand-primary underline hover:text-brand-primary/80"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {}
          {!isProfileLoading && !isMenuLoading && !profileError && !isMenuError && (
            <div className="flex-1 flex flex-col space-y-3 overflow-y-auto text-right custom-scrollbar">
              {}
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
                      {restaurantInfo?.currency || 'EGP'}
                    </span>
                  </div>
                </div>
              </div>

              {}
              {categories.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs shrink-0 custom-scrollbar">
                  <button
                    type="button"
                    onClick={() => setSelectedCatId('ALL')}
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
                      onClick={() => setSelectedCatId(cat.id)}
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

              {}
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
                            <div
                              key={prod.id}
                              className="bg-bg-surface border border-border-default rounded-xl p-3 flex items-start justify-between gap-3 hover:border-white/10 transition-colors"
                            >
                              <div className="flex-1 space-y-1 min-w-0">
                                <h6 className="text-xs font-bold text-txt-primary truncate">{prod.name}</h6>
                                {prod.description && (
                                  <p className="text-[11px] text-txt-muted line-clamp-2 leading-relaxed" dir="auto">
                                    {prod.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 pt-1 flex-wrap">
                                  <span className="text-xs font-bold text-white font-mono tabular-nums">
                                    {Number(prod.price).toFixed(2)} {restaurantInfo?.currency || 'EGP'}
                                  </span>
                                  {prod.modifiers && prod.modifiers.length > 0 && (
                                    <span className="text-[10px] bg-white/[0.06] border border-white/[0.04] px-2 py-0.5 rounded-full text-txt-muted">
                                      +{prod.modifiers.length} إضافات
                                    </span>
                                  )}
                                </div>
                              </div>
                              {prod.imageUrl && (
                                <img
                                  src={resolveAssetUrl(prod.imageUrl)}
                                  alt={prod.name}
                                  className="w-16 h-16 object-cover rounded-lg border border-border-subtle shrink-0"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
