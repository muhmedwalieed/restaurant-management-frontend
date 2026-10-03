import React from 'react';
import { ShoppingCart, Minus, Plus, Trash2, Bell, Send } from 'lucide-react';
import { Button } from '../../../../shared/components/Button.jsx';
import { SessionOrdersList } from '../SessionOrdersList.jsx';

export const TableSidebarCart = ({
  cartRows = [],
  totalCartItems = 0,
  cartTotalPrice = '0.00',
  currency = 'EGP',
  myName = '',
  locked = false,
  isAwaiting = false,
  sessionOrders = [],
  waiterCooldownLeft = 0,
  isCallWaiterPending = false,
  isSubmitPending = false,
  onUpdateQuantity,
  onRemoveItem,
  onRequestWaiter,
  onRequestSubmit,
}) => {
  return (
    <aside className="hidden lg:block lg:sticky lg:top-20">
      <div className="bg-bg-surface border border-border-default rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-border-default flex items-center justify-between">
          <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-brand-primary" />
            <span>سلة الطلب</span>
          </h3>
          <span className="text-xs text-txt-muted">{totalCartItems} صنف</span>
        </div>

        {/* Items List */}
        <div className="p-4 space-y-3 max-h-[45vh] overflow-y-auto custom-scrollbar">
          {cartRows.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <ShoppingCart className="w-6 h-6 text-txt-muted/40 mx-auto" />
              <p className="text-xs text-txt-muted">سلتك فاضية، اختار من القائمة.</p>
            </div>
          ) : (
            cartRows.map((row, idx) => {
              const isMyItem = !row.addedByName || !myName || row.addedByName === myName;
              return (
                <div key={idx} className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-txt-primary truncate">
                      {row.productName || row.productId}
                    </p>
                    <p className="text-[11px] text-txt-muted mt-0.5">
                      {row.addedByName
                        ? isMyItem
                          ? `أضفتها أنت (${row.addedByName})`
                          : `أضافها: ${row.addedByName}`
                        : 'عميل'}
                    </p>
                    <p className="text-xs font-semibold text-txt-muted mt-0.5" dir="ltr">
                      {(row.unitPrice || row.total / row.quantity || 0).toFixed(2)} {currency}
                    </p>
                  </div>

                  {isMyItem ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(row.itemIds[0], (row.quantity || 1) - 1)
                        }
                        disabled={locked || (row.quantity || 1) <= 1}
                        className="w-9 h-9 rounded-lg flex items-center justify-center bg-bg-surface-elevated text-txt-muted hover:text-txt-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title="إنقاص الكمية"
                      >
                        <Minus className="w-4 h-4" aria-hidden="true" />
                      </button>

                      <span className="text-xs font-bold text-txt-primary w-6 text-center">
                        {row.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(row.itemIds[0], (row.quantity || 1) + 1)
                        }
                        disabled={locked}
                        className="w-9 h-9 rounded-lg flex items-center justify-center bg-bg-surface-elevated text-txt-muted hover:text-txt-primary disabled:opacity-40 transition-colors cursor-pointer"
                        title="زيادة الكمية"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(row.itemIds[0])}
                        disabled={locked}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-txt-muted hover:text-status-danger disabled:opacity-40 transition-colors cursor-pointer"
                        title="حذف الصنف"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-surface-elevated border border-border-default text-xs text-txt-muted shrink-0"
                      title={`أضافها: ${row.addedByName}`}
                    >
                      <span className="font-bold text-txt-primary">× {row.quantity}</span>
                      <span className="text-[10px] text-txt-muted/70">({row.addedByName})</span>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {sessionOrders.length > 0 && (
            <div className="pt-3 border-t border-border-subtle">
              <SessionOrdersList orders={sessionOrders} currency={currency} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3.5 border-t border-border-default bg-bg-surface/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-txt-muted">الإجمالي النهائي:</span>
            <span className="text-base font-bold text-txt-primary font-mono" dir="ltr">
              {cartTotalPrice} {currency}
            </span>
          </div>

          {!locked ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="md"
                radius="lg"
                icon={Bell}
                onClick={onRequestWaiter}
                isDisabled={isCallWaiterPending || waiterCooldownLeft > 0}
                className="whitespace-nowrap bg-transparent hover:bg-bg-surface-elevated"
              >
                {waiterCooldownLeft > 0
                  ? `استدعاء الويتر (${String(Math.floor(waiterCooldownLeft / 60)).padStart(2, '0')}:${String(waiterCooldownLeft % 60).padStart(2, '0')})`
                  : 'استدعاء الويتر'}
              </Button>

              <Button
                variant="primary"
                size="md"
                radius="lg"
                icon={Send}
                onClick={onRequestSubmit}
                isDisabled={totalCartItems === 0 || isSubmitPending}
                className="flex-1"
              >
                اطلب الآن
              </Button>
            </div>
          ) : (
            <p className="text-xs text-txt-muted text-center py-1">
              {isAwaiting
                ? 'تم إرسال الطلب، والويتر قادم لمراجعته معكم حالاً.'
                : 'شكراً لزيارتكم، نتمنى لكم وجبة شهية.'}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};
