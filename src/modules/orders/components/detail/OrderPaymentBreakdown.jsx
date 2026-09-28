import React from 'react';
import { Wallet, Banknote, RotateCcw } from 'lucide-react';
import { StatusPill } from '../../../../shared/components/StatusPill.jsx';
import { Button } from '../../../../shared/components/Button.jsx';
import { PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS, paymentStatusPill } from '../../schemas/order.schema.js';

export const OrderPaymentBreakdown = ({
  order,
  onOpenPaymentModal,
  onOpenRefundModal,
}) => {
  if (!order) return null;

  const total = Number(order.total || 0);
  const paid = order.paymentStatus === 'PAID' ? total : Number(order.amountPaid || 0);
  const remaining = Math.max(0, total - paid);

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-4 space-y-3 shadow-sm text-xs">
      <div className="flex items-center justify-between border-b border-border-subtle/50 pb-2">
        <h3 className="font-bold text-txt-primary flex items-center gap-2">
          <Wallet className="w-4 h-4 text-brand-primary" />
          <span>حالة الدفع والمعاملات المالية</span>
        </h3>

        <StatusPill status={paymentStatusPill(order.paymentStatus)}>
          {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
        </StatusPill>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-txt-muted">طريقة الدفع:</span>
          <span className="font-semibold text-txt-primary">
            {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod || 'غير محدد'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-txt-muted">المبلغ المدفوع:</span>
          <span className="font-mono font-bold text-emerald-400">
            {paid.toFixed(2)} EGP
          </span>
        </div>

        {remaining > 0 && order.status !== 'CANCELLED' && (
          <div className="flex items-center justify-between text-red-400 font-bold pt-1 border-t border-white/5">
            <span>المتبقي للتحصيل:</span>
            <span className="font-mono">{remaining.toFixed(2)} EGP</span>
          </div>
        )}
      </div>

      {/* Payment & Refund Action Buttons */}
      <div className="pt-2 border-t border-border-subtle/40 flex items-center gap-2">
        {remaining > 0 && order.status !== 'CANCELLED' && (
          <Button
            size="sm"
            variant="primary"
            className="flex-1 text-xs font-bold"
            icon={Banknote}
            onClick={onOpenPaymentModal}
          >
            تسجيل دفعة
          </Button>
        )}

        {paid > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs text-red-400 hover:border-red-500/30"
            icon={RotateCcw}
            onClick={onOpenRefundModal}
          >
            استرداد مبلغ
          </Button>
        )}
      </div>
    </div>
  );
};
