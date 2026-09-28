import React from 'react';

const PAY_METHODS = [
  { id: 'CASH', label: 'كاش' },
  { id: 'WALLET', label: 'محفظة' },
  { id: 'INSTAPAY', label: 'انستاباي' },
  { id: 'CARD', label: 'بطاقة' },
];

export const PosPaymentMethodSelector = ({
  payMethod,
  setPayMethod,
}) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-txt-primary">طريقة الدفع</label>
      <div className="grid grid-cols-4 gap-2">
        {PAY_METHODS.map((m) => {
          const isSelected = payMethod === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setPayMethod(m.id)}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                isSelected
                  ? 'bg-ac text-white shadow-xs'
                  : 'bg-white text-txt-muted border border-border-default hover:text-txt-primary hover:border-slate-400'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
