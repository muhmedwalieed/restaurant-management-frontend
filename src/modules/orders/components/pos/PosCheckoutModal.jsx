import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Banknote,
  Wallet,
  Smartphone,
  Receipt,
  Printer,
  RotateCcw,
  Tag,
  Coins,
} from 'lucide-react';

export const PosCheckoutModal = ({
  isOpen,
  onClose,
  cart = [],
  total = 0,
  rawTotal = 0,
  couponCode = '',
  setCouponCode,
  couponState,
  clearCoupon,
  onChangeQty,
  onRemoveItem,
  orderType = 'DINE_IN',
  onChangeOrderType,
  customerInfo = {},
  onChangeCustomerInfo,
  tables = [],
  selectedTableLabel,
  source = 'POS',
  orderNotes = '',
  onChangeOrderNotes,
  onConfirm,
  isSubmitting = false,
  currency = 'ج.م',
}) => {
  const [payMethod, setPayMethod] = useState('CASH'); // 'CASH' | 'INSTAPAY' | 'WALLET'
  const [paidAmount, setPaidAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isCouponExpanded, setIsCouponExpanded] = useState(false);

  const inputRef = useRef(null);

  const finalTotal = total > 0 ? total : 0;
  const itemCount = cart.reduce((s, it) => s + (it.qty || 1), 0);

  // Calculations
  const numericPaid = paidAmount === '' ? finalTotal : Number(paidAmount) || 0;


  useEffect(() => {
    if (isOpen) {
      setPaidAmount(finalTotal > 0 ? String(finalTotal) : '');
      setPayMethod('CASH');
      setNotes(orderNotes || '');
      setIsCouponExpanded(Boolean(couponCode || couponState?.id));

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 80);
    }
  }, [isOpen, finalTotal, orderNotes]);

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (onChangeOrderNotes) {
      onChangeOrderNotes(notes);
    }

    let paymentType = 'FULL';
    let paidAmt = finalTotal;

    if (numericPaid <= 0) {
      paymentType = 'LATER';
      paidAmt = 0;
    } else if (numericPaid < finalTotal) {
      paymentType = 'PARTIAL';
      paidAmt = numericPaid;
    } else {
      paymentType = 'FULL';
      paidAmt = finalTotal;
    }

    onConfirm({
      paymentType,
      payMethod,
      paidAmount: paidAmt,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-zinc-900 dark:text-zinc-100 animate-scaleUp"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center shrink-0 shadow-xs">
              <Receipt size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">إتمام الطلب والدفع</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                {itemCount} {itemCount === 1 ? 'صنف' : 'أصناف'} في السلة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[82vh] overflow-y-auto custom-scrollbar">
          {/* 1. Total Summary Card */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-xs">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">إجمالي الحساب المطلوب</span>
            <div className="flex items-baseline gap-1.5" dir="rtl">
              <span className="text-2xl font-black font-mono text-zinc-900 dark:text-white tracking-tight">
                {finalTotal % 1 === 0 ? finalTotal.toFixed(0) : finalTotal.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 font-sans">{currency}</span>
            </div>
          </div>

          {/* 2. Coupon Code Section (Compact Collapsible to Save Space) */}
          {setCouponCode && (
            <div className="rounded-xl">
              {couponState?.id ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs animate-fadeIn">
                  <div className="flex items-center gap-2 truncate">
                    <Tag size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-bold font-mono">{couponState.code}</span>
                    <span className="text-emerald-600 dark:text-emerald-400/80" dir="rtl">
                      (-{couponState.discountAmount.toFixed(0)} {currency})
                    </span>
                  </div>
                  {clearCoupon && (
                    <button
                      type="button"
                      onClick={() => {
                        clearCoupon();
                        setIsCouponExpanded(false);
                      }}
                      className="w-5 h-5 rounded flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="إزالة كود الخصم"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ) : isCouponExpanded || couponCode ? (
                <div className="relative animate-fadeIn">
                  <input
                    type="text"
                    autoFocus
                    value={couponCode || ''}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="أدخل كود الخصم..."
                    className="w-full h-9 px-3 pr-8 pl-16 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                  />
                  <Tag size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {couponState?.loading && (
                      <RotateCcw size={12} className="animate-spin text-zinc-400" />
                    )}
                    {couponCode && clearCoupon && (
                      <button
                        type="button"
                        onClick={() => {
                          setCouponCode('');
                          clearCoupon();
                        }}
                        className="w-4 h-4 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                        title="مسح"
                      >
                        <X size={11} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsCouponExpanded(false)}
                      className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 px-1 py-0.5 rounded cursor-pointer"
                      title="إخفاء"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCouponExpanded(true)}
                  className="w-full py-1.5 px-3 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-500 bg-zinc-50/50 hover:bg-zinc-100/70 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Tag size={12} className="text-zinc-400 dark:text-zinc-500" />
                  <span>لديك كود خصم؟ اضغط هنا</span>
                </button>
              )}
            </div>
          )}

          {/* 3. Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              طريقة الدفع
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPayMethod('CASH')}
                className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  payMethod === 'CASH'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white border border-zinc-900 dark:border-zinc-600 ring-1 ring-zinc-500/20 shadow-xs'
                    : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <Banknote size={14} className="shrink-0" />
                <span>نقدي</span>
              </button>

              <button
                type="button"
                onClick={() => setPayMethod('WALLET')}
                className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  payMethod === 'WALLET'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white border border-zinc-900 dark:border-zinc-600 ring-1 ring-zinc-500/20 shadow-xs'
                    : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <Wallet size={14} className="shrink-0" />
                <span>محفظة</span>
              </button>

              <button
                type="button"
                onClick={() => setPayMethod('INSTAPAY')}
                className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  payMethod === 'INSTAPAY'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white border border-zinc-900 dark:border-zinc-600 ring-1 ring-zinc-500/20 shadow-xs'
                    : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <Smartphone size={14} className="shrink-0" />
                <span>انستاباي</span>
              </button>
            </div>
          </div>

          {/* 4. Streamlined Paid Amount Card */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
            {/* Header with Quick Fill Button */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Coins size={13} className="text-zinc-500 dark:text-zinc-400" />
                <span>المبلغ المستلم / المدفوع</span>
              </label>
              <button
                type="button"
                onClick={() => setPaidAmount(String(finalTotal))}
                className="text-[11px] font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white bg-zinc-200/70 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-zinc-300 dark:border-zinc-700 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
              >
                المبلغ كامل
              </button>
            </div>

            {/* Clean Numeric Input with Currency label */}
            <div className="relative flex items-center bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl focus-within:border-zinc-500 dark:focus-within:border-zinc-600 transition-all overflow-hidden">
              <input
                ref={inputRef}
                type="number"
                step="any"
                min="0"
                value={paidAmount}
                onFocus={(e) => e.target.select()}
                onClick={(e) => e.target.select()}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder={finalTotal % 1 === 0 ? finalTotal.toFixed(0) : finalTotal.toFixed(2)}
                className="w-full h-10 bg-transparent px-3 text-base font-mono font-bold text-zinc-900 dark:text-white selection:bg-zinc-200 dark:selection:bg-zinc-700 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none text-right"
                dir="rtl"
              />
              <span className="px-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 font-sans pointer-events-none shrink-0 border-r border-zinc-200 dark:border-zinc-800">
                {currency}
              </span>
            </div>

            {/* Change Calculation (الباقي للعميل) if overpaid */}
            {numericPaid > finalTotal && (
              <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
                <span className="font-semibold">المتبقي للعميل:</span>
                <div className="flex items-baseline gap-1" dir="rtl">
                  <span className="font-mono font-black text-sm text-amber-700 dark:text-amber-300">
                    {(numericPaid - finalTotal).toFixed(2)}
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400/80">{currency}</span>
                </div>
              </div>
            )}
          </div>

          {/* 5. Fixed Action Buttons */}
          <div className="pt-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs transition-colors cursor-pointer shrink-0"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 active:scale-[0.99] font-black rounded-xl flex items-center justify-center gap-2 shadow-md text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white dark:border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>جاري التأكيد...</span>
                </>
              ) : (
                <>
                  <Printer size={15} />
                  <span>تأكيد وطباعة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PosCheckoutModal;
