import React from 'react';
import { useParams } from 'react-router-dom';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog.jsx';
import { AlertCircle } from 'lucide-react';
import { CartDrawer } from '../components/CartDrawer.jsx';
import { FloatingCartBar } from '../components/FloatingCartBar.jsx';
import { TablePinEntryCard } from '../components/public-menu/TablePinEntryCard.jsx';
import { TableMenuHeader } from '../components/public-menu/TableMenuHeader.jsx';
import { TableSessionBanners } from '../components/public-menu/TableSessionBanners.jsx';
import { TableCategoryNav } from '../components/public-menu/TableCategoryNav.jsx';
import { TableProductsGrid } from '../components/public-menu/TableProductsGrid.jsx';
import { TableSidebarCart } from '../components/public-menu/TableSidebarCart.jsx';
import { usePublicTableMenu } from '../hooks/usePublicTableMenu.js';

export const PublicTableMenuPage = () => {
  const { qrToken } = useParams();
  const {
    isMenuLoading,
    menuError,
    menuErrorCode,
    categories,
    restaurant,
    table,
    branch,
    filteredCategories,
    totalProducts,
    selectedCatId,
    setSelectedCatId,
    myName,
    setMyName,
    pin,
    setPin,
    joinError,
    joinLoading,
    handleJoin,
    sessionId,
    session,
    isSessionLoading,
    cartRows,
    totalCartItems,
    cartTotalPrice,
    currency,
    isAwaiting,
    isClosed,
    locked,
    localFlash,
    setLocalFlash,
    waiterSent,
    waiterCooldownLeft,
    isCartOpen,
    setIsCartOpen,
    confirmWaiter,
    setConfirmWaiter,
    waiterCallType,
    confirmSubmit,
    setConfirmSubmit,
    callWaiterMutation,
    updateMutation,
    removeMutation,
    submitMutation,
    handleAdd,
    handleLeaveSession,
    handleMemberExpired,
    handleConfirmWaiter,
    handleConfirmSubmit,
    requestWaiter,
    requestBill,
    requestSubmit,
  } = usePublicTableMenu(qrToken);

  if (isMenuLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-2xl space-y-4">
          <LoadingSkeleton height={96} className="w-full rounded-2xl" />
          <LoadingSkeleton height={40} className="w-44 rounded-full mx-auto" />
          <div className="grid sm:grid-cols-2 gap-3">
            <LoadingSkeleton height={180} className="rounded-2xl" />
            <LoadingSkeleton height={180} className="rounded-2xl" />
            <LoadingSkeleton height={180} className="rounded-2xl" />
            <LoadingSkeleton height={180} className="rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (menuError) {
    const isInvalidLink =
      menuErrorCode === 'NOT_FOUND' || menuErrorCode === 'AUTHENTICATION_ERROR';
    const isConnectionIssue =
      menuErrorCode === 'NETWORK_ERROR' || menuErrorCode === 'SERVICE_UNAVAILABLE';

    const title = isInvalidLink
      ? 'رابط الطاولة غير صالح'
      : isConnectionIssue
        ? 'تعذر الاتصال'
        : 'تعذر تحميل القائمة';

    const description = isInvalidLink
      ? 'الكود اللي فتحت بيه الصفحة مش صالح أو انتهت صلاحيته. امسح كود QR الموجود على الطاولة مرة تانية.'
      : isConnectionIssue
        ? 'مقدرناش نوصل بالخادم. اتأكد إن النت شغال وبعدين جرّب تاني.'
        : menuError;

    const tone = isInvalidLink || !isConnectionIssue ? 'danger' : 'warning';

    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm bg-bg-surface border border-border-default rounded-2xl p-6 sm:p-8 text-center space-y-6 animate-fadeUp">
          <span
            className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${
              tone === 'danger' ? 'bg-status-danger/10' : 'bg-status-warning/10'
            }`}
          >
            <AlertCircle
              aria-hidden="true"
              className={`w-7 h-7 ${
                tone === 'danger' ? 'text-status-danger' : 'text-status-warning'
              }`}
            />
          </span>

          <div className="space-y-2">
            <h1 className="text-lg font-bold text-txt-primary">{title}</h1>
            <p className="text-sm text-txt-muted leading-relaxed">{description}</p>
          </div>

          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              radius="lg"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              إعادة المحاولة
            </Button>
            {isInvalidLink && (
              <p className="text-xs text-txt-dim leading-relaxed">
                لو الصفحة ما فتحتش كمان مرة، كلّم أحد أفراد الخدمة.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!sessionId || !session) {
    if (sessionId && (isSessionLoading || joinLoading)) {
      return (
        <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-8">
          <LoadingSkeleton height={180} className="w-full max-w-md rounded-2xl" />
        </div>
      );
    }
    return (
      <TablePinEntryCard
        restaurant={restaurant}
        table={table}
        branch={branch}
        myName={myName}
        onChangeMyName={setMyName}
        pin={pin}
        onChangePin={setPin}
        joinError={joinError}
        joinLoading={joinLoading}
        onJoin={handleJoin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <TableMenuHeader
        restaurant={restaurant}
        table={table}
        branch={branch}
        session={session}
        isClosed={isClosed}
        onLeaveSession={handleLeaveSession}
      />

      <TableSessionBanners
        localFlash={localFlash}
        session={session}
        waiterSent={waiterSent}
        isAwaiting={isAwaiting}
        isClosed={isClosed}
      />

      <main className="max-w-6xl mx-auto px-3 sm:px-4 pt-0 pb-28 lg:pb-10">
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 lg:items-start">
          <div className="min-w-0">
            <TableCategoryNav
              categories={categories}
              selectedCatId={selectedCatId}
              onSelectCategory={setSelectedCatId}
              totalProducts={totalProducts}
            />

            <TableProductsGrid
              filteredCategories={filteredCategories}
              currency={currency}
              locked={locked}
              onAddProduct={handleAdd}
            />
          </div>

          <TableSidebarCart
            cartRows={cartRows}
            totalCartItems={totalCartItems}
            cartTotalPrice={cartTotalPrice}
            currency={currency}
            myName={myName}
            locked={locked}
            isAwaiting={isAwaiting}
            sessionOrders={session?.orders || []}
            waiterCooldownLeft={waiterCooldownLeft}
            isCallWaiterPending={callWaiterMutation.isPending}
            isSubmitPending={submitMutation.isPending}
            onUpdateQuantity={(itemId, quantity) => updateMutation.mutate({ itemId, quantity })}
            onRemoveItem={(itemId) => removeMutation.mutate(itemId)}
            onRequestWaiter={requestWaiter}
            onRequestSubmit={requestSubmit}
          />
        </div>
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        session={session}
        restaurant={restaurant}
        currentMemberName={myName}
        onUpdateQuantity={async (itemId, quantity) => {
          try {
            await updateMutation.mutateAsync({ itemId, quantity });
          } catch (err) {
            if (err?.status === 401) handleMemberExpired();
            else {
              setLocalFlash(err?.message || 'تعذر تحديث الكمية');
              setTimeout(() => setLocalFlash(null), 3000);
            }
          }
        }}
        onRemoveItem={async (itemId) => {
          try {
            await removeMutation.mutateAsync(itemId);
            setLocalFlash('تم حذف الصنف من السلة');
            setTimeout(() => setLocalFlash(null), 2500);
          } catch (err) {
            if (err?.status === 401) handleMemberExpired();
            else {
              setLocalFlash(err?.message || 'تعذر حذف الصنف');
              setTimeout(() => setLocalFlash(null), 3000);
            }
          }
        }}
        onCallWaiter={requestWaiter}
        onRequestBill={requestBill}
        onSubmitOrder={requestSubmit}
        isCallWaiterPending={callWaiterMutation.isPending}
        waiterCooldownLeft={waiterCooldownLeft}
        isSubmitPending={submitMutation.isPending}
      />

      <div className="lg:hidden">
        <FloatingCartBar
          totalCartItems={totalCartItems}
          cartTotalPrice={cartTotalPrice}
          currency={currency}
          isCartOpen={isCartOpen}
          onToggleCart={() => setIsCartOpen(!isCartOpen)}
        />
      </div>

      <ConfirmDialog
        isOpen={confirmWaiter}
        onClose={() => setConfirmWaiter(false)}
        title={waiterCallType === 'BILL' ? 'طلب الفاتورة والحساب' : 'استدعاء الويتر'}
        message={
          waiterCallType === 'BILL'
            ? 'هل تريد طلب الفاتورة والحساب إلى طاولتك الآن؟'
            : 'هل تريد فعلاً استدعاء الويتر إلى طاولتك؟'
        }
        confirmLabel={waiterCallType === 'BILL' ? 'نعم، اطلب الفاتورة' : 'نعم، استدعِ الويتر'}
        isLoading={callWaiterMutation.isPending}
        onConfirm={handleConfirmWaiter}
      />

      <ConfirmDialog
        isOpen={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        title="إرسال الطلب"
        message={`هل تريد إرسال أوردرك الحالي (${totalCartItems} صنف بقيمة ${cartTotalPrice} ${currency}) للمراجعة؟`}
        confirmLabel="إرسال الطلب"
        isLoading={submitMutation.isPending}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
};

export default PublicTableMenuPage;
