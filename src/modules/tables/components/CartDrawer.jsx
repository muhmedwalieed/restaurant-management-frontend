import React, { useState, useMemo, useEffect } from 'react';
import { Users, X, ShoppingCart, Minus, Plus, Bell, Send, Trash2, Receipt } from 'lucide-react';
import { Button } from '../../../shared/components/Button.jsx';
import { SessionOrdersList } from './SessionOrdersList.jsx';

export const CartDrawer = ({
  isOpen,
  onClose,
  session,
  restaurant,
  onUpdateQuantity,
  onRemoveItem,
  onCallWaiter,
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

  const isAwaiting = session?.status === 'AWAITING_CONFIRMATION';
  const isConfirmed = session?.status === 'CONFIRMED';
  const isClosed = session?.status === 'CLOSED';
  const isLocked = isAwaiting || isConfirmed || isClosed;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {}
      <div className="relative z-10 w-full max-w-md mx-auto bg-bg-surface border-t border-border-default rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] max-h-[85dvh]">
        {}
        <div className="w-full pt-3 pb-1 flex justify-center bg-bg-base/60 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-border-default/80" />
        </div>

        {}
        <div className="px-5 pb-3 pt-1 flex items-center justify-between bg-bg-base/60 shrink-0 border-b border-border-subtle">
          <div className="space-y-0.5 min-w-0 flex-1">
            <h3 className="text-sm font-bold text-txt-primary truncate">
              {restaurant?.name || 'تفاصيل الجلسة'}
            </h3>
            <p className="text-[11px] text-txt-muted truncate">
              الأعضاء: {(session?.members || []).map((m) => m.name).join('، ') || '—'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated transition-colors shrink-0"
            aria-label="إغلاق السلة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {}
        <div className="px-4 py-2 bg-bg-base/80 border-b border-border-default shrink-0">
          <div className="grid grid-cols-2 gap-1 p-1 bg-bg-surface border border-border-subtle rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('cart')}
              className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'cart'
                  ? 'bg-brand-primary text-slate-950 shadow-sm font-bold'
                  : 'text-txt-muted hover:text-txt-primary'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">السلة الحالية ({totalPieces})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('session')}
              className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'session'
                  ? 'bg-brand-primary text-slate-950 shadow-sm font-bold'
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

        {}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
          {activeTab === 'cart' ? (

            consolidatedItems.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <ShoppingCart className="w-10 h-10 text-txt-muted mx-auto opacity-40" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-txt-primary">السلة فاضية</p>
                  <p className="text-xs text-txt-muted max-w-xs mx-auto">
                    اضغط «أضف» على أي صنف من القائمة لإضافته للسلة الحالية.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="mt-2 text-xs py-2 px-5 rounded-xl border-border-default hover:bg-bg-surface-elevated font-semibold"
                >
                  تصفح القائمة
                </Button>
              </div>
            ) : (
              consolidatedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 bg-bg-base/60 border border-border-subtle rounded-xl p-3"
                >
                  <div className="min-w-0 flex-1 space-y-0.5 text-right">
                    <p className="text-xs font-bold text-txt-primary truncate">{item.productName}</p>
                    <div className="flex items-center gap-2 text-[11px] text-txt-muted">
                      <span className="font-mono font-bold text-brand-primary" dir="ltr">
                        {Number(item.total).toFixed(2)} {currency}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-txt-muted/70" dir="ltr">
                          ({item.quantity} × {Number(item.unitPrice).toFixed(2)} / قطعة)
                        </span>
                      )}
                    </div>
                    {item.addedByName && (
                      <p className="text-[10px] text-brand-primary/90 flex items-center gap-1 pt-0.5">
                        <Users className="w-3 h-3 shrink-0" />
                        <span>أضافها {item.addedByName}</span>
                      </p>
                    )}
                  </div>

                  {!isLocked && (
                    <div className="flex items-center gap-1.5 shrink-0 bg-bg-surface border border-border-default rounded-lg p-1">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            onUpdateQuantity(item.itemIds[0], item.quantity - 1);
                          } else {
                            (item.itemIds || [item.id]).forEach((id) => onRemoveItem(id));
                          }
                        }}
                        className="w-7 h-7 rounded-md bg-bg-base hover:bg-bg-surface-elevated text-txt-primary flex items-center justify-center transition-colors"
                        aria-label={item.quantity === 1 ? 'حذف الصنف' : 'إنقاص الكمية'}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-6 text-center text-xs font-mono font-bold text-txt-primary">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => onUpdateQuantity(item.itemIds[0], item.quantity + 1)}
                        className="w-7 h-7 rounded-md bg-bg-base hover:bg-bg-surface-elevated text-txt-primary flex items-center justify-center transition-colors"
                        aria-label="زيادة الكمية"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => (item.itemIds || [item.id]).forEach((id) => onRemoveItem(id))}
                        className="w-7 h-7 rounded-md hover:text-status-danger hover:bg-status-danger/10 text-txt-muted flex items-center justify-center transition-colors"
                        aria-label="حذف الصنف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )
          ) : (

            <div className="space-y-3">
              {sessionOrders.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Receipt className="w-10 h-10 text-txt-muted mx-auto opacity-40" />
                  <p className="text-sm font-bold text-txt-primary">لا توجد أوردرات سابقة في هذه الجلسة</p>
                  <p className="text-xs text-txt-muted">الأوردرات المؤكدة ستظهر هنا مقسمة بالحساب لكل شخص.</p>
                </div>
              ) : (
                <SessionOrdersList orders={sessionOrders} currency={currency} />
              )}
            </div>
          )}
        </div>

        {}
        <div className="p-4 border-t border-border-default bg-bg-surface/95 backdrop-blur shrink-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-3">
          {activeTab === 'cart' ? (

            consolidatedItems.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-txt-muted">مجموع الطلب الحالي:</span>
                  <span className="text-base font-bold text-txt-primary font-mono" dir="ltr">
                    {cartTotalPrice} {currency}
                  </span>
                </div>

                {!isLocked ? (
                  <div className="flex gap-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Bell}
                      onClick={onCallWaiter}
                      disabled={isCallWaiterPending || waiterCooldownLeft > 0}
                      className="px-4 py-3 text-xs rounded-xl border-border-default hover:bg-bg-surface-elevated shrink-0"
                    >
                      {waiterCooldownLeft > 0
                        ? `الويتر (${String(Math.floor(waiterCooldownLeft / 60)).padStart(2, '0')}:${String(waiterCooldownLeft % 60).padStart(2, '0')})`
                        : 'الويتر'}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Send}
                      onClick={onSubmitOrder}
                      disabled={isSubmitPending}
                      className="flex-1 text-xs py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-slate-950 font-bold"
                    >
                      <span>إرسال الطلب للمطبخ ({cartTotalPrice} {currency})</span>
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-txt-muted text-center py-1">
                    {isAwaiting ? 'أوردرك قيد المراجعة مع الويتر.' : 'شكراً لزيارتكم، نتمنى لكم وجبة شهية.'}
                  </p>
                )}
              </>
            ) : (
              <div className="flex gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Bell}
                  onClick={onCallWaiter}
                  disabled={isCallWaiterPending || waiterCooldownLeft > 0}
                  className="flex-1 py-3 text-xs rounded-xl border-border-default hover:bg-bg-surface-elevated font-bold"
                >
                  {waiterCooldownLeft > 0
                    ? `استدعاء الويتر (${String(Math.floor(waiterCooldownLeft / 60)).padStart(2, '0')}:${String(waiterCooldownLeft % 60).padStart(2, '0')})`
                    : 'استدعاء الويتر'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onClose}
                  className="flex-1 py-3 text-xs rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-slate-950 font-bold"
                >
                  تصفح القائمة
                </Button>
              </div>
            )
          ) : (

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-txt-muted">إجمالي حساب الجلسة:</span>
                <span className="text-base font-bold text-brand-primary font-mono text-lg" dir="ltr">
                  {totalSessionAmount.toFixed(2)} {currency}
                </span>
              </div>

              <div className="flex gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Bell}
                  onClick={onCallWaiter}
                  disabled={isCallWaiterPending || waiterCooldownLeft > 0}
                  className="flex-1 py-3 text-xs rounded-xl border-border-default hover:bg-bg-surface-elevated font-bold"
                >
                  {waiterCooldownLeft > 0
                    ? `الويتر (${String(Math.floor(waiterCooldownLeft / 60)).padStart(2, '0')}:${String(waiterCooldownLeft % 60).padStart(2, '0')})`
                    : 'استدعاء الويتر'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onCallWaiter}
                  disabled={isCallWaiterPending}
                  className="flex-1 py-3 text-xs rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-slate-950 font-bold"
                >
                  طلب الفاتورة والحساب
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
