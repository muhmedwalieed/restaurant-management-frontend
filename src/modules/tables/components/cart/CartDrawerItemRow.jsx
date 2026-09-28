import React from 'react';
import { Users, Minus, Plus, Trash2 } from 'lucide-react';

export const CartDrawerItemRow = ({
  item,
  currency = 'EGP',
  currentMemberName,
  isLocked,
  onDecrement,
  onIncrement,
  onRemove,
}) => {
  const isMyItem = Boolean(currentMemberName && item.addedByName === currentMemberName);

  return (
    <div className="flex items-center justify-between gap-3 bg-bg-base/60 border border-border-subtle rounded-xl p-3">
      <div className="min-w-0 flex-1 space-y-0.5 text-right">
        <p className="text-xs font-bold text-txt-primary truncate">{item.productName}</p>
        <div className="flex items-center gap-2 text-[11px] text-txt-muted">
          <span className="font-mono font-bold text-brand-primary" dir="ltr">
            {Number(item.total).toFixed(2)} {currency}
          </span>
          {item.quantity > 1 && (
            <span className="text-[10px] text-txt-muted/70" dir="ltr">
              ({item.quantity} × {Number(item.unitPrice).toFixed(2)} / قطعة)
            </span>
          )}
        </div>
        {item.addedByName && (
          <p className="text-[10px] text-brand-primary/90 flex items-center gap-1 pt-0.5">
            <Users className="w-3 h-3 shrink-0" />
            <span>{isMyItem ? `أضفتها أنت (${item.addedByName})` : `أضافها ${item.addedByName}`}</span>
          </p>
        )}
      </div>

      {!isLocked && (
        isMyItem ? (
          <div className="flex items-center gap-1.5 shrink-0 bg-bg-surface border border-border-default rounded-lg p-1">
            <button
              type="button"
              onClick={() => onDecrement(item)}
              className="w-7 h-7 rounded-md bg-bg-base hover:bg-bg-surface-elevated text-txt-primary flex items-center justify-center transition-colors cursor-pointer"
              aria-label={item.quantity === 1 ? 'حذف الصنف' : 'إنقاص الكمية'}
              title="إنقاص الكمية"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="w-6 text-center text-xs font-mono font-bold text-txt-primary">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() => onIncrement(item)}
              className="w-7 h-7 rounded-md bg-bg-base hover:bg-bg-surface-elevated text-txt-primary flex items-center justify-center transition-colors cursor-pointer"
              aria-label="زيادة الكمية"
              title="زيادة الكمية"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onRemove(item)}
              className="w-7 h-7 rounded-md hover:text-status-danger hover:bg-status-danger/10 text-txt-muted flex items-center justify-center transition-colors cursor-pointer"
              aria-label="حذف الصنف"
              title="حذف الصنف"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg-surface border border-border-default text-xs text-txt-muted shrink-0"
            title={`أضافها: ${item.addedByName} — لا يمكن تعديلها أو حذفها`}
          >
            <span className="text-xs font-mono font-bold text-txt-primary">× {item.quantity}</span>
            <span className="text-[10px] text-txt-muted/80">({item.addedByName})</span>
          </div>
        )
      )}
    </div>
  );
};
