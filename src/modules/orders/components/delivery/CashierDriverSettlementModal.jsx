import React, { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { useBranchDriversQuery, useSettleDriverMutation } from '../../hooks/useDelivery.js';
import { toast } from '../../../../shared/context/ToastContext.jsx';
import { Coins, CheckCircle2, Bike, User, DollarSign, RotateCcw } from 'lucide-react';

export const CashierDriverSettlementModal = ({
  isOpen,
  onClose,
  branchId,
}) => {
  const { currency } = useCurrency();
  const { data: driversResponse, isLoading, refetch } = useBranchDriversQuery(branchId);
  const settleMutation = useSettleDriverMutation();

  const [selectedDriver, setSelectedDriver] = useState(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNotes, setSettleNotes] = useState('');

  if (!isOpen) return null;

  const drivers = driversResponse?.data || driversResponse || [];

  const handleOpenSettleForm = (driver) => {
    setSelectedDriver(driver);
    setSettleAmount(String(driver.wallet?.remainingToSettle || 0));
    setSettleNotes('');
  };

  const handleConfirmSettle = async (e) => {
    e.preventDefault();
    if (!selectedDriver) return;
    const amountNum = Number(settleAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('يرجى كتابة مبلغ صحيح');
      return;
    }

    try {
      await settleMutation.mutateAsync({
        branchId,
        payload: {
          driverEmployeeId: selectedDriver.id,
          amount: amountNum,
          notes: settleNotes || `استلام نقدية عهدة الطيار (${selectedDriver.name})`,
        },
      });
      toast.success(`تم استلام وتصفية ${amountNum.toFixed(2)} ${currency} من الطيار بنجاح 💵`);
      setSelectedDriver(null);
      refetch();
    } catch (err) {
      toast.error(err?.message || 'تعذر تصفية العهدة');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تصفية واستلام عهدة الطيارين (COD)"
      size="md"
    >
      <div className="space-y-4 text-xs" dir="rtl">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-400">
            <RotateCcw size={24} className="animate-spin text-emerald-500" />
            <span>جاري تحميل بيانات الطيارين والعهدة...</span>
          </div>
        ) : drivers.length === 0 ? (
          <div className="py-8 text-center text-zinc-400 space-y-2">
            <Bike size={32} className="mx-auto text-zinc-300 dark:text-zinc-700" />
            <p>لا يوجد مندوبو توصيل مسجلون في هذا الفرع حالياً.</p>
          </div>
        ) : selectedDriver ? (
          /* ── Settlement Form ── */
          <form onSubmit={handleConfirmSettle} className="space-y-4">
            <div className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  الطيار: {selectedDriver.name}
                </span>
                <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {selectedDriver.phone || selectedDriver.email}
                </p>
              </div>
              <div className="text-left">
                <span className="text-[11px] text-zinc-500">العهدة الحالية:</span>
                <p className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                  {Number(selectedDriver.wallet?.remainingToSettle || 0).toFixed(2)} {currency}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-zinc-900 dark:text-zinc-100">
                المبلغ المستلم توريده إلى درج الكاشير ({currency}):
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-zinc-900 dark:text-zinc-100">ملاحظات التوريد (اختياري):</label>
              <input
                type="text"
                value={settleNotes}
                onChange={(e) => setSettleNotes(e.target.value)}
                placeholder="مثال: تسليم كامل عهدة وردية المساء"
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedDriver(null)}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                رجوع
              </button>
              <button
                type="submit"
                disabled={settleMutation.isPending}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 size={15} />
                <span>{settleMutation.isPending ? 'جاري التسجيل...' : 'تأكيد استلام النقدية'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* ── Drivers List ── */
          <div className="space-y-2.5">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              قائمة مندوبي التوصيل وإجمالي المبالغ النقدية (COD) المحصلة بعهدتهم المطلوب توريدها للكاشير:
            </p>

            <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-2">
              {drivers.map((d) => {
                const remaining = Number(d.wallet?.remainingToSettle || 0);
                const totalCollected = Number(d.wallet?.totalCollected || 0);
                return (
                  <div
                    key={d.id}
                    className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold shrink-0">
                        <Bike size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                          {d.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono" dir="ltr">
                          {d.phone || d.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-left">
                        <span className="text-[10px] text-zinc-400">العهدة الحالية:</span>
                        <p className="font-mono font-black text-sm text-amber-600 dark:text-amber-400">
                          {remaining.toFixed(2)} <span className="text-[10px] font-normal">{currency}</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenSettleForm(d)}
                        className="px-3.5 py-2 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-sm cursor-pointer"
                      >
                        استلام العهدة
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CashierDriverSettlementModal;
