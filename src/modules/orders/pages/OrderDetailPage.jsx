import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { ReceiptPrintTemplate } from '../components/ReceiptPrintTemplate.jsx';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

import { OrderDetailHeader } from '../components/detail/OrderDetailHeader.jsx';
import { OrderStatusTimeline } from '../components/detail/OrderStatusTimeline.jsx';
import { OrderCustomerCard } from '../components/detail/OrderCustomerCard.jsx';
import { OrderItemsTable } from '../components/detail/OrderItemsTable.jsx';
import { OrderPaymentBreakdown } from '../components/detail/OrderPaymentBreakdown.jsx';
import { OrderHistoryAuditTimeline } from '../components/detail/OrderHistoryAuditTimeline.jsx';
import { OrderCancelModal } from '../components/detail/OrderCancelModal.jsx';
import { OrderPaymentModal } from '../components/detail/OrderPaymentModal.jsx';
import { OrderRefundModal } from '../components/detail/OrderRefundModal.jsx';
import { useOrderDetail } from '../hooks/useOrderDetail.js';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeBranchId } = useBranch();

  const {
    order,
    isOrderLoading,
    isError,
    error,
    historyData,
    orderRounds,
    actionSuccess,
    actionError,
    isCancelModalOpen,
    setIsCancelModalOpen,
    cancelReason,
    setCancelReason,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    paymentAmount,
    setPaymentAmount,
    paymentMethod,
    setPaymentMethod,
    isRefundModalOpen,
    setIsRefundModalOpen,
    refundAmount,
    setRefundAmount,
    refundReason,
    setRefundReason,
    isPrintModalOpen,
    setIsPrintModalOpen,
    updateStatusMutation,
    cancelMutation,
    paymentMutation,
    refundMutation,
    handleStatusChange,
    handleCancelOrder,
    handlePayment,
    handleRefund,
  } = useOrderDetail(activeBranchId, id);

  if (isOrderLoading) {
    return (
      <div className="space-y-4 p-4">
        <LoadingSkeleton height={48} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <LoadingSkeleton height={200} />
            <LoadingSkeleton height={150} />
          </div>
          <div className="space-y-4">
            <LoadingSkeleton height={160} />
            <LoadingSkeleton height={140} />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>تعذر تحميل تفاصيل الطلب</span>
        </div>
        <p>{error?.message || 'لم يتم العثور على الطلب المطلوب.'}</p>
        <Button size="sm" variant="outline" onClick={() => navigate('/orders')}>
          العودة للطلبات
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 print:hidden">
      <OrderDetailHeader
        order={order}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
      />

      {actionSuccess && (
        <div className="p-3 rounded-lg text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3 rounded-lg text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-5">
          <OrderStatusTimeline
            order={order}
            onStatusChange={handleStatusChange}
            isUpdatingStatus={updateStatusMutation.isPending}
            onOpenCancelModal={() => setIsCancelModalOpen(true)}
          />

          <OrderItemsTable
            order={order}
            orderRounds={orderRounds}
          />
        </div>

        <div className="space-y-5">
          <OrderCustomerCard order={order} />

          <OrderPaymentBreakdown
            order={order}
            onOpenPaymentModal={() => {
              setPaymentAmount(String(Math.max(0, Number(order.total || 0) - Number(order.amountPaid || 0))));
              setIsPaymentModalOpen(true);
            }}
            onOpenRefundModal={() => {
              setRefundAmount(String(order.amountPaid || order.total || 0));
              setIsRefundModalOpen(true);
            }}
          />

          <OrderHistoryAuditTimeline history={historyData || []} />
        </div>
      </div>

      <OrderCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        cancelReason={cancelReason}
        onChangeCancelReason={setCancelReason}
        onConfirmCancel={handleCancelOrder}
        isLoading={cancelMutation.isPending}
      />

      <OrderPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentAmount={paymentAmount}
        onChangePaymentAmount={setPaymentAmount}
        paymentMethod={paymentMethod}
        onChangePaymentMethod={setPaymentMethod}
        onConfirmPayment={handlePayment}
        isLoading={paymentMutation.isPending}
      />

      <OrderRefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        refundAmount={refundAmount}
        onChangeRefundAmount={setRefundAmount}
        refundReason={refundReason}
        onChangeRefundReason={setRefundReason}
        onConfirmRefund={handleRefund}
        isLoading={refundMutation.isPending}
      />

      {isPrintModalOpen && (
        <Modal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="طباعة إيصال الفاتورة"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs text-center p-4">
            <ReceiptPrintTemplate order={order} />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrderDetailPage;
