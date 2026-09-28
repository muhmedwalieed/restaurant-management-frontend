import React, { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { CheckCircle2, Printer, CreditCard, Banknote, Wallet, QrCode } from 'lucide-react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';

const PAYMENT_METHODS = [
  { id: 'cash', label: 'كاش', icon: Banknote },
  { id: 'card', label: 'بطاقة فيزا', icon: CreditCard },
  { id: 'wallet', label: 'محفظة', icon: Wallet },
  { id: 'instapay', label: 'انستاباي', icon: QrCode },
];

export const PosCheckoutModal = ({
  isOpen,
  onClose,
  total = 0,
  _cart = [],
  _customerInfo = {},
  _orderType = 'DINE_IN',
  onConfirmCheckout,
  isLoading,
}) => {
  const { currency } = useCurrency();
  const [payMethod, setPayMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [autoPrint, setAutoPrint] = useState(true);

  const numReceived = Number(amountReceived) || 0;
  const change = Math.max(0, numReceived - total);

  const handleQuickCash = (delta) => {
    setAmountReceived((prev) => String((Number(prev) || 0) + delta));
  };

  const handleExactCash = () => {
    setAmountReceived(String(Math.ceil(total)));
  };

  const handleSubmit = () => {
    onConfirmCheckout({
      payMethod,
      amountReceived: numReceived || total,
      autoPrint,
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إنهاء الطلب وتحصيل الحساب"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Total Summary Banner */}
        <div className="p-4 rounded-xl border text-center space-y-1" style={{ background: 'var(--s2)', borderColor: 'var(--bd)' }}>
          <span className="text-xs" style={{ color: 'var(--t2)' }}>المبلغ الإجمالي المطلوب</span>
          <div className="text-2xl mono font-bold" style={{ color: 'var(--ac)' }}>
            {Number(total).toFixed(2)} <span className="text-xs font-normal" style={{ color: 'var(--t3)' }}>{currency}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--t2)' }}>
            طريقة الدفع:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PAYMENT_METHODS.map((m) => {
              const Icon = m.icon;
              const isSel = payMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayMethod(m.id)}
                  className={`py-2 px-3 rounded-xl border font-bold flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                    isSel
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                      : 'border-border-default bg-bg-surface text-txt-muted'
                  }`}
                >
                  <Icon size={16} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash Calculator if method is CASH */}
        {payMethod === 'cash' && (
          <div className="space-y-2.5 p-3 rounded-xl border" style={{ background: 'var(--s2)', borderColor: 'var(--bd)' }}>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--t2)' }}>
                المبلغ المستلم من العميل:
              </label>
              <input
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder="أدخل المبلغ المستلم..."
                className="w-full py-2 px-3 rounded-lg bg-bg-surface border border-border-default text-sm mono font-bold text-txt-primary"
              />
            </div>

            {/* Quick cash denomination buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleExactCash}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/10 hover:bg-white/20 text-slate-200"
              >
                المبلغ بالضبط
              </button>
              {[20, 50, 100, 200].map((bill) => (
                <button
                  key={bill}
                  type="button"
                  onClick={() => handleQuickCash(bill)}
                  className="px-2 py-1 rounded-md text-[11px] font-mono font-bold bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  +{bill}
                </button>
              ))}
            </div>

            {/* Change calculation */}
            {numReceived >= total && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                <span>المبلغ المتبقي للعميل (الباقي):</span>
                <span className="mono text-sm">{change.toFixed(2)} {currency}</span>
              </div>
            )}
          </div>
        )}

        {/* Auto Print Receipt Toggle */}
        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer" style={{ color: 'var(--t2)' }}>
          <input
            type="checkbox"
            checked={autoPrint}
            onChange={(e) => setAutoPrint(e.target.checked)}
            className="rounded text-brand-primary"
          />
          <Printer size={14} className="text-slate-400" />
          <span>طباعة إيصال الفاتورة تلقائياً بعد الحفظ</span>
        </label>

        {/* Modal Submit */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--bd)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border text-xs font-medium text-slate-300 hover:bg-white/5 cursor-pointer"
            style={{ borderColor: 'var(--bd)' }}
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl font-bold text-xs text-white shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            style={{ background: 'var(--ok)' }}
          >
            <CheckCircle2 size={16} />
            <span>{isLoading ? 'جاري التنفيذ...' : 'تأكيد وحفظ الطلب'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
