import React from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { Input } from '../../../../shared/components/Input.jsx';
import { Button } from '../../../../shared/components/Button.jsx';

export const OrderCancelModal = ({
  isOpen,
  onClose,
  cancelReason,
  onChangeCancelReason,
  onConfirmCancel,
  isLoading,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إلغاء الطلب"
      maxWidth="sm"
    >
      <div className="space-y-3 text-xs">
        <p className="text-txt-muted">هل أنت متأكد من رغبتك في إلغاء هذا الطلب نهائياً؟</p>
        <div>
          <label className="font-semibold block mb-1">سبب الإلغاء:</label>
          <Input
            value={cancelReason}
            onChange={(e) => onChangeCancelReason(e.target.value)}
            placeholder="مثال: بناءً على طلب العميل..."
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={onClose}>
            تراجع
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={isLoading}
            onClick={onConfirmCancel}
          >
            {isLoading ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
