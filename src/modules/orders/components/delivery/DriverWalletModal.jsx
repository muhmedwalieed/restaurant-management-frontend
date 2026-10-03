import React from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { Coins, CheckCircle2, ArrowDownLeft, Clock, History, AlertCircle } from 'lucide-react';

export const DriverWalletModal = ({
  isOpen,
  onClose,
  walletData,
}) => {
  const { currency } = useCurrency();

  if (!isOpen) return null;

  const totalCollected = Number(walletData?.totalCollected || 0);
  const totalSettled = Number(walletData?.totalSettled || 0);
  const remaining = Number(walletData?.remainingToSettle || 0);
  const orders = walletData?.orders || [];
  const settlements = walletData?.settlements || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="محفظة العهدة النقدية (COD)"
      size="md"
    >
      <div className="space-y-4 text-xs" dir="rtl">
        {/* ── Summary Stats Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/10 space-y-1 text-center">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              العهدة الحالية المطلوب تسليمها
            </span>
            <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-300">
              {remaining.toFixed(2)}{' '}
              <span className="text-xs font-normal">{currency}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 space-y-1 text-center">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              إجمالي المبالغ المحصلة
            </span>
            <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-300">
              {totalCollected.toFixed(2)}{' '}
              <span className="text-xs font-normal">{currency}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-blue-500/20 bg-blue-500/10 space-y-1 text-center">
            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">
              المبالغ المسلمة للكاشير
            </span>
            <div className="text-lg font-black font-mono text-blue-600 dark:text-blue-300">
              {totalSettled.toFixed(2)}{' '}
              <span className="text-xs font-normal">{currency}</span>
            </div>
          </div>
        </div>

        {/* ── Info Notice ── */}
        <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-start gap-2.5 text-[11px] text-zinc-600 dark:text-zinc-400">
          <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <span>
            يتم احتساب المبالغ النقدية (COD) عند الضغط على "تم التسليم" للطلبات النقدية. عند رجوعك للمطعم يقوم الكاشير بتصفية العهدة واستلام المبالغ.
          </span>
        </div>

        {/* ── Cash Orders List ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-bold text-xs text-zinc-900 dark:text-zinc-100">
            <div className="flex items-center gap-1.5">
              <History size={14} />
              <span>الطلبات النقدية المسلمة ({orders.length})</span>
            </div>
          </div>

          {orders.length === 0 ? (
            <p className="text-center py-6 text-zinc-400">لا توجد طلبات نقدية مسجلة بعد.</p>
          ) : (
            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1.5">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-black/5 dark:bg-white/10 text-zinc-800 dark:text-zinc-200">
                      #{o.orderNumber}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {o.paidAt ? new Date(o.paidAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    +{Number(o.total).toFixed(2)} {currency}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Cashier Settlements History ── */}
        {settlements.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
              سجل التوريدات للكاشير ({settlements.length})
            </h4>
            <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1.5">
              {settlements.map((s) => (
                <div
                  key={s.id}
                  className="p-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-between gap-2 text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-500" />
                    <span>تم التوريد للكاشير</span>
                    <span className="text-zinc-400">
                      {new Date(s.settledAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    -{Number(s.amount).toFixed(2)} {currency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DriverWalletModal;
