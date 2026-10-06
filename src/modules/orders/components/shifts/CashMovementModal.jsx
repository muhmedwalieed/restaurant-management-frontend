import React, { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { useAddCashMovementMutation } from '../../hooks/useShifts.js';
import { toast } from '../../../../shared/context/ToastContext.jsx';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const CashMovementModal = ({
  isOpen,
  onClose,
  branchId,
  shiftId,
}) => {
  const { currency } = useCurrency();
  const [type, setType] = useState('CASH_OUT'); // CASH_OUT | CASH_IN
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const addMovementMutation = useAddCashMovementMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح أكبر من صفر');
      return;
    }
    if (!reason.trim()) {
      toast.error('يرجى ذكر سبب الحركة النقدية');
      return;
    }

    try {
      const res = await addMovementMutation.mutateAsync({
        branchId,
        shiftId,
        payload: {
          type,
          amount: numAmount,
          reason: reason.trim(),
        },
      });
      toast.success(res?.data?.message || res?.message || 'تم تسجيل الحركة النقدية بنجاح');
      setAmount('');
      setReason('');
      if (onClose) onClose();
    } catch (err) {
      toast.error(err?.message || 'تعذر تسجيل الحركة النقدية');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="حركة نقدية بالدرج"
      subtitle="تسجيل إيداع إضافي أو سحب مصروفات"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        {/* Type Selector Toggle */}
        <div className="grid grid-cols-2 gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setType('CASH_OUT')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              type === 'CASH_OUT'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>سحب نقدي</span>
          </button>
          <button
            type="button"
            onClick={() => setType('CASH_IN')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              type === 'CASH_IN'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>إيداع نقدي</span>
          </button>
        </div>

        {/* Amount Input with Currency Badge */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            المبلغ
          </label>
          <div className="relative flex items-center bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl focus-within:border-zinc-500 dark:focus-within:border-zinc-600 transition-all overflow-hidden" dir="rtl">
            <input
              type="number"
              step="any"
              min="0.5"
              required
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 h-11 bg-transparent px-3.5 text-base font-mono font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none text-right"
            />
            <span className="px-3.5 h-11 flex items-center text-xs font-bold text-zinc-600 dark:text-zinc-400 font-sans pointer-events-none shrink-0 bg-zinc-100 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
              {currency}
            </span>
          </div>
        </div>

        {/* Reason Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            سبب الحركة النقدية
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              type === 'CASH_OUT'
                ? 'مثال: شراء مستلزمات نظافة، سحب عهدة للإدارة...'
                : 'مثال: إضافة فكّة نقدية من الخزينة الرئيسية...'
            }
            className="w-full h-11 px-3.5 rounded-xl text-xs bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-600 transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={addMovementMutation.isPending}
            className={`h-10 px-5 rounded-xl text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 ${
              type === 'CASH_OUT'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {addMovementMutation.isPending ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <span>تأكيد الحركة النقدية</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

