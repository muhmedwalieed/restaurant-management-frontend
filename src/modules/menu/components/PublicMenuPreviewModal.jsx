import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { getRestaurantProfileApi } from '../../../lib/api/restaurant.api.js';
import { usePublicMenuQuery } from '../hooks/useMenu.js';
import { Store } from 'lucide-react';
import { PreviewPhoneMockup } from './preview/PreviewPhoneMockup.jsx';

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
        <div className="w-full max-w-sm bg-bg-base border-4 border-border-default rounded-[32px] p-4 shadow-lg overflow-hidden relative min-h-[580px] flex flex-col">
          {/* Phone Notch */}
          <div className="w-24 h-3.5 bg-border-default rounded-b-xl mx-auto mb-3 shrink-0" />

          {/* Loading Skeleton */}
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

          {/* Error State */}
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

          {/* Phone Screen Mockup */}
          {!isProfileLoading && !isMenuLoading && !profileError && !isMenuError && (
            <PreviewPhoneMockup
              restaurantInfo={restaurantInfo}
              categories={categories}
              filteredCategories={filteredCategories}
              selectedCatId={selectedCatId}
              onSelectCategory={setSelectedCatId}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PublicMenuPreviewModal;
