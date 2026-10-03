import React, { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { Button } from '../../../../shared/components/Button.jsx';
import { Input } from '../../../../shared/components/Input.jsx';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { useAddCashMovementMutation } from '../../hooks/useShifts.js';
import { toast } from '../../../../shared/context/ToastContext.jsx';
import { ArrowDownLeft, ArrowUpRight, DollarSign } from 'lucide-react';

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
      title="حركة نقدية بالدرج (Cash Movement)"
      subtitle="تسجيل إيداع إضافي أو سحب مصروفات أثناء الوردية"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        {/* Type Selector Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-700/60">
          <button
            type="button"
            onClick={() => setType('CASH_OUT')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              type === 'CASH_OUT'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            سحب نقدية / مصروفات (Pay Out)
          </button>
          <button
            type="button"
            onClick={() => setType('CASH_IN')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              type === 'CASH_IN'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            إيداع نقدية / فكّة (Pay In)
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            المبلغ
          </label>
          <div className="relative">
            <Input
              type="number"
              step="0.5"
              min="0.5"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-lg font-bold text-left pl-14"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
              {currency}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            سبب الحركة النقدية
          </label>
          <Input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              type === 'CASH_OUT'
                ? 'مثال: شراء مستلزمات نظافة طارئة، سحب عهدة للإدارة...'
                : 'مثال: إضافة فكّة نقدية من الخزينة الرئيسية...'
            }
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={addMovementMutation.isPending}
            className={`font-bold px-5 py-2 rounded-xl text-white ${
              type === 'CASH_OUT'
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            تأكيد الحركة النقدية
          </Button>
        </div>
      </form>
    </Modal>
  );
};
