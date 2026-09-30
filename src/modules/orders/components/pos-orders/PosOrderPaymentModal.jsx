import React, { useEffect } from 'react';
import {
  Banknote,
  CreditCard,
  QrCode,
  Wallet,
  Receipt,
  X,
  Check,
} from 'lucide-react';
import { PAY_METHODS as BASE_PAY_METHODS } from '../../constants.js';

const METHOD_ICONS = {
  CASH: Banknote,
  CARD: CreditCard,
  INSTAPAY: QrCode,
  WALLET: Wallet,
};

export const PosOrderPaymentModal = ({
  isOpen,
  onClose,
  order = null,
  totalAmount = 0,
  remainingAmount = 0,
  currency = 'ج.م',
  payAmount,
  onChangePayAmount,
  payMethod = 'CASH',
  onChangePayMethod,
  onConfirmPayment,
  isSettlingPayment = false,
}) => {
  const total = Number(order?.totalAmount ?? totalAmount ?? 0);
  const remaining = Number(order?.remainingAmount ?? remainingAmount ?? 0);
  const curr = currency || 'ج.م';
  const enteredNum = parseFloat(payAmount) || 0;

  // Automatically default payment input value to exact remaining balance on open if empty or 0
  useEffect(() => {
    if (isOpen && remaining > 0 && (!payAmount || parseFloat(payAmount) === 0)) {
      onChangePayAmount?.(remaining % 1 === 0 ? remaining.toFixed(0) : remaining.toFixed(2));
    }
  }, [isOpen, remaining, payAmount, onChangePayAmount]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-150"
      dir="rtl"
    >
      <div
        className="w-full max-w-sm rounded-2xl border shadow-2xl p-5 space-y-4 relative bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 transition-colors"
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Receipt size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                تحصيل دفعة مالية
              </h4>
              {order?.orderNumber && (
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                  طلب #{order.orderNumber}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── 1. Order Summary Breakdown ── */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">إجمالي الطلب:</span>
            <span className="whitespace-nowrap font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1 shrink-0">
              <span className="font-mono">
                {total % 1 === 0 ? total.toFixed(0) : total.toFixed(2)}
              </span>
              <span className="text-xs font-normal text-zinc-400">{curr}</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
            <span className="text-zinc-600 dark:text-zinc-300 font-bold">المتبقي للتحصيل:</span>
            <span className="whitespace-nowrap font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 shrink-0">
              <span className="font-mono text-sm">
                {remaining % 1 === 0 ? remaining.toFixed(0) : remaining.toFixed(2)}
              </span>
              <span className="text-xs font-normal text-amber-600/80 dark:text-amber-400/80">{curr}</span>
            </span>
          </div>
        </div>

        {/* ── 2. Payment Method Selector ── */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
            طريقة الدفع:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {BASE_PAY_METHODS.map((m) => {
              const isSel = payMethod === m.id;
              const Icon = METHOD_ICONS[m.id] || Banknote;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChangePayMethod(m.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    isSel
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm'
                      : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon size={15} strokeWidth={isSel ? 2.2 : 1.8} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. Exact Net Amount Input ── */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
            المبلغ المدفوع:
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              value={payAmount}
              onChange={(e) => onChangePayAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pr-3.5 pl-14 py-2.5 text-base font-bold font-mono rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs font-bold font-mono text-zinc-400 dark:text-zinc-500">
              {curr}
            </div>
          </div>
        </div>

        {/* ── 4. Modal Action Buttons ── */}
        <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            disabled={isSettlingPayment || enteredNum <= 0}
            onClick={onConfirmPayment}
            className="w-full h-11 rounded-xl font-semibold text-sm bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-zinc-100 flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check size={16} />
            <span>{isSettlingPayment ? 'جاري السداد...' : 'تأكيد السداد'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-medium rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
