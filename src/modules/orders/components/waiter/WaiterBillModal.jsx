import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { formatTableLabel } from '../../../tables/utils/tableLabel.js';
import { PAYMENT_METHODS } from '../payment/paymentMethods.js';

export const WaiterBillModal = ({
  isOpen,
  onClose,
  table,
  onSettleBill,
  isSettling,
}) => {
  const { currency } = useCurrency();
  const [payMethod, setPayMethod] = useState('CASH');

  if (!isOpen || !table) return null;

  const session = table.session;
  const items = session?.items || [];
  const total = session?.total || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`فاتورة حساب ${formatTableLabel(table.displayNum)}`}
    >
      <div className="space-y-4 text-xs">
        {/* Bill preview */}
        <div className="p-4 rounded-xl border space-y-3" style={{ background: 'var(--s2)', borderColor: 'var(--bd)' }}>
          <div className="text-center pb-2 border-b border-dashed border-zinc-200 dark:border-white/10 space-y-1">
            <h3 className="font-bold text-sm" style={{ color: 'var(--t1)' }}>فاتورة شيك {formatTableLabel(table.displayNum)}</h3>
            <p className="text-[11px]" style={{ color: 'var(--t3)' }}>
              فُتحت الجلسة: {session.openedAt}
            </p>
          </div>

          <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-zinc-200 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className="mono font-bold" style={{ color: 'var(--ac)' }}>{it.qty}×</span>
                  <span style={{ color: 'var(--t1)' }}>{it.name}</span>
                </div>
                <span className="mono font-semibold" style={{ color: 'var(--t1)' }}>
                  {(it.qty * it.price).toFixed(2)} {currency}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-dashed border-zinc-300 dark:border-white/20 flex items-center justify-between text-sm font-bold">
            <span style={{ color: 'var(--t1)' }}>المبلغ المستحق:</span>
            <span className="mono text-base" style={{ color: 'var(--ac)' }}>
              {total.toFixed(2)} <span className="text-xs font-normal text-zinc-400">{currency}</span>
            </span>
          </div>
        </div>

        {/* Payment Method Selector for Direct Settlement */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--t2)' }}>
            طريقة تحصيل الحساب:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => {
              const Icon = m.Icon;
              const isSelected = payMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayMethod(m.id)}
                  className="py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  style={
                    isSelected
                      ? { borderColor: 'var(--ac)', background: 'var(--s3)', color: 'var(--ac)' }
                      : { borderColor: 'var(--bd)', background: 'var(--s1)', color: 'var(--t2)' }
                  }
                >
                  <Icon size={14} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t" style={{ borderColor: 'var(--bd)' }}>
          <button
            type="button"
            disabled={isSettling}
            onClick={() => onSettleBill(table, payMethod)}
            className="w-full py-2.5 rounded-lg text-xs font-bold text-white shadow-sm transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/20"
          >
            <CheckCircle2 size={15} />
            <span>{isSettling ? 'جاري التحصيل...' : 'تأكيد السداد وإغلاق الطاولة'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
