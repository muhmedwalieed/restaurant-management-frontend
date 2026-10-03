import React from 'react';
import { Trash2, Plus, Minus, ShoppingCart, UtensilsCrossed, ShoppingBag, Bike, User, Phone, MapPin } from 'lucide-react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { getOrderItemModifiers } from '../../constants.js';

const ORDER_TYPES = [
  { id: 'PICKUP', label: 'استلام', Icon: ShoppingBag },
  { id: 'DELIVERY', label: 'توصيل', Icon: Bike },
  { id: 'DINE_IN', label: 'صالة', Icon: UtensilsCrossed },
];

export const PosCartPanel = ({
  cart = [],
  orderType = 'DINE_IN',
  onChangeOrderType,
  onChangeQty,
  onRemoveItem,
  onClearCart,
  tables = [],
  customerInfo = {},
  onChangeCustomerInfo,
  couponCode = '',
  onChangeCouponCode,
  couponState,
  onValidateCoupon,
  onClearCoupon,
  cartTotalAfterDiscount,
  onProceedCheckout,
}) => {
  const { currency } = useCurrency();
  const subtotal = cart.reduce((s, it) => s + (Number(it.price) || 0) * (it.qty || 1), 0);
  const effectiveTotal = typeof cartTotalAfterDiscount === 'number' ? cartTotalAfterDiscount : subtotal;
  const discount = Math.max(0, subtotal - effectiveTotal);

  return (
    <aside className="shrink-0 flex flex-col w-full max-h-[55%] sm:max-h-none sm:h-full sm:w-[360px] bg-white dark:bg-zinc-950 border-t sm:border-t-0 sm:border-r border-zinc-200 dark:border-zinc-800">
      {/* ── Order Type Tabs Header (Strict h-14 Baseline Alignment) ── */}
      <div className="h-14 px-4 flex items-center gap-2 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-transparent">
        <div className="flex-1 grid grid-cols-3 gap-1 p-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 shadow-inner">
          {ORDER_TYPES.map((t) => {
            const Icon = t.Icon;
            const sel = orderType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChangeOrderType?.(t.id)}
                className={`py-1.5 px-2 rounded-full text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  sel
                    ? 'bg-zinc-900 dark:bg-zinc-800 text-white font-medium border-zinc-900 dark:border-zinc-700 shadow-sm'
                    : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 font-medium'
                }`}
              >
                <Icon size={13} strokeWidth={sel ? 2.2 : 1.8} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
        {cart.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shrink-0 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="مسح السلة"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* ── Context Selector: Table (Dine-in) or Customer Name/Phone (Delivery) ── */}
      {orderType === 'DINE_IN' && (
        <div className="px-2.5 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-xs">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={14} className="text-zinc-400 shrink-0" />
            <select
              value={customerInfo?.table || ''}
              onChange={(e) => onChangeCustomerInfo?.({ ...customerInfo, table: e.target.value || null })}
              className="flex-1 min-h-[36px] py-1.5 px-2.5 rounded-lg text-base sm:text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-500"
            >
              <option value="" disabled>اختر الطاولة...</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label || t.name || (t.number != null ? `طاولة ${t.number}` : `طاولة ${t.id}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {orderType === 'DELIVERY' && (
        <div className="px-2.5 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-xs space-y-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <div className="relative">
              <User size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={customerInfo?.name || ''}
                onChange={(e) => onChangeCustomerInfo?.({ ...customerInfo, name: e.target.value })}
                placeholder="اسم العميل *"
                className="w-full min-h-[36px] pr-7 pl-2 py-1 rounded-lg text-base sm:text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 placeholder:text-zinc-400"
              />
            </div>
            <div className="relative">
              <Phone size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="tel"
                dir="ltr"
                value={customerInfo?.phone || ''}
                onChange={(e) => onChangeCustomerInfo?.({ ...customerInfo, phone: e.target.value })}
                placeholder="رقم الهاتف *"
                className="w-full min-h-[36px] pr-7 pl-2 py-1 rounded-lg text-base sm:text-xs font-medium text-right bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 placeholder:text-zinc-400 font-mono"
              />
            </div>
          </div>
          <div className="relative">
            <MapPin size={12} className="absolute right-2 top-2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={customerInfo?.address || ''}
              onChange={(e) => onChangeCustomerInfo?.({ ...customerInfo, address: e.target.value })}
              placeholder="عنوان التوصيل بالتفصيل *"
              className="w-full min-h-[36px] pr-7 pl-2 py-1 rounded-lg text-base sm:text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 placeholder:text-zinc-400"
            />
          </div>
        </div>
      )}

      {/* ── Cart Items List ── */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar min-h-0 bg-zinc-50/60 dark:bg-black/40">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 shadow-xs">
              <ShoppingCart size={22} />
            </div>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">السلة فارغة</p>
            <p className="text-xs mt-1 text-zinc-400 dark:text-zinc-500">اضغط على أي صنف لإضافته</p>
          </div>
        ) : cart.map((item, idx) => (
          <div
            key={`${item.id || item.productId}_${idx}`}
            className="py-2.5 px-3 rounded-xl flex flex-col gap-2 border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug flex-1 truncate">
                {item.name}
              </span>
              <span className="inline-flex items-baseline gap-1 shrink-0" dir="ltr">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                  {(() => {
                    const p = Number(item.price) * item.qty;
                    return p % 1 === 0 ? p.toFixed(0) : p.toFixed(2);
                  })()}
                </span>
                <span className="text-xs text-zinc-400">
                  {currency || 'ج.م'}
                </span>
              </span>
            </div>

            {(() => { const mods = getOrderItemModifiers(item); return mods.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {mods.map((m, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                    + {m.name}{m.quantity > 1 ? ` ×${m.quantity}` : ''}
                  </span>
                ))}
              </div>
            ) : null; })()}

            <div className="flex items-center justify-between mt-1 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              {/* Stepper with comfortable touch targets */}
              <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-xs transition-colors">
                <button
                  type="button"
                  onClick={() => onChangeQty(idx, -1)}
                  className="w-6 h-6 rounded flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/90 dark:hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer"
                  title="تقليل الكمية"
                >
                  <Minus size={12} />
                </button>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 w-5 text-center font-mono">
                  {item.qty}
                </span>
                <button
                  type="button"
                  onClick={() => onChangeQty(idx, 1)}
                  className="w-6 h-6 rounded flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/90 dark:hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer"
                  title="زيادة الكمية"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Accessible Touch Delete Button */}
              <button
                type="button"
                onClick={() => onRemoveItem(idx)}
                className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                title="حذف من السلة"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Coupon Row ── */}
      <div className="px-2.5 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-1.5">
        <input type="text" value={couponCode || ''} onChange={(e) => onChangeCouponCode?.(e.target.value.toUpperCase())} placeholder="كود الخصم" className="flex-1 min-h-[36px] py-1.5 px-2.5 rounded-lg text-base sm:text-xs font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400" />
        {couponState?.id ? (
          <button type="button" onClick={onClearCoupon} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-800 cursor-pointer">إزالة</button>
        ) : (
          <button type="button" onClick={onValidateCoupon} disabled={!couponCode?.trim() || couponState?.loading} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 disabled:opacity-40 cursor-pointer">تطبيق</button>
        )}
      </div>
      {couponState?.id && <div className="px-3 pb-1 text-[11px] font-bold text-emerald-600">✓ {couponState.code} — خصم {couponState.discountAmount.toFixed(0)} {currency || 'ج.م'}</div>}
      {couponState?.error && <div className="px-3 pb-1 text-[11px] font-bold text-red-500">{couponState.error}</div>}

      {/* ── Summary & Checkout ── */}
      <div className="p-3 shrink-0 space-y-3 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
        {discount > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">المجموع</span><span className="font-mono text-zinc-500 line-through">{subtotal.toFixed(0)} {currency || 'ج.م'}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex items-center justify-between text-xs font-bold text-emerald-600">
            <span>الخصم</span><span className="font-mono">- {discount.toFixed(0)} {currency || 'ج.م'}</span>
          </div>
        )}
        <div className="rounded-xl p-3 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">الإجمالي</span>
          <span className="inline-flex items-baseline gap-1" dir="ltr">
            <span className="text-xl font-bold font-mono text-zinc-950 dark:text-zinc-50">{effectiveTotal % 1 === 0 ? effectiveTotal.toFixed(0) : effectiveTotal.toFixed(2)}</span>
            <span className="text-xs text-zinc-400">{currency || 'ج.م'}</span>
          </span>
        </div>
        <button type="button" disabled={cart.length === 0} onClick={onProceedCheckout} className="w-full h-11 rounded-full font-bold text-sm flex items-center justify-center gap-2 cursor-pointer bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-sm">متابعة الدفع</button>
      </div>
    </aside>
  );
};

export default PosCartPanel;

