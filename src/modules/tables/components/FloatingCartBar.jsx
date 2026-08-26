import React from 'react';
import { ShoppingCart, ChevronUp } from 'lucide-react';

export const FloatingCartBar = ({
  totalCartItems = 0,
  cartTotalPrice = '0.00',
  currency = 'EGP',
  isCartOpen = false,
  onToggleCart,
}) => {
  return (
    <div className="fixed inset-x-3 sm:inset-x-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 max-w-md mx-auto">
      <div className="bg-bg-surface/95 backdrop-blur-md border border-border-default shadow-2xl rounded-2xl p-2.5 flex items-center gap-2.5">
        {}
        <button
          type="button"
          onClick={onToggleCart}
          className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-slate-950 font-bold rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs transition-all shadow-md active:scale-[0.99]"
        >
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {totalCartItems > 0 ? `${totalCartItems} أصناف` : 'السلة فارغة'}
            </span>
            <span className="opacity-40">|</span>
            <span className="font-mono text-xs" dir="ltr">
              {cartTotalPrice} {currency}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0 font-bold">
            <span>{isCartOpen ? 'إغلاق' : 'عرض السلة / اطلب'}</span>
            <ChevronUp className={`w-4 h-4 transition-transform ${isCartOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default FloatingCartBar;
