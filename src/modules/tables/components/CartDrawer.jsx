import React, { useMemo } from 'react';
import { Users, X, ShoppingCart, Minus, Plus, Bell, Send } from 'lucide-react';
import { Button } from '../../../shared/components/Button.jsx';

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
  isSubmitPending = false,
}) => {
  // Consolidate identical items by product ID/name and addedByName
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

  if (!isOpen) return null;

  const totalPieces = session?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
  const totalUniqueItems = consolidatedItems.length;
  const cartTotalPrice = Number(session?.total || 0).toFixed(2);
  const currency = restaurant?.currency || 'EGP';

  const isAwaiting = session?.status === 'AWAITING_CONFIRMATION';
  const isConfirmed = session?.status === 'CONFIRMED';
  const isClosed = session?.status === 'CLOSED';
  const isLocked = isAwaiting || isConfirmed || isClosed;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Sheet Container */}
      <div className="relative z-10 w-full max-w-md mx-auto bg-bg-surface border-t border-border-default rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] max-h-[85dvh]">
        {/* Top Drag Handle Bar */}
        <div className="w-full pt-3 pb-1 flex justify-center bg-bg-base/60 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-border-default/80" />
        </div>

        {/* ZONE 1: Fixed Header */}
        <div className="px-5 pb-4 pt-1 border-b border-border-default flex items-center justify-between bg-bg-base/60 shrink-0">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-primary" />
              <span>
                الطلبات المشتركة ({totalUniqueItems > 0 ? `${totalUniqueItems} أصناف • ${totalPieces} قطع` : '0 أصناف'})
              </span>
            </h3>
            <p className="text-[11px] text-txt-muted truncate">
              الأعضاء: {(session?.members || []).map((m) => m.name).join('، ') || '—'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated transition-colors"
            aria-label="إغلاق السلة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ZONE 2: Scrollable Items List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
          {consolidatedItems.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <ShoppingCart className="w-8 h-8 text-txt-muted mx-auto opacity-50" />
              <p className="text-xs text-txt-muted">السلة فاضية، اضغط «أضف» على أي صنف من القائمة.</p>
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
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ZONE 3: Pinned Safe-Area Footer */}
        <div className="p-4 border-t border-border-default bg-bg-surface/95 backdrop-blur shrink-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-txt-muted">الإجمالي النهائي:</span>
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
                disabled={isCallWaiterPending}
                className="px-4 py-3 text-xs rounded-xl border-border-default hover:bg-bg-surface-elevated shrink-0"
              >
                <span>الويتر</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Send}
                onClick={onSubmitOrder}
                disabled={(session?.items?.length || 0) === 0 || isSubmitPending}
                className="flex-1 text-xs py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-slate-950 font-bold"
              >
                <span>اطلب الآن ({cartTotalPrice} {currency})</span>
              </Button>
            </div>
          ) : (
            <p className="text-xs text-txt-muted text-center py-1">
              {isAwaiting ? 'أوردرك قيد المراجعة مع الويتر.' : 'شكراً لزيارتكم، نتمنى لكم وجبة شهية.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
