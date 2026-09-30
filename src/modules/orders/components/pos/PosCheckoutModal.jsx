import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  Wallet,
  QrCode,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { toast } from '../../../../shared/context/ToastContext.jsx';
import { ORDER_TYPES as BASE_ORDER_TYPES } from '../../constants.js';

const ORDER_TYPE_CFG = {
  PICKUP: { label: 'استلام', Icon: ShoppingBag },
  DELIVERY: { label: 'توصيل', Icon: Bike },
  DINE_IN: { label: 'صالة', Icon: UtensilsCrossed },
};

const PAY_METHODS = [
  { id: 'CASH', label: 'نقدي', Icon: Banknote },
  { id: 'CARD', label: 'بطاقة', Icon: CreditCard },
  { id: 'INSTAPAY', label: 'انستاباي', Icon: QrCode },
  { id: 'WALLET', label: 'محفظة', Icon: Wallet },
];

export const PosCheckoutModal = ({
  isOpen,
  onClose,
  total = 0,
  rawTotal,
  couponState,
  cart = [],
  orderType = 'DINE_IN',
  onChangeOrderType,
  customerInfo = {},
  onChangeCustomerInfo,
  tables = [],
  selectedTableLabel,
  onConfirmCheckout,
  isLoading = false,
}) => {
  const { currency } = useCurrency();
  const [payMethod, setPayMethod] = useState('CASH');
  const [enteredAmount, setEnteredAmount] = useState('');
  const [autoPrint, setAutoPrint] = useState(true);

  // Format initial amount
  useEffect(() => {
    if (isOpen) {
      const formattedTotal = total % 1 === 0 ? total.toFixed(0) : total.toFixed(2);
      setEnteredAmount(formattedTotal);
    }
  }, [isOpen, total]);

  // Handle ESC and PopState
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const numAmount = parseFloat(enteredAmount) || 0;
  const isCash = payMethod === 'CASH';
  const cashChange = isCash && numAmount > total ? numAmount - total : 0;
  const isPartial = numAmount > 0 && numAmount < total;

  const currentTypeCfg = ORDER_TYPE_CFG[orderType] || { label: orderType, Icon: ShoppingBag };
  const TypeIcon = currentTypeCfg.Icon;

  // Resolve active table or customer name
  const currentTableObj = useMemo(() => {
    if (!customerInfo?.table) return null;
    return tables.find((t) => String(t.id) === String(customerInfo.table) || String(t._id) === String(customerInfo.table));
  }, [tables, customerInfo?.table]);

  const tableDisplayName = currentTableObj
    ? currentTableObj.label || currentTableObj.name || (currentTableObj.number != null ? `طاولة ${currentTableObj.number}` : 'طاولة')
    : selectedTableLabel ? `طاولة ${selectedTableLabel}` : null;

  const customerDisplayName = orderType === 'DINE_IN'
    ? (tableDisplayName || 'طاولة غير محددة')
    : orderType === 'PICKUP'
    ? 'طلب استلام'
    : (customerInfo?.name?.trim() || 'عميل توصيل');

  const handleSubmitPayment = (e) => {
    e?.preventDefault?.();
    if (isLoading) return;

    // Validate Dine-in table
    if (orderType === 'DINE_IN' && !customerInfo?.table) {
      toast.error('يرجى اختيار طاولة لطلب الصالة');
      return;
    }

    // Validate Delivery customer info
    if (orderType === 'DELIVERY') {
      if (!customerInfo?.name?.trim()) {
        toast.error('يرجى إدخال اسم العميل لطلب التوصيل');
        return;
      }
      if (!customerInfo?.phone?.trim()) {
        toast.error('يرجى إدخال رقم هاتف العميل لطلب التوصيل');
        return;
      }
      if (!customerInfo?.address?.trim()) {
        toast.error('يرجى إدخال عنوان التوصيل');
        return;
      }
    }

    if (numAmount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }

    const paid = Math.min(total, numAmount);
    const paymentType = paid >= total ? 'FULL' : 'PARTIAL';

    onConfirmCheckout?.({
      paymentType,
      paidAmount: paid,
      payMethod,
      autoPrint,
    });
  };

  const handlePayLater = () => {
    if (isLoading) return;

    if (orderType === 'DINE_IN' && !customerInfo?.table) {
      toast.error('يرجى اختيار طاولة لطلب الصالة');
      return;
    }

    onConfirmCheckout?.({
      paymentType: 'LATER',
      paidAmount: 0,
      autoPrint,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        {/* ── Modal Header: Order Type Badge | Customer/Table | Net Total Due ── */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-zinc-800">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 border border-zinc-700 bg-zinc-900 text-zinc-200">
                <TypeIcon size={13} className="text-zinc-400" />
                <span>{currentTypeCfg.label}</span>
              </span>
              <span className="text-sm font-bold text-zinc-200 truncate max-w-[200px]">
                {customerDisplayName}
              </span>
            </div>
            {orderType === 'DELIVERY' && customerInfo?.phone && (
              <div className="text-xs text-zinc-400 font-mono" dir="ltr">
                {customerInfo.phone}
              </div>
            )}
            {couponState?.id && (
              <div className="text-xs font-bold text-emerald-400">✓ {couponState.code} — خصم {couponState.discountAmount.toFixed(0)} {currency || 'ج.م'}</div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left">
              <span className="text-[11px] text-zinc-400 block font-normal">المبلغ المستحق</span>
              {rawTotal != null && rawTotal !== total && (
                <span className="text-xs font-mono text-zinc-500 line-through block text-left">{rawTotal % 1 === 0 ? rawTotal.toFixed(0) : rawTotal.toFixed(2)} {currency || 'ج.م'}</span>
              )}
              <span className="whitespace-nowrap font-bold text-zinc-100 flex items-center justify-end gap-1">
                <span className="text-xl font-mono tracking-tight">
                  {total % 1 === 0 ? total.toFixed(0) : total.toFixed(2)}
                </span>
                <span className="text-xs font-normal text-zinc-400">{currency || 'ج.م'}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Payment Methods Grid (4 Methods: نقدي, بطاقة, انستاباي, محفظة) ── */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-zinc-400">طريقة الدفع</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PAY_METHODS.map((m) => {
              const Icon = m.Icon;
              const isActive = payMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayMethod(m.id)}
                  className={`h-14 rounded-xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-800 border-zinc-600 text-zinc-100 shadow-sm ring-1 ring-zinc-500 font-bold border'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 font-medium'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-zinc-100' : 'text-zinc-400'} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Net Amount Input & Change Display ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-400">المبلغ المدفوع</span>
            {isPartial && (
              <span className="text-amber-400 font-semibold">
                دفع جزئي (متبقي: {(total - numAmount).toFixed(0)} {currency || 'ج.م'})
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type="number"
              step="any"
              value={enteredAmount}
              onChange={(e) => setEnteredAmount(e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="0.00"
              className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-xl text-center text-xl font-bold font-mono text-zinc-100 focus:border-zinc-600 outline-none transition-colors"
            />
          </div>

          {/* Cash Change (الباقي للعميل) Badge */}
          {isCash && cashChange > 0 && (
            <div className="rounded-xl px-3.5 py-2 flex items-center justify-between text-xs font-semibold bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 animate-in fade-in duration-100">
              <span>الباقي للعميل:</span>
              <span className="font-mono text-sm font-bold" dir="ltr">
                {cashChange % 1 === 0 ? cashChange.toFixed(0) : cashChange.toFixed(2)} {currency || 'ج.م'}
              </span>
            </div>
          )}
        </div>

        {/* ── Auto Print Option ── */}
        <div className="flex items-center justify-between pt-1 text-xs text-zinc-400">
          <label className="flex items-center gap-2 cursor-pointer select-none hover:text-zinc-200 transition-colors">
            <input
              type="checkbox"
              checked={autoPrint}
              onChange={(e) => setAutoPrint(e.target.checked)}
              className="accent-emerald-600 rounded cursor-pointer"
            />
            <Printer size={14} className="text-zinc-400" />
            <span>طباعة الإيصال تلقائياً بعد السداد</span>
          </label>

          <button
            type="button"
            onClick={handlePayLater}
            disabled={isLoading}
            className="text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-4 cursor-pointer disabled:opacity-50"
          >
            حفظ الطلب (الدفع لاحقاً)
          </button>
        </div>

        {/* ── Action Buttons ── */}
        <div className="space-y-2 pt-2 border-t border-zinc-800/80">
          {/* Primary Confirm Payment Button */}
          <button
            type="button"
            disabled={isLoading || numAmount <= 0}
            onClick={handleSubmitPayment}
            className="w-full h-12 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold rounded-xl text-base transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={18} />
            <span>{isLoading ? 'جاري السداد...' : 'تأكيد السداد'}</span>
          </button>

          {/* Secondary Ghost Cancel Button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="w-full h-10 text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors cursor-pointer"
          >
            رجوع / إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default PosCheckoutModal;
