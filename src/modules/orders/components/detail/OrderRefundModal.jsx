import React from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { Input } from '../../../../shared/components/Input.jsx';
import { Button } from '../../../../shared/components/Button.jsx';

export const OrderRefundModal = ({
  isOpen,
  onClose,
  refundAmount,
  onChangeRefundAmount,
  refundReason,
  onChangeRefundReason,
  onConfirmRefund,
  isLoading,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="استرداد دفعة مالية"
      maxWidth="sm"
    >
      <div className="space-y-3 text-xs">
        <div>
          <label className="font-semibold block mb-1">مبلغ الاسترداد:</label>
          <Input
            type="number"
            value={refundAmount}
            onChange={(e) => onChangeRefundAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="font-semibold block mb-1">سبب الاسترداد:</label>
          <Input
            value={refundReason}
            onChange={(e) => onChangeRefundReason(e.target.value)}
            placeholder="سبب الاسترداد..."
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={isLoading}
            onClick={onConfirmRefund}
          >
            {isLoading ? 'جاري التنفيذ...' : 'تأكيد الاسترداد'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
