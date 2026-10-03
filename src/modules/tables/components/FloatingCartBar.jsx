import React from 'react';
import { ChevronUp } from 'lucide-react';

export const FloatingCartBar = ({
  totalCartItems = 0,
  cartTotalPrice = '0.00',
  currency = 'EGP',
  isCartOpen = false,
  onToggleCart,
}) => {
  return (
    <div className="fixed inset-x-3 sm:inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 max-w-md mx-auto">
      {/* Translucent glass bar — no solid background */}
      <button
        type="button"
        onClick={onToggleCart}
        aria-expanded={isCartOpen}
        className="w-full min-h-[52px] rounded-2xl px-3.5 flex items-center justify-between gap-3 text-xs font-bold text-txt-primary bg-bg-surface/50 backdrop-blur-xl border border-border-subtle shadow-lg transition-colors hover:bg-bg-surface/70 active:scale-[0.99] cursor-pointer"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="truncate">
            {totalCartItems > 0 ? `${totalCartItems} أصناف` : 'السلة فارغة'}
          </span>
          <span className="text-txt-muted opacity-60" aria-hidden="true">|</span>
          <span className="font-mono shrink-0" dir="ltr">
            {cartTotalPrice} {currency}
          </span>
        </span>

        <span className="flex items-center gap-1 shrink-0">
          <span className="sm:hidden">{isCartOpen ? 'إغلاق' : 'السلة'}</span>
          <span className="hidden sm:inline">{isCartOpen ? 'إغلاق' : 'عرض السلة / اطلب'}</span>
          <ChevronUp
            className={`w-4 h-4 transition-transform ${isCartOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </span>
      </button>
    </div>
  );
};

export default FloatingCartBar;
