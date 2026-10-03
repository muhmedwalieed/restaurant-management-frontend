import React, { useState, useMemo } from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { Button } from '../../../../shared/components/Button.jsx';
import { Input } from '../../../../shared/components/Input.jsx';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { useCloseShiftMutation } from '../../hooks/useShifts.js';
import { toast } from '../../../../shared/context/ToastContext.jsx';
import {
  Lock,
  DollarSign,
  CreditCard,
  Smartphone,
  Wallet,
  Coins,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Calculator,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';

export const CloseShiftModal = ({
  isOpen,
  onClose,
  branchId,
  shift,
  onPrintZReport,
}) => {
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

  if (!isOpen || !shift) return null;

  const startingCash = Number(shift.startingCash) || 0;
  const cashSales = Number(shift.cashSales) || 0;
  const cardSales = Number(shift.cardSales) || 0;
  const instaPaySales = Number(shift.instaPaySales) || 0;
  const walletSales = Number(shift.walletSales) || 0;
  const totalSales = Number(shift.totalSales) || (cashSales + cardSales + instaPaySales + walletSales);
  const driverSettlementCash = Number(shift.driverSettlementCash) || 0;
  const cashIn = Number(shift.cashIn) || 0;
  const cashOut = Number(shift.cashOut) || 0;
  const totalRefunds = Number(shift.totalRefunds) || 0;
  const expectedCash = Number(shift.expectedCash) || (startingCash + cashSales + driverSettlementCash + cashIn - totalRefunds - cashOut);

  // Computed counted cash from denominations
  const totalFromDenominations = useMemo(() => {
    let sum = 0;
    for (const [denom, countStr] of Object.entries(denominations)) {
      const count = Number(countStr) || 0;
      sum += Number(denom) * count;
    }
    return sum;
  }, [denominations]);

  const effectiveCountedCash = useDenominations
    ? totalFromDenominations
    : Number(actualCash) || 0;

  const discrepancy = effectiveCountedCash - expectedCash;

  const handleDenomChange = (denom, val) => {
    setDenominations((prev) => ({ ...prev, [denom]: val }));
  };

  const handleConfirmClose = async (e) => {
    e.preventDefault();
    if (!useDenominations && (!actualCash || isNaN(Number(actualCash)))) {
      toast.error('يرجى كتابة المبلغ الفعلي الموجود في الدرج');
      return;
    }

    try {
      const res = await closeShiftMutation.mutateAsync({
        branchId,
        shiftId: shift.id,
        payload: {
          actualCash: effectiveCountedCash,
          closeNotes: closeNotes.trim() || undefined,
        },
      });
      toast.success(res?.data?.message || res?.message || 'تم إغلاق الوردية بنجاح 🔒');
      if (onPrintZReport) {
        onPrintZReport(res?.data?.shift || { ...shift, actualCash: effectiveCountedCash, cashDifference: discrepancy });
      }
      if (onClose) onClose();
    } catch (err) {
      toast.error(err?.message || 'تعذر إغلاق الوردية');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`إغلاق الوردية #${shift.shiftNumber} (Z-Report)`}
      subtitle={`الموظف: ${shift.employee?.name || 'الكاشير'} | بدأت ${new Date(shift.openedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`}
      size="lg"
    >
      <form onSubmit={handleConfirmClose} className="space-y-5 text-right">
        {/* 1. Cash Drawer Breakdown Cards */}
        <div className="bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
              حسابات الدرج النقدي (Cash Drawer)
            </span>
            <span className="text-[11px] text-zinc-400">النقدية المتوقعة في الدرج</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white dark:bg-zinc-800 p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
              <span className="text-[11px] text-zinc-400 block">عهدة البداية</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                {startingCash.toFixed(2)} {currency}
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
              <span className="text-[11px] text-emerald-500 block">مبيعات كاش (+)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                +{cashSales.toFixed(2)} {currency}
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
              <span className="text-[11px] text-emerald-500 block">تحصيل طيارين (+)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                +{driverSettlementCash.toFixed(2)} {currency}
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
              <span className="text-[11px] text-rose-500 block">مصروفات/سحب (-)</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                -{cashOut.toFixed(2)} {currency}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              إجمالي النقدية المتوقعة في الدرج (=):
            </span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {expectedCash.toFixed(2)} {currency}
            </span>
          </div>
        </div>

        {/* 2. Electronic & Other Payments summary */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50">
            <span className="text-[11px] text-zinc-400 block mb-0.5">فيزا / بطاقات</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">
              {cardSales.toFixed(2)} {currency}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50">
            <span className="text-[11px] text-zinc-400 block mb-0.5">إنستاباي / محفظة</span>
            <span className="font-bold text-purple-600 dark:text-purple-400 text-xs">
              {(instaPaySales + walletSales).toFixed(2)} {currency}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50">
            <span className="text-[11px] text-zinc-400 block mb-0.5">إجمالي المبيعات</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
              {totalSales.toFixed(2)} {currency}
            </span>
          </div>
        </div>

        {/* 3. Actual Counted Cash Input & Denominations Counter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              النقدية الفعلية المحصية في الدرج (Actual Cash)
            </label>
            <button
              type="button"
              onClick={() => setUseDenominations(!useDenominations)}
              className="text-[11px] font-semibold text-primary-500 hover:text-primary-400 flex items-center gap-1"
            >
              <Calculator className="w-3.5 h-3.5" />
              {useDenominations ? 'إدخال المبلغ مباشرة' : 'حاسبة فئات النقدية (200، 100...)'}
            </button>
          </div>

          {useDenominations ? (
            <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[200, 100, 50, 20, 10, 5, 1].map((denom) => (
                  <div key={denom} className="flex items-center gap-1.5">
                    <span className="w-10 text-xs font-bold text-zinc-500 text-left">
                      {denom}ج:
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={denominations[denom]}
                      onChange={(e) => handleDenomChange(denom, e.target.value)}
                      placeholder="0"
                      className="w-full text-center font-bold text-xs py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-bold">
                <span className="text-zinc-500">المجموع المحسوب:</span>
                <span className="text-sm text-zinc-900 dark:text-zinc-100">
                  {totalFromDenominations.toFixed(2)} {currency}
                </span>
              </div>
            </div>
          ) : (
            <div className="relative">
              <Input
                type="number"
                step="0.5"
                min="0"
                required
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                placeholder="0.00"
                className="text-xl font-bold text-left pl-14"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                {currency}
              </span>
            </div>
          )}
        </div>

        {/* 4. Discrepancy Indicator Pill */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
            Math.abs(discrepancy) < 0.01
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : discrepancy > 0
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {Math.abs(discrepancy) < 0.01 ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>
              {Math.abs(discrepancy) < 0.01
                ? 'الدرج متطابق تماماً مع الحسابات (0.00)'
                : discrepancy > 0
                ? `يوجد زيادة نقدية في الدرج (+${discrepancy.toFixed(2)} ${currency})`
                : `يوجد عجز نقدي في الدرج (${discrepancy.toFixed(2)} ${currency})`}
            </span>
          </div>
          <span className="text-sm font-black">
            {discrepancy > 0 ? `+${discrepancy.toFixed(2)}` : discrepancy.toFixed(2)} {currency}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            ملاحظات إغلاق الوردية (اختياري)
          </label>
          <Input
            type="text"
            value={closeNotes}
            onChange={(e) => setCloseNotes(e.target.value)}
            placeholder="مثال: تم تسليم النقدية لمدير الفرع..."
          />
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="danger"
            isLoading={closeShiftMutation.isPending}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-rose-900/20"
          >
            <Lock className="w-4 h-4 ml-1.5" />
            تأكيد إغلاق الوردية وطباعة Z-Report
          </Button>
        </div>
      </form>
    </Modal>
  );
};
