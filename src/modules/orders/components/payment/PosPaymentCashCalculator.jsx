import React from 'react';

export const PosPaymentCashCalculator = ({
  total,
  amountPaid,
  setAmountPaid,
  _paid,
  remaining,
  change,
}) => {
  const quickBills = [50, 100, 200];

  return (
    <div className="p-3 bg-slate-50 border border-border-default rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-txt-primary">المبلغ المدفوع</label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setAmountPaid(String(total))}
            className="text-[10px] px-2 py-0.5 rounded bg-white border border-border-default font-medium hover:border-slate-400 transition-colors cursor-pointer"
          >
            المبلغ بالضبط
          </button>
          {quickBills.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setAmountPaid(String(b))}
              className="text-[10px] px-2 py-0.5 rounded bg-white border border-border-default font-mono font-medium hover:border-slate-400 transition-colors cursor-pointer"
            >
              {b}ج
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <input
          type="number"
          step="any"
          dir="ltr"
          className="inp text-sm font-mono font-bold text-txt-primary"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          placeholder="0.00"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-txt-muted pointer-events-none">
          EGP
        </span>
      </div>

      <div className="flex items-center justify-between pt-1 text-xs border-t border-border-default">
        {change > 0 ? (
          <div className="flex items-center gap-1.5 text-status-success font-bold">
            <span>الباقي للعميل:</span>
            <span className="font-mono text-sm">{change.toFixed(2)} ج</span>
          </div>
        ) : remaining > 0 ? (
          <div className="flex items-center gap-1.5 text-status-danger font-bold">
            <span>المتبقي على العميل:</span>
            <span className="font-mono text-sm">{remaining.toFixed(2)} ج</span>
          </div>
        ) : (
          <span className="text-txt-muted text-[11px]">تم استلام الحساب كاملاً بدون باقي</span>
        )}
      </div>
    </div>
  );
};
