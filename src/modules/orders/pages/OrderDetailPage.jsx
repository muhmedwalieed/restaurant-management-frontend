import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Printer,
  CreditCard,
  XCircle,
  RotateCcw,
  UtensilsCrossed,
  Receipt,
  User,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import { useCurrency } from '../../../shared/hooks/useCurrency.js';
import { useOrderDetail } from '../hooks/useOrderDetail.js';
import { OrderDetailHeader } from '../components/detail/OrderDetailHeader.jsx';
import { OrderStatusTimeline } from '../components/detail/OrderStatusTimeline.jsx';
import { OrderCustomerCard } from '../components/detail/OrderCustomerCard.jsx';
import { OrderPaymentBreakdown } from '../components/detail/OrderPaymentBreakdown.jsx';
import { OrderHistoryAuditTimeline } from '../components/detail/OrderHistoryAuditTimeline.jsx';
import { OrderPaymentModal } from '../components/detail/OrderPaymentModal.jsx';
import { PosOrderCancelModal } from '../components/pos-orders/PosOrderCancelModal.jsx';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currency } = useCurrency();

  const {
    order,
    isLoading,
    isError,
    error,
    refetch,
    updateStatusMutation,
    paymentMutation,
    cancelMutation,
  } = useOrderDetail(id);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-zinc-500">جاري تحميل تفاصيل الطلب...</span>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">تعذر العثور على الطلب</h2>
        <p className="text-xs text-zinc-500">{error?.message || 'قد يكون الطلب غير موجود أو تم حذفه'}</p>
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold"
        >
          العودة لقائمة الطلبات
        </button>
      </div>
    );
  }

  const total = Number(order.totalAmount || order.total || 0);
  const paid = Number(order.paidAmount || 0);
  const remaining = Math.max(0, total - paid);

  const handleSettlePayment = ({ method, amount, reference }) => {
    paymentMutation.mutate(
      { method, amount, reference },
      {
        onSuccess: () => setShowPaymentModal(false),
      }
    );
  };

  const handleConfirmCancel = (cancelData) => {
    const reason = typeof cancelData === 'string' ? cancelData : cancelData?.reason || 'إلغاء الطلب';
    const refund = typeof cancelData === 'object' ? cancelData?.refund : false;
    const refundMethod = typeof cancelData === 'object' ? cancelData?.refundMethod : undefined;
    const refundAmount = typeof cancelData === 'object' ? cancelData?.refundAmount : undefined;

    cancelMutation.mutate(
      {
        expectedVersion: Number(order?.version || 1),
        reason,
        refund,
        refundMethod,
        refundAmount,
      },
      {
        onSuccess: () => {
          setShowCancelModal(false);
          setCancelReason('');
        },
      }
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto min-h-screen text-zinc-900 dark:text-zinc-100" dir="rtl">
      {/* Header & Breadcrumb */}
      <OrderDetailHeader
        order={order}
        onBack={() => navigate(-1)}
        onOpenPayment={() => setShowPaymentModal(true)}
        onOpenCancel={() => setShowCancelModal(true)}
        remainingAmount={remaining}
        currency={currency}
      />

      {/* Main Grid: Status timeline & items on right, breakdown & history on left */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Items & Status Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Tracker */}
          <OrderStatusTimeline
            currentStatus={order.status}
            statusHistory={order.statusHistory}
            orderType={order.orderType}
            onUpdateStatus={(status) => updateStatusMutation.mutate({ status })}
            isUpdating={updateStatusMutation.isPending}
          />

          {/* Items Table Card */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
              <span>الأصناف ({order.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 0})</span>
            </h3>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {(order.items || []).map((it, idx) => (
                <div key={it.id || idx} className="py-3 flex items-start justify-between gap-4 text-xs">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-mono font-bold flex items-center justify-center shrink-0">
                      {it.quantity || 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{it.productName || it.name || 'صنف'}</h4>
                      {it.notes && <p className="text-[11px] text-zinc-400 mt-0.5">{it.notes}</p>}
                    </div>
                  </div>

                  <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100 shrink-0" dir="ltr">
                    {(Number(it.unitPrice || it.price || 0) * (it.quantity || 1)).toFixed(2)} {currency}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit History Timeline */}
          <OrderHistoryAuditTimeline order={order} />
        </div>

        {/* Right Column (1 span): Customer Info & Financial Breakdown */}
        <div className="space-y-6">
          {/* Customer Card */}
          <OrderCustomerCard order={order} />

          {/* Financial Breakdown Card */}
          <OrderPaymentBreakdown
            order={order}
            onOpenPaymentModal={() => setShowPaymentModal(true)}
            currency={currency}
          />
        </div>
      </div>

      {/* Payment Modal */}
      <OrderPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        order={order}
        onConfirmPayment={handleSettlePayment}
        isSubmitting={paymentMutation.isPending}
      />

      {/* Cancel Modal */}
      <PosOrderCancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        order={order}
        cancelReason={cancelReason}
        onChangeCancelReason={setCancelReason}
        onConfirmCancel={handleConfirmCancel}
        isCancelling={cancelMutation.isPending}
        currency={currency}
      />
    </div>
  );
};

export default OrderDetailPage;
