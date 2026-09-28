import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  User,
  MapPin,
  UtensilsCrossed,
} from 'lucide-react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';

const ORDER_TYPES_LABELS = {
  DINE_IN: 'صالة',
  PICKUP: 'استلام',
  DELIVERY: 'توصيل',
};

export const PosCartPanel = ({
  cart = [],
  orderType = 'DINE_IN',
  customerInfo = {},
  selectedTableLabel,
  onOpenCustomerModal,
  onChangeQty,
  onRemoveItem,
  onClearCart,
  onProceedCheckout,
}) => {
  const { currency } = useCurrency();
  const subtotal = cart.reduce((s, it) => s + (Number(it.price) || 0) * (it.qty || 1), 0);
  const total = subtotal;

  return (
    <aside
      className="w-full sm:w-80 shrink-0 flex flex-col border-r select-none h-full"
      style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}
    >
      {/* Header with Order Type & Customer Shortcut */}
      <div
        className="p-3 border-b flex items-center justify-between gap-2 shrink-0"
        style={{ borderColor: 'var(--bd)' }}
      >
        <button
          type="button"
          onClick={onOpenCustomerModal}
          className="flex items-center gap-2 p-1.5 rounded-lg border hover:bg-white/5 transition-colors cursor-pointer text-right min-w-0 flex-1"
          style={{ borderColor: 'var(--bd)' }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--ac-bg)', color: 'var(--ac)' }}
          >
            {orderType === 'DINE_IN' ? (
              <UtensilsCrossed size={14} />
            ) : orderType === 'DELIVERY' ? (
              <MapPin size={14} />
            ) : (
              <User size={14} />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold block truncate" style={{ color: 'var(--t1)' }}>
              {orderType === 'DINE_IN'
                ? selectedTableLabel ? `طاولة ${selectedTableLabel}` : 'اختر طاولة...'
                : customerInfo.name || customerInfo.phone || 'بيانات العميل...'}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--t3)' }}>
              {ORDER_TYPES_LABELS[orderType]} — اضغط للتعديل
            </span>
          </div>
        </button>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="مسح السلة بالكامل"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <ShoppingCart size={32} className="text-slate-600 mb-2" />
            <p className="text-xs font-semibold" style={{ color: 'var(--t2)' }}>
              السلة فارغة
            </p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--t3)' }}>
              اختر أصناف من القائمة لبدء إنشاء الطلب
            </p>
          </div>
        ) : (
          cart.map((item, idx) => (
            <div
              key={`${item.id || item.productId}_${idx}`}
              className="p-2.5 rounded-xl border space-y-1.5 text-xs"
              style={{ background: 'var(--s2)', borderColor: 'var(--bd)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold leading-snug" style={{ color: 'var(--t1)' }}>
                  {item.name}
                </span>
                <span className="mono font-bold shrink-0" style={{ color: 'var(--t1)' }}>
                  {(Number(item.price) * item.qty).toFixed(2)} ج
                </span>
              </div>

              {/* Modifiers List */}
              {item.modifiers && item.modifiers.length > 0 && (
                <div className="text-[10px] space-y-0.5" style={{ color: 'var(--t3)' }}>
                  {item.modifiers.map((m, mIdx) => (
                    <div key={mIdx}>
                      + {m.optionName || m.name} ({Number(m.price || 0) > 0 ? `${m.price} ج` : 'مجاني'})
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onChangeQty(idx, -1)}
                    className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer text-slate-200"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="mono font-bold w-6 text-center" style={{ color: 'var(--ac)' }}>
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => onChangeQty(idx, 1)}
                    className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer text-slate-200"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveItem(idx)}
                  className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                  title="حذف الصنف"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Checkout */}
      <div className="p-4 border-t space-y-3 shrink-0" style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between" style={{ color: 'var(--t3)' }}>
            <span>المجموع الفرعي:</span>
            <span className="mono">{subtotal.toFixed(2)} {currency}</span>
          </div>
          <div className="flex items-center justify-between font-bold text-sm pt-1 border-t border-white/5">
            <span style={{ color: 'var(--t1)' }}>الإجمالي المطلوب:</span>
            <span className="mono text-base" style={{ color: 'var(--ac)' }}>
              {total.toFixed(2)} <span className="text-xs font-normal text-slate-400">{currency}</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={cart.length === 0}
          onClick={onProceedCheckout}
          className="w-full py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--ac)' }}
        >
          متابعة الدفع ({total.toFixed(2)} ج)
        </button>
      </div>
    </aside>
  );
};
