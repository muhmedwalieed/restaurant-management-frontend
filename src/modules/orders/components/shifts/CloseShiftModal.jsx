import React, { useState, useMemo } from 'react';
import {
  X,
  Lock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Calculator,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { useCloseShiftMutation } from '../../hooks/useShifts.js';

export const CloseShiftModal = ({ isOpen, onClose, shift }) => {
  const { currency } = useCurrency();
  const [actualCash, setActualCash] = useState('');
  const [closeNotes, setCloseNotes] = useState('');
  const [useDenominations, setUseDenominations] = useState(false);
  const [denominations, setDenominations] = useState({
    200: '',
    100: '',
    50: '',
    20: '',
    10: '',
    5: '',
    1: '',
  });

  const closeShiftMutation = useCloseShiftMutation();

  // Computed counted cash from denominations
  const totalFromDenominations = useMemo(() => {
    let sum = 0;
    for (const [denom, countStr] of Object.entries(denominations)) {
      const count = Number(countStr) || 0;
      sum += Number(denom) * count;
    }
    return sum;
  }, [denominations]);

  if (!isOpen || !shift) return null;

  const startingCash = Number(shift.startingCash) || 0;
  const cashSales = Number(shift.cashSales) || 0;
  const cardSales = Number(shift.cardSales) || 0;
  const instapaySales = Number(shift.instapaySales) || 0;
  const walletSales = Number(shift.walletSales) || 0;
  const cashIn = Number(shift.cashIn) || 0;
  const cashOut = Number(shift.cashOut) || 0;

  // Expected Cash = Starting Cash + Cash Sales + Cash In - Cash Out
  const expectedCash = startingCash + cashSales + cashIn - cashOut;

  // Final counted cash value
  const countedCash = useDenominations
    ? totalFromDenominations
    : (actualCash === '' ? expectedCash : Number(actualCash));

  const cashDifference = countedCash - expectedCash;

  const handleDenomChange = (denom, val) => {
    setDenominations((prev) => ({
      ...prev,
      [denom]: val,
    }));
  };

  const handleCloseShift = async (e) => {
    e.preventDefault();
    try {
      await closeShiftMutation.mutateAsync({
        shiftId: shift.id,
        actualCash: countedCash,
        notes: closeNotes,
      });
      onClose();
    } catch (_) {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-zinc-900 dark:text-zinc-100 max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-bold">
              <Lock size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                إغلاق الوردية
              </h3>
              <p className="text-[11px] text-zinc-400">
                الوردية #{shift.shiftNumber || shift.id?.slice(-5)}
              </p>
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
        <form onSubmit={handleCloseShift} className="p-4 space-y-3.5 overflow-y-auto custom-scrollbar flex-1 text-right">
          {/* Expected Cash Breakdown */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/30 text-xs">
            <div className="p-2.5 px-3 flex items-center justify-between text-zinc-600 dark:text-zinc-400">
              <span className="font-medium">عهدة البداية (الافتتاحي)</span>
              <div className="flex items-baseline gap-1" dir="rtl">
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{startingCash.toFixed(2)}</span>
                <span className="text-[10px] font-bold text-zinc-400">{currency}</span>
              </div>
            </div>

            <div className="p-2.5 px-3 flex items-center justify-between text-zinc-600 dark:text-zinc-400">
              <span className="font-medium">مبيعات نقدي</span>
              <div className="flex items-baseline gap-1" dir="rtl">
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{cashSales.toFixed(2)}</span>
                <span className="text-[10px] font-bold text-zinc-400">{currency}</span>
              </div>
            </div>

            {cashIn > 0 && (
              <div className="p-2.5 px-3 flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">إيداعات نقدية</span>
                <div className="flex items-baseline gap-1" dir="rtl">
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{cashIn.toFixed(2)}</span>
                  <span className="text-[10px] font-bold text-zinc-400">{currency}</span>
                </div>
              </div>
            )}

            {cashOut > 0 && (
              <div className="p-2.5 px-3 flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">مصروفات نثرية مسحوبة</span>
                <div className="flex items-baseline gap-1" dir="rtl">
                  <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{cashOut.toFixed(2)}</span>
                  <span className="text-[10px] font-bold text-zinc-400">{currency}</span>
                </div>
              </div>
            )}

            {/* Expected Total in Drawer */}
            <div className="p-3 bg-zinc-100/90 dark:bg-zinc-900 flex items-center justify-between font-bold border-t-2 border-zinc-200 dark:border-zinc-750">
              <span className="text-zinc-900 dark:text-zinc-100 font-bold text-xs">النقدية المتوقعة بالدرج:</span>
              <div className="flex items-baseline gap-1.5" dir="rtl">
                <span className="font-mono font-black text-base text-zinc-950 dark:text-white">
                  {expectedCash.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{currency}</span>
              </div>
            </div>
          </div>

          {/* Actual Cash Input Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                المبلغ الفعلي في الدرج
              </label>
              <button
                type="button"
                onClick={() => setUseDenominations(!useDenominations)}
                className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Calculator size={13} />
                <span>{useDenominations ? 'إدخال رقم مباشر' : 'عد الفئات والعملات'}</span>
              </button>
            </div>

            {useDenominations ? (
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 animate-fadeIn">
                <div className="grid grid-cols-2 gap-2">
                  {[200, 100, 50, 20, 10, 5, 1].map((denom) => (
                    <div key={denom} className="flex items-center gap-1.5">
                      <span className="text-xs font-bold w-12 text-zinc-600 dark:text-zinc-400 font-mono text-left" dir="ltr">
                        {denom} ج:
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={denominations[denom]}
                        onChange={(e) => handleDenomChange(denom, e.target.value)}
                        placeholder="0"
                        className="w-full h-8 px-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono text-center focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-bold">
                  <span>إجمالي العد:</span>
                  <div className="flex items-baseline gap-1" dir="rtl">
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {totalFromDenominations.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400">{currency}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative flex items-center bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl focus-within:border-zinc-500 dark:focus-within:border-zinc-600 transition-all overflow-hidden" dir="rtl">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={actualCash}
                  onFocus={(e) => e.target.select()}
                  onClick={(e) => e.target.select()}
                  onChange={(e) => setActualCash(e.target.value)}
                  placeholder={expectedCash.toFixed(2)}
                  className="flex-1 h-11 bg-transparent px-3.5 text-base font-mono font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none text-right"
                />
                <span className="px-3.5 h-11 flex items-center text-xs font-bold text-zinc-600 dark:text-zinc-400 font-sans pointer-events-none shrink-0 bg-zinc-100 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
                  {currency}
                </span>
              </div>
            )}

            {/* Difference Alert */}
            {cashDifference !== 0 && (
              <div
                className={`p-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between animate-fadeIn ${
                  cashDifference > 0
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>{cashDifference > 0 ? 'يوجد فائض في الدرج:' : 'يوجد عجز في الدرج:'}</span>
                </div>
                <div className="flex items-baseline gap-1" dir="rtl">
                  <span className="font-mono font-bold">{Math.abs(cashDifference).toFixed(2)}</span>
                  <span className="text-[10px] font-bold">{currency}</span>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              ملاحظات الإغلاق (اختياري)
            </label>
            <textarea
              rows={2}
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
              placeholder="أي ملاحظات تخص الوردية أو تسليم العهدة..."
              className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-600 resize-none placeholder:text-zinc-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={closeShiftMutation.isPending}
              className="flex-1 h-11 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md active:scale-[0.98]"
            >
              {closeShiftMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>جاري الإغلاق...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>تأكيد إغلاق الوردية</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CloseShiftModal;
