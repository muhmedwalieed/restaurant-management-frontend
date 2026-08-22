import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { getRestaurantProfileApi } from '../../../lib/api/restaurant.api.js';
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
            setProfileError('فشل جلب بيانات المطعم للحصول على رابط المنيو');
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
      title="معاينة المنيو الإلكتروني العام (QR Digital Menu)"
      subtitle="محاكي طريقة عرض المنيو على موبايل العملاء عند مسح رمز الـ QR"
      size="lg"
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Simulator Frame */}
        <div className="w-full max-w-sm bg-bg-base border-4 border-border-default rounded-[32px] p-4 shadow-2xl overflow-hidden relative min-h-[580px] flex flex-col">
          {/* Mobile Camera Notch */}
          <div className="w-28 h-4 bg-border-default rounded-b-xl mx-auto mb-3 shrink-0" />

          {/* Loading state */}
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

          {/* Error state */}
          {(profileError || isMenuError) && !isProfileLoading && !isMenuLoading && (
            <div className="p-6 text-center space-y-3 flex-1 flex flex-col items-center justify-center">
              <Store className="w-10 h-10 text-status-danger mx-auto" />
              <p className="text-xs text-status-danger font-medium">
                {profileError || menuErrorMsg?.message || 'تعذر تحميل المنيو العام'}
              </p>
              <button
                onClick={() => refetch()}
                className="text-xs text-brand-primary underline hover:text-brand-primary/80"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Success state */}
          {!isProfileLoading && !isMenuLoading && !profileError && !isMenuError && (
            <div className="flex-1 flex flex-col space-y-3 overflow-y-auto text-right">
              {/* Header Restaurant Banner */}
              <div className="bg-bg-surface border border-border-default rounded-xl p-3 flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-primary/10 border border-brand-primary/20 rounded-lg flex items-center justify-center shrink-0">
                  {restaurantInfo?.logoUrl ? (
                    <img
                      src={restaurantInfo.logoUrl}
                      alt={restaurantInfo.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Store className="w-6 h-6 text-brand-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-txt-primary truncate">
                    {restaurantInfo?.name || 'مطعمنا'}
                  </h4>
                  <p className="text-[11px] text-txt-muted truncate">
                    {restaurantInfo?.description || 'أشهى المأكولات والمشروبات'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <StatusPill status="success">المنيو نشط</StatusPill>
                    <span className="text-[10px] text-txt-muted">
                      العملة: {restaurantInfo?.currency || 'EGP'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Horizontal Category Nav Pills */}
              {categories.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs shrink-0 no-scrollbar">
                  <button
                    onClick={() => setSelectedCatId('ALL')}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedCatId === 'ALL'
                        ? 'bg-brand-primary text-white'
                        : 'bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary'
                    }`}
                  >
                    الكل ({categories.reduce((acc, cat) => acc + (cat.products?.length || 0), 0)})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCatId(cat.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedCatId === cat.id
                          ? 'bg-brand-primary text-white'
                          : 'bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary'
                      }`}
                    >
                      {cat.name} ({cat.products?.length || 0})
                    </button>
                  ))}
                </div>
              )}

              {/* Categories & Products Feed */}
              {categories.length === 0 ? (
                <EmptyState
                  title="المنيو فارغ حالياً"
                  description="قم بإضافة تصنيفات ومنتجات نشطة لتظهر في المنيو العام"
                  icon={Tag}
                />
              ) : (
                <div className="space-y-4">
                  {filteredCategories.map((cat) => (
                    <div key={cat.id} className="space-y-2">
                      <div className="flex items-center justify-between border-b border-border-default pb-1">
                        <h5 className="text-xs font-bold text-txt-primary flex items-center gap-1">
                          <Tag className="w-3 h-3 text-brand-primary" />
                          <span>{cat.name}</span>
                        </h5>
                        <span className="text-[10px] text-txt-muted">
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
                              className="bg-bg-surface border border-border-default rounded-lg p-2.5 flex items-start justify-between gap-2.5 hover:border-brand-primary/40 transition-colors"
                            >
                              <div className="flex-1 space-y-1">
                                <h6 className="text-xs font-bold text-txt-primary">{prod.name}</h6>
                                {prod.description && (
                                  <p className="text-[10px] text-txt-muted line-clamp-2 leading-relaxed">
                                    {prod.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 pt-1">
                                  <span className="text-xs font-bold text-brand-primary">
                                    {prod.price} {restaurantInfo?.currency || 'EGP'}
                                  </span>
                                  {prod.modifiers && prod.modifiers.length > 0 && (
                                    <span className="text-[9px] bg-bg-surface-elevated px-1.5 py-0.5 rounded text-txt-muted">
                                      +{prod.modifiers.length} إضافات
                                    </span>
                                  )}
                                </div>
                              </div>
                              {prod.imageUrl ? (
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.name}
                                  className="w-14 h-14 object-cover rounded-md border border-border-default shrink-0"
                                />
                              ) : (
                                <div className="w-14 h-14 bg-bg-surface-elevated border border-border-default rounded-md flex items-center justify-center shrink-0">
                                  <Tag className="w-5 h-5 text-txt-muted" />
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
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
