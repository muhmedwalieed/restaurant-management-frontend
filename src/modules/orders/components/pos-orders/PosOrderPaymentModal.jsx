import React, { useEffect, useRef } from 'react';
import {
  X,
  Banknote,
  Wallet,
  Smartphone,
  Receipt,
  Coins,
  CheckCircle2,
} from 'lucide-react';

export const PosOrderPaymentModal = ({
  isOpen,
  onClose,
  order,
  totalAmount = 0,
  remainingAmount = 0,
  currency = 'ج.م',
  payAmount = '',
  onChangePayAmount,
  payMethod = 'CASH',
  onChangePayMethod,
  onConfirmPayment,
  isSettlingPayment = false,
  autoDeliver = false,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 80);
    }
  }, [isOpen]);

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

  if (!isOpen || !order) return null;

  const numericPaid = payAmount === '' ? Number(remainingAmount) : Number(payAmount) || 0;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isSettlingPayment) return;
    const finalAmount = payAmount === '' ? Number(remainingAmount) : Number(payAmount);
    onConfirmPayment(payMethod, finalAmount);
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
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {autoDeliver ? `تسجيل الدفعة وتسليم الطلب #${order.orderNumber || order.id?.slice(-5)}` : `تسجيل دفعة للطلب #${order.orderNumber || order.id?.slice(-5)}`}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                {autoDeliver ? 'تحصيل المبلغ المتبقي وإتمام تسليم الطلب' : 'تحصيل المبلغ المتبقي على الطلب'}
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[82vh] overflow-y-auto custom-scrollbar">
          {/* 1. Total & Remaining Summary Card */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-xs">
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">المتبقي للتحصيل</span>
              {Number(totalAmount) > Number(remainingAmount) && (
                <span className="text-[11px] text-zinc-400 font-mono" dir="rtl">
                  (إجمالي الطلب: {Number(totalAmount).toFixed(0)} {currency})
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5" dir="rtl">
              <span className="text-2xl font-black font-mono text-zinc-900 dark:text-white tracking-tight">
                {Number(remainingAmount) % 1 === 0 ? Number(remainingAmount).toFixed(0) : Number(remainingAmount).toFixed(2)}
              </span>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 font-sans">{currency}</span>
            </div>
          </div>

          {/* 2. Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              طريقة الدفع
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onChangePayMethod('CASH')}
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
                onClick={() => onChangePayMethod('WALLET')}
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
                onClick={() => onChangePayMethod('INSTAPAY')}
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

          {/* 3. Streamlined Paid Amount Card */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Coins size={13} className="text-zinc-500 dark:text-zinc-400" />
                <span>المبلغ المستلم / المراد سداده</span>
              </label>
              <button
                type="button"
                onClick={() => onChangePayAmount(String(remainingAmount))}
                className="text-[11px] font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white bg-zinc-200/70 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-zinc-300 dark:border-zinc-700 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
              >
                المبلغ كامل
              </button>
            </div>

            <div className="relative flex items-center bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl focus-within:border-zinc-500 dark:focus-within:border-zinc-600 transition-all overflow-hidden">
              <input
                ref={inputRef}
                type="number"
                step="any"
                min="0"
                value={payAmount}
                onFocus={(e) => e.target.select()}
                onClick={(e) => e.target.select()}
                onChange={(e) => onChangePayAmount(e.target.value)}
                placeholder={Number(remainingAmount) % 1 === 0 ? Number(remainingAmount).toFixed(0) : Number(remainingAmount).toFixed(2)}
                className="w-full h-10 bg-transparent px-3 text-base font-mono font-bold text-zinc-900 dark:text-white selection:bg-zinc-200 dark:selection:bg-zinc-700 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none text-right"
                dir="rtl"
              />
              <span className="px-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 font-sans pointer-events-none shrink-0 border-r border-zinc-200 dark:border-zinc-800">
                {currency}
              </span>
            </div>

            {/* Change calculation if overpaid */}
            {numericPaid > Number(remainingAmount) && (
              <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
                <span className="font-semibold">المتبقي للعميل (الباقي):</span>
                <div className="flex items-baseline gap-1" dir="rtl">
                  <span className="font-mono font-black text-sm text-amber-700 dark:text-amber-300">
                    {(numericPaid - Number(remainingAmount)).toFixed(2)}
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400/80">{currency}</span>
                </div>
              </div>
            )}
          </div>

          {/* 4. Action Buttons */}
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
              disabled={isSettlingPayment}
              className="flex-1 h-11 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 active:scale-[0.99] font-black rounded-xl flex items-center justify-center gap-2 shadow-md text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSettlingPayment ? (
                <>
                  <span className="w-4 h-4 border-2 border-white dark:border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>{autoDeliver ? 'جاري الدفع والتسليم...' : 'جاري التسجيل...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>{autoDeliver ? 'تأكيد الدفع وتسليم الطلب' : 'تأكيد تسجيل الدفعة'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PosOrderPaymentModal;
