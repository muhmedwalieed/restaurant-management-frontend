import React from 'react';
import { Check, Plus, Minus } from 'lucide-react';

export const ModifierItemRow = ({
  mod,
  isOn,
  isQty,
  qty,
  priceDelta,
  onToggleSingle,
  onAdjustQty,
  currency = 'ج.م',
}) => {
  return (
    <div
      onClick={() => {
        if (!isQty) onToggleSingle(mod);
      }}
      className={`flex items-center justify-between gap-3 p-3.5 rounded-xl transition-all duration-150 ${
        !isQty ? 'cursor-pointer select-none' : ''
      }`}
      style={{
        background: isOn ? 'var(--ac-bg)' : 'var(--s2)',
        border: `1.5px solid ${isOn ? 'var(--ac)' : 'var(--bd)'}`,
      }}
    >
      {/* Name and Price */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold leading-tight" style={{ color: 'var(--t1)' }}>
            {mod.name}
          </span>
          {mod.isRequired && (
            <span className="badge b-warn" style={{ fontSize: 9, padding: '1px 5px' }}>
              إجباري
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {priceDelta > 0 ? (
            <span className="text-xs font-semibold mono" style={{ color: 'var(--ac)' }}>
              +{priceDelta.toFixed(2)} {currency}
            </span>
          ) : (
            <span className="badge b-ok" style={{ fontSize: 9, padding: '1px 5px' }}>
              مجاناً
            </span>
          )}
          {isQty && qty > 0 && priceDelta > 0 && (
            <span className="text-[11px] mono" style={{ color: 'var(--t3)' }}>
              (= {(priceDelta * qty).toFixed(2)} {currency})
            </span>
          )}
        </div>
      </div>

      {/* Quantity Stepper or Toggle Box */}
      <div className="shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {isQty ? (
          <div
            className="flex items-center gap-1 rounded-lg p-1"
            style={{ background: 'var(--s1)', border: '1px solid var(--bd)' }}
          >
            <button
              type="button"
              onClick={() => onAdjustQty(mod, -1)}
              disabled={qty <= (mod.isRequired ? 1 : 0)}
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30"
              style={{ background: 'var(--s3)', color: 'var(--t2)' }}
              title="إنقاص"
              aria-label={`إنقاص ${mod.name}`}
            >
              <Minus size={12} />
            </button>
            <span className="w-6 text-center text-xs font-bold mono" style={{ color: 'var(--t1)' }}>
              {qty}
            </span>
            <button
              type="button"
              onClick={() => onAdjustQty(mod, 1)}
              disabled={qty >= (mod.maxQuantity || 99)}
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30"
              style={{ background: 'var(--ac)', color: 'var(--ti, #ffffff)' }}
              title="زيادة"
              aria-label={`زيادة ${mod.name}`}
            >
              <Plus size={12} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onToggleSingle(mod)}
            disabled={mod.isRequired}
            aria-label={mod.name}
            className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-150 cursor-pointer"
            style={{
              background: isOn ? 'var(--ac)' : 'var(--s1)',
              border: isOn ? 'none' : '1.5px solid var(--bd)',
              color: 'var(--ti, #ffffff)',
            }}
          >
            {isOn && <Check size={14} strokeWidth={2.5} />}
          </button>
        )}
      </div>
    </div>
  );
};
