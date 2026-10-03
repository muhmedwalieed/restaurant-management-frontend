import React from 'react';
import { Minus, Plus } from 'lucide-react';

export const CartDrawerItemRow = ({
  item,
  currency = 'EGP',
  currentMemberName,
  isLocked,
  onDecrement,
  onIncrement,
}) => {
  const isMyItem = Boolean(currentMemberName && item.addedByName === currentMemberName);
  const lineTotal = Number(item.total) || 0;
  const totalLabel = lineTotal % 1 === 0 ? lineTotal.toFixed(0) : lineTotal.toFixed(2);

  return (
    <div className="py-2 px-2.5 rounded-xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
      {/* Section 1: name + price */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
          {item.productName}
        </span>
        <span className="text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100 shrink-0" dir="ltr">
          {totalLabel} {currency}
        </span>
      </div>

      {/* Divider, then quantity + stepper, with who added it pinned far left */}
      <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80">
        {!isLocked && isMyItem ? (
          <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold rounded-lg px-1.5 py-0.5 flex items-center gap-1">
            <button
              type="button"
              onClick={() => onDecrement(item)}
              className="w-6 h-6 rounded flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/90 dark:hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer"
              aria-label={item.quantity === 1 ? 'حذف الصنف' : 'تقليل الكمية'}
              title={item.quantity === 1 ? 'حذف الصنف' : 'تقليل الكمية'}
            >
              <Minus size={12} aria-hidden="true" />
            </button>
            <span className="text-xs font-bold w-5 text-center font-mono">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(item)}
              className="w-6 h-6 rounded flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/90 dark:hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer"
              aria-label="زيادة الكمية"
              title="زيادة الكمية"
            >
              <Plus size={12} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400" dir="ltr">
            × {item.quantity}
          </span>
        )}

        {item.addedByName && (
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate text-left min-w-0">
            {isMyItem ? 'أضفتها أنت' : `أضافها ${item.addedByName}`}
          </span>
        )}
      </div>
    </div>
  );
};

export default CartDrawerItemRow;
