import React from 'react';
import { Button } from '../../../../shared/components/Button.jsx';
import { CartDrawerItemRow } from './CartDrawerItemRow.jsx';
import { ShoppingCart } from 'lucide-react';

export const CartDrawerItemList = ({
  consolidatedItems = [],
  currency = 'EGP',
  currentMemberName,
  isLocked,
  onClose,
  onDecrement,
  onIncrement,
  onRemove,
}) => {
  if (consolidatedItems.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <span className="inline-flex p-4 rounded-full bg-brand-primary/5 text-brand-primary/40">
          <ShoppingCart className="w-8 h-8" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-bold text-txt-primary">السلة فاضية</p>
          <p className="text-xs text-txt-muted max-w-xs mx-auto">
            اضغط «أضف» على أي صنف من القائمة لإضافته للسلة الحالية.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="mt-2 text-xs py-2 px-5 rounded-xl border-border-default hover:bg-bg-surface-elevated font-semibold"
        >
          تصفح القائمة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {consolidatedItems.map((item) => (
        <CartDrawerItemRow
          key={item.id}
          item={item}
          currency={currency}
          currentMemberName={currentMemberName}
          isLocked={isLocked}
          onDecrement={onDecrement}
          onIncrement={onIncrement}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};
