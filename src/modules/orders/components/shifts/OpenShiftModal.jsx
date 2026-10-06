import React, { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { Button } from '../../../../shared/components/Button.jsx';
import { Input } from '../../../../shared/components/Input.jsx';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { useOpenShiftMutation } from '../../hooks/useShifts.js';
import { toast } from '../../../../shared/context/ToastContext.jsx';
import { KeyRound, DollarSign, Clock, Sparkles } from 'lucide-react';

export const OpenShiftModal = ({
  isOpen,
  onClose,
  branchId,
  isEnforced = false,
}) => {
  const { currency } = useCurrency();
  const [startingCash, setStartingCash] = useState('');
  const [openNotes, setOpenNotes] = useState('');
  const openShiftMutation = useOpenShiftMutation();

  if (!isOpen) return null;

  const handleQuickAdd = (amount) => {
    const current = startingCash === '' ? 0 : Number(startingCash) || 0;
    setStartingCash(String(current + amount));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cashNum = startingCash === '' ? 0 : Number(startingCash);
    if (isNaN(cashNum) || cashNum < 0) {
      toast.error('يرجى إدخال رصيد بداية صحيح');
      return;
    }

    try {
      const res = await openShiftMutation.mutateAsync({
        branchId,
        payload: {
          startingCash: cashNum,
          openNotes: openNotes.trim() || undefined,
        },
      });
      toast.success(res?.data?.message || res?.message || 'تم فتح الوردية بنجاح 🟢');
      if (onClose) onClose();
    } catch (err) {
      toast.error(err?.message || 'تعذر فتح الوردية');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isEnforced ? undefined : onClose}
      title="بدء وردية جديدة (Open Shift)"
      subtitle="تحديد رصيد العهدة الافتتاحي للدرج النقدي"
      size="md"
    >
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5 text-right">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-500">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              تسليم عهدة الدرج النقدي
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              أدخل مبلغ النقدية الموجود في درج الكاشير قبل بدء تسجيل طلبات الوردية
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            رصيد بداية الوردية
          </label>
          <div className="relative">
            <Input
              type="number"
              step="0.5"
              min="0"
              name="shift_starting_cash_no_autofill"
              id="shift_starting_cash_no_autofill"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
              value={startingCash}
              onChange={(e) => setStartingCash(e.target.value)}
              placeholder="0.00"
              className="text-center font-mono font-bold text-lg tracking-wider"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
              {currency}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-[11px] text-zinc-400 ml-1">إضافة سريعة:</span>
            {[50, 100, 200, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleQuickAdd(amt)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors"
              >
                +{amt}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setStartingCash('')}
              className="px-2 py-1 rounded-lg text-[11px] font-medium text-zinc-400 hover:text-zinc-200"
            >
              تصفير
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            ملاحظات افتتاح الوردية (اختياري)
          </label>
          <Input
            type="text"
            value={openNotes}
            onChange={(e) => setOpenNotes(e.target.value)}
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          {!isEnforced && (
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            isLoading={openShiftMutation.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-900/20"
          >
            تأكيد وفتح الوردية
          </Button>
        </div>
      </form>
    </Modal>
  );
};
