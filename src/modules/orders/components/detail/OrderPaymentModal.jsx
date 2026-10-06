import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Wallet,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';

export const OrderPaymentModal = ({
  isOpen,
  onClose,
  order,
  onConfirmPayment,
  isSubmitting = false,
}) => {
  const { currency } = useCurrency();
  const [payMethod, setPayMethod] = useState('INSTAPAY');
  const [payAmount, setPayAmount] = useState('');
  const [reference, setReference] = useState('');

  const total = Number(order?.totalAmount || order?.total || 0);
  const paid = Number(order?.paidAmount || 0);
  const remaining = Math.max(0, total - paid);

  useEffect(() => {
    if (isOpen) {
      setPayMethod('INSTAPAY');
      setPayAmount(remaining > 0 ? String(remaining) : '');
      setReference('');
    }
  }, [isOpen, remaining]);

  if (!isOpen || !order) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    const finalAmount = payAmount === '' ? remaining : Number(payAmount);
    onConfirmPayment({
      method: payMethod,
      amount: finalAmount,
      reference,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col text-zinc-900 dark:text-zinc-100">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CreditCard size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                تسجيل دفعة للطلب #{order.orderNumber || order.id?.slice(-5)}
              </h4>
              <p className="text-[11px] text-zinc-400">تحصيل المبلغ المتبقي</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Financial summary box */}
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span>إجمالي الطلب:</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100" dir="ltr">
                {total.toFixed(2)} {currency}
              </span>
            </div>
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-bold">
              <span>المتبقي للتحصيل:</span>
              <span className="font-mono text-sm" dir="ltr">
                {remaining.toFixed(2)} {currency}
              </span>
            </div>
          </div>

          {/* Payment Method Selector - Only Instapay & Wallet */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block">
              طريقة الدفع
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPayMethod('INSTAPAY')}
                className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  payMethod === 'INSTAPAY'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30 font-black'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                <Smartphone size={15} />
                <span>انستاباي</span>
              </button>

              <button
                type="button"
                onClick={() => setPayMethod('WALLET')}
                className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  payMethod === 'WALLET'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30 font-black'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                <Wallet size={15} />
                <span>محفظة</span>
              </button>
            </div>
          </div>

          {/* Pay Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                المبلغ المراد سداده
              </label>
              <button
                type="button"
                onClick={() => setPayAmount(String(remaining))}
                className="text-[10px] font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
              >
                المتبقي بالكامل ({remaining.toFixed(0)} {currency})
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                max={remaining}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder={String(remaining)}
                className="w-full h-11 px-3 pl-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-sm font-bold focus:outline-none focus:border-primary-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
                {currency}
              </span>
            </div>
          </div>

          {/* Optional Reference */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
              رقم العملية / المرجع (اختياري)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="مثال: رقم تحويل انستاباي..."
              className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 h-11 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>جاري التسجيل...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>تأكيد تسجيل الدفعة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderPaymentModal;
