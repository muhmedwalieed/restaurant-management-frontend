import React from 'react';
import { Button } from '../../../../shared/components/Button.jsx';
import { Bell, Send, Receipt } from 'lucide-react';

export const CartDrawerFooterActions = ({
  activeTab,
  consolidatedItems = [],
  cartTotalPrice,
  currency = 'EGP',
  totalSessionAmount = 0,
  isLocked = false,
  isAwaiting = false,
  waiterCooldownLeft = 0,
  isCallWaiterPending = false,
  isSubmitPending = false,
  session,
  onCallWaiter,
  onRequestBill,
  onSubmitOrder,
  onClose,
}) => {
  return (
    <div className="p-4 border-t border-border-default bg-bg-surface/95 backdrop-blur shrink-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-3">
      {activeTab === 'cart' ? (
        consolidatedItems.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-txt-muted">مجموع الطلب الحالي:</span>
              <span className="text-base font-bold text-txt-primary font-mono" dir="ltr">
                {cartTotalPrice} {currency}
              </span>
            </div>

            {!isLocked ? (
              <div className="flex gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Bell}
                  onClick={onCallWaiter}
                  disabled={isCallWaiterPending || waiterCooldownLeft > 0}
                  className="px-4 py-3 text-xs rounded-xl border-border-default hover:bg-bg-surface-elevated shrink-0"
                >
                  {waiterCooldownLeft > 0
                    ? `الويتر (${String(Math.floor(waiterCooldownLeft / 60)).padStart(2, '0')}:${String(waiterCooldownLeft % 60).padStart(2, '0')})`
                    : 'الويتر'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Send}
                  onClick={onSubmitOrder}
                  disabled={isSubmitPending}
                  className="flex-1 text-xs py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold"
                >
                  <span>اطلب الآن / إرسال الطلب للمطبخ ({cartTotalPrice} {currency})</span>
                </Button>
              </div>
            ) : (
              <p className="text-xs text-txt-muted text-center py-1 font-medium">
                {isAwaiting ? 'تم إرسال طلبكم، والويتر قادم لمراجعته وتأكيده معكم حالاً.' : 'شكراً لزيارتكم، نتمنى لكم وجبة شهية.'}
              </p>
            )}
          </>
        ) : (
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={Bell}
              onClick={onCallWaiter}
              disabled={isCallWaiterPending || waiterCooldownLeft > 0}
              className="flex-1 py-3 text-xs rounded-xl border-border-default hover:bg-bg-surface-elevated font-bold"
            >
              {waiterCooldownLeft > 0
                ? `استدعاء الويتر (${String(Math.floor(waiterCooldownLeft / 60)).padStart(2, '0')}:${String(waiterCooldownLeft % 60).padStart(2, '0')})`
                : 'استدعاء الويتر'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
              className="flex-1 py-3 text-xs rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-txt-inverted font-bold"
            >
              تصفح القائمة
            </Button>
          </div>
        )
      ) : (
        <div className="space-y-3">
          {session?.waiterCall && (
            <div
              className={`rounded-xl p-2.5 text-xs flex items-center gap-2 border ${
                session.waiterCall.status === 'ACCEPTED'
                  ? 'bg-status-success-bg border-status-success/30 text-status-success'
                  : session.waiterCall.type === 'BILL'
                  ? 'bg-status-warning-bg border-status-warning/30 text-status-warning'
                  : 'bg-status-warning-bg border-status-warning/30 text-status-warning'
              }`}
            >
              {session.waiterCall.type === 'BILL' ? (
                <Receipt className="w-4 h-4 shrink-0" />
              ) : (
                <Bell className="w-4 h-4 shrink-0" />
              )}
              <span className="font-semibold">
                {session.waiterCall.status === 'ACCEPTED'
                  ? (session.waiterCall.type === 'BILL'
                      ? 'الويتر في الطريق لطاولتكم ومعه الفاتورة'
                      : session.waiterCall.type === 'CONFIRM_ORDER'
                      ? 'الويتر في الطريق لمراجعة وتأكيد طلبكم'
                      : 'الويتر في الطريق لطاولتكم حالياً')
                  : (session.waiterCall.type === 'BILL'
                      ? 'تم طلب الفاتورة والحساب، بانتظار وصول الويتر'
                      : session.waiterCall.type === 'CONFIRM_ORDER'
                      ? 'تم إرسال الطلب، والويتر قادم لمراجعته حالاً'
                      : 'تم استدعاء الويتر، بانتظار وصول الويتر')}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-txt-muted">إجمالي حساب الجلسة:</span>
            <span className="text-base font-bold text-txt-primary font-mono text-lg" dir="ltr">
              {totalSessionAmount.toFixed(2)} {currency}
            </span>
          </div>

          <div className="flex gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={Bell}
              onClick={onCallWaiter}
              disabled={isCallWaiterPending || waiterCooldownLeft > 0}
              className="flex-1 py-3 text-xs rounded-xl border-border-default hover:bg-bg-surface-elevated font-bold"
            >
              {waiterCooldownLeft > 0
                ? `الويتر (${String(Math.floor(waiterCooldownLeft / 60)).padStart(2, '0')}:${String(waiterCooldownLeft % 60).padStart(2, '0')})`
                : 'استدعاء الويتر'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Receipt}
              onClick={onRequestBill || onCallWaiter}
              disabled={isCallWaiterPending || waiterCooldownLeft > 0}
              className="flex-1 py-3 text-xs rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-txt-inverted font-bold"
            >
              {waiterCooldownLeft > 0 && session?.waiterCall?.type === 'BILL'
                ? `تم الطلب (${String(Math.floor(waiterCooldownLeft / 60)).padStart(2, '0')}:${String(waiterCooldownLeft % 60).padStart(2, '0')})`
                : 'طلب الفاتورة والحساب'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
