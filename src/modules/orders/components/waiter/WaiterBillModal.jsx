import React, { useState } from 'react';
import { Printer, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';

export const WaiterBillModal = ({
  isOpen,
  onClose,
  table,
  onPrintBill,
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
      title={`فاتورة حساب طاولة ${table.displayNum}`}
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Printable Bill Preview Container */}
        <div className="p-4 rounded-xl border space-y-3" style={{ background: 'var(--s2)', borderColor: 'var(--bd)' }}>
          <div className="text-center pb-2 border-b border-dashed border-white/10 space-y-1">
            <h3 className="font-bold text-sm" style={{ color: 'var(--t1)' }}>فاتورة شيك طاولة {table.displayNum}</h3>
            <p className="text-[11px]" style={{ color: 'var(--t3)' }}>
              فُتحت الجلسة: {session.openedAt}
            </p>
          </div>

          <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1.5">
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
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

          <div className="pt-2 border-t border-dashed border-white/20 flex items-center justify-between text-sm font-bold">
            <span style={{ color: 'var(--t1)' }}>المبلغ المستحق:</span>
            <span className="mono text-base" style={{ color: 'var(--ac)' }}>
              {total.toFixed(2)} <span className="text-xs font-normal text-slate-400">{currency}</span>
            </span>
          </div>
        </div>

        {/* Payment Method Selector for Direct Settlement */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--t2)' }}>
            طريقة تحصيل الحساب:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'CASH', label: 'نقدي' },
              { id: 'CARD', label: 'بطاقة بنكية / فيزا' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPayMethod(m.id)}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                  payMethod === m.id
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                    : 'border-border-default bg-bg-surface text-txt-muted'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--bd)' }}>
          <button
            type="button"
            onClick={() => onPrintBill(table)}
            className="px-4 py-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors hover:bg-white/5 cursor-pointer"
            style={{ borderColor: 'var(--bd)', color: 'var(--t1)' }}
          >
            <Printer size={15} />
            <span>طباعة الإيصال الحراري</span>
          </button>

          <button
            type="button"
            disabled={isSettling}
            onClick={() => onSettleBill(table, payMethod)}
            className="px-5 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all active:scale-98 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            style={{ background: 'var(--ok)' }}
          >
            <CheckCircle2 size={15} />
            <span>{isSettling ? 'جاري التحصيل...' : 'تأكيد السداد وإغلاق الطاولة'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
