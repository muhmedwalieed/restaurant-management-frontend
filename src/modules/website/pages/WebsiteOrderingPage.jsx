import React from 'react';
import { useParams } from 'react-router-dom';
import { useWebsiteOrdering } from '../hooks/useWebsiteOrdering.js';
import { WebsiteProductsGrid } from '../components/WebsiteProductsGrid.jsx';
import { WebsiteCartSheet } from '../components/WebsiteCartSheet.jsx';
import { WebsiteOrderTrackingTab } from '../components/WebsiteOrderTrackingTab.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { resolveAssetUrl } from '../../../lib/asset-url.js';
import { Store, AlertCircle } from 'lucide-react';

export const WebsiteOrderingPage = () => {
  const { slug } = useParams();
  const {
    data,
    isLoading,
    error,
    tab,
    setTab,
    selectedCatId,
    setSelectedCatId,
    cart,
    addToCart,
    changeQty,
    cartTotal,
    cartCount,
    name,
    setName,
    phone,
    setPhone,
    orderType,
    setOrderType,
    address,
    setAddress,
    placing,
    placedOrder,
    submitError,
    placeOrder,
    trackNumber,
    setTrackNumber,
    trackPhone,
    setTrackPhone,
    trackResult,
    trackError,
    tracking,
    handleTrack,
  } = useWebsiteOrdering(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-md space-y-4">
          <LoadingSkeleton height={90} className="w-full rounded-lg" />
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
          <h1 className="text-lg font-bold text-txt-primary">المطعم غير متاح</h1>
          <p className="text-sm text-txt-muted">{error}</p>
        </div>
      </div>
    );
  }

  const categories = data?.categories || [];
  const restaurant = data?.restaurant || {};

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Top Banner */}
      <div className="border-b border-border-default bg-bg-surface/50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {restaurant.logoUrl ? (
              <img
                src={resolveAssetUrl(restaurant.logoUrl)}
                alt={restaurant.name}
                className="w-16 h-16 object-cover rounded-xl border border-border-default"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                <Store className="w-8 h-8" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-txt-primary">{restaurant.name || 'مطعمنا'}</h1>
              {restaurant.description && (
                <p className="text-sm text-txt-muted mt-0.5">{restaurant.description}</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('order')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                tab === 'order'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary'
              }`}
            >
              الطلب الآن
            </button>
            <button
              type="button"
              onClick={() => setTab('track')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                tab === 'track'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary'
              }`}
            >
              تتبع الطلب
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {tab === 'track' ? (
          <WebsiteOrderTrackingTab
            trackNumber={trackNumber}
            setTrackNumber={setTrackNumber}
            trackPhone={trackPhone}
            setTrackPhone={setTrackPhone}
            trackResult={trackResult}
            trackError={trackError}
            tracking={tracking}
            onTrack={handleTrack}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <WebsiteProductsGrid
                categories={categories}
                selectedCatId={selectedCatId}
                onSelectCategory={setSelectedCatId}
                onAddToCart={addToCart}
              />
            </div>

            <div className="lg:sticky lg:top-4">
              <WebsiteCartSheet
                cart={cart}
                cartTotal={cartTotal}
                cartCount={cartCount}
                onChangeQty={changeQty}
                name={name}
                setName={setName}
                phone={phone}
                setPhone={setPhone}
                orderType={orderType}
                setOrderType={setOrderType}
                address={address}
                setAddress={setAddress}
                placing={placing}
                placedOrder={placedOrder}
                submitError={submitError}
                onPlaceOrder={placeOrder}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
