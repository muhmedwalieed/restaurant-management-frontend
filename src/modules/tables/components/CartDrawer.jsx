import React, { useState, useMemo, useEffect } from 'react';
import { X, ShoppingCart, Receipt } from 'lucide-react';
import { SessionOrdersList } from './SessionOrdersList.jsx';
import { CartDrawerItemList } from './cart/CartDrawerItemList.jsx';
import { CartDrawerFooterActions } from './cart/CartDrawerFooterActions.jsx';

export const CartDrawer = ({
  isOpen,
  onClose,
  session,
  restaurant,
  currentMemberName,
  onUpdateQuantity,
  onRemoveItem,
  onCallWaiter,
  onRequestBill,
  onSubmitOrder,
  isCallWaiterPending = false,
  waiterCooldownLeft = 0,
  isSubmitPending = false,
  defaultTab = 'cart',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const consolidatedItems = useMemo(() => {
    if (!session?.items) return [];
    const map = new Map();
    for (const item of session.items) {
      const key = `${item.productId || item.productName}_${item.addedByName || ''}`;
      if (map.has(key)) {
        const existing = map.get(key);
        existing.quantity += item.quantity || 1;
        existing.total =
          (existing.total || 0) +
          (Number(item.total) || Number(item.unitPrice) * (item.quantity || 1));
        existing.itemIds.push(item.id);
      } else {
        map.set(key, {
          ...item,
          quantity: item.quantity || 1,
          total: Number(item.total) || Number(item.unitPrice) * (item.quantity || 1),
          itemIds: [item.id],
        });
      }
    }
    return Array.from(map.values());
  }, [session?.items]);

  useEffect(() => {
    if (isOpen) {
      if (consolidatedItems.length > 0) {
        setActiveTab('cart');
      } else if ((session?.orders || []).length > 0) {
        setActiveTab('session');
      } else {
        setActiveTab('cart');
      }
    }
  }, [isOpen, consolidatedItems.length, session?.orders]);

  if (!isOpen) return null;

  const totalPieces = session?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
  const cartTotalPrice = Number(session?.total || 0).toFixed(2);
  const currency = restaurant?.currency || 'EGP';

  const sessionOrders = session?.orders || [];
  const totalSessionAmount = sessionOrders.reduce((sum, o) => {
    return o.status !== 'CANCELLED' ? sum + Number(o.total || 0) : sum;
  }, 0);

  const isLocked = session?.status === 'CLOSED';
  const isAwaiting = session?.status === 'AWAITING_CONFIRMATION';

  const handleItemDecrement = async (item) => {
    if (item.addedByName && currentMemberName && item.addedByName !== currentMemberName) return;
    if (item.quantity > 1) {
      await onUpdateQuantity(item.itemIds?.[0] || item.id, item.quantity - 1);
    } else {
      await handleItemRemove(item);
    }
  };

  const handleItemIncrement = async (item) => {
    if (item.addedByName && currentMemberName && item.addedByName !== currentMemberName) return;
    await onUpdateQuantity(item.itemIds?.[0] || item.id, item.quantity + 1);
  };

  const handleItemRemove = async (item) => {
    if (item.addedByName && currentMemberName && item.addedByName !== currentMemberName) return;
    const ids = item.itemIds || [item.id];
    for (const id of ids) {
      await onRemoveItem(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md mx-auto bg-bg-surface border-t border-border-default rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] max-h-[85dvh]">
        <div className="w-full pt-3 pb-1 flex justify-center bg-bg-base/60 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-border-default/80" />
        </div>

        {/* Drawer Header */}
        <div className="p-4 border-b border-border-default flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-txt-primary">سلة طلبات الطاولة</h2>
              <p className="text-xs text-txt-muted truncate">
                {restaurant?.name || 'مطعمنا'} · طاولة {session?.tableLabel || session?.tableNumber || '—'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-4 py-2 bg-bg-base/80 border-b border-border-default shrink-0">
          <div className="grid grid-cols-2 gap-1 p-1 bg-bg-surface border border-border-subtle rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('cart')}
              className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'cart'
                  ? 'bg-brand-primary text-white shadow-sm font-bold'
                  : 'text-txt-muted hover:text-txt-primary'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">السلة الحالية ({totalPieces})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('session')}
              className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'session'
                  ? 'bg-brand-primary text-white shadow-sm font-bold'
                  : 'text-txt-muted hover:text-txt-primary'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                أوردرات الجلسة {totalSessionAmount > 0 ? `(${totalSessionAmount.toFixed(0)} ${currency})` : `(${sessionOrders.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {activeTab === 'cart' ? (
            <CartDrawerItemList
              consolidatedItems={consolidatedItems}
              currency={currency}
              currentMemberName={currentMemberName}
              isLocked={isLocked}
              onClose={onClose}
              onDecrement={handleItemDecrement}
              onIncrement={handleItemIncrement}
              onRemove={handleItemRemove}
            />
          ) : (
            <div className="space-y-3">
              {sessionOrders.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Receipt className="w-10 h-10 text-txt-muted mx-auto opacity-40" />
                  <p className="text-sm font-bold text-txt-primary">لا توجد طلبات سابقة في هذه الجلسة</p>
                  <p className="text-xs text-txt-muted">الطلبات المؤكدة ستظهر هنا مفصلة بالحساب لكل عضو.</p>
                </div>
              ) : (
                <SessionOrdersList orders={sessionOrders} currency={currency} />
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <CartDrawerFooterActions
          activeTab={activeTab}
          consolidatedItems={consolidatedItems}
          cartTotalPrice={cartTotalPrice}
          currency={currency}
          totalSessionAmount={totalSessionAmount}
          isLocked={isLocked}
          isAwaiting={isAwaiting}
          waiterCooldownLeft={waiterCooldownLeft}
          isCallWaiterPending={isCallWaiterPending}
          isSubmitPending={isSubmitPending}
          session={session}
          onCallWaiter={onCallWaiter}
          onRequestBill={onRequestBill}
          onSubmitOrder={onSubmitOrder}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default CartDrawer;
