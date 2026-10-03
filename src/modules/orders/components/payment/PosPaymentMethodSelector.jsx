import React from 'react';
import { PAYMENT_METHODS } from './paymentMethods.js';

export const PosPaymentMethodSelector = ({
  payMethod,
  setPayMethod,
}) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-txt-primary">طريقة الدفع</label>
      <div className="grid grid-cols-4 gap-2">
        {PAYMENT_METHODS.map((m) => {
          const isSelected = payMethod === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setPayMethod(m.id)}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                isSelected
                  ? 'bg-ac text-txt-inverted shadow-xs'
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
