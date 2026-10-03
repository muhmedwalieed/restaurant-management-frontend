import React from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { Input } from '../../../../shared/components/Input.jsx';
import { Button } from '../../../../shared/components/Button.jsx';
import { PAYMENT_METHODS } from '../payment/paymentMethods.js';

export const OrderPaymentModal = ({
  isOpen,
  onClose,
  paymentAmount,
  onChangePaymentAmount,
  paymentMethod,
  onChangePaymentMethod,
  onConfirmPayment,
  isLoading,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تسجيل دفعة مالية"
      maxWidth="sm"
    >
      <div className="space-y-3 text-xs">
        <div>
          <label className="font-semibold block mb-1">المبلغ المطلوب سداده:</label>
          <Input
            type="number"
            value={paymentAmount}
            onChange={(e) => onChangePaymentAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="font-semibold block mb-1">طريقة الدفع:</label>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onChangePaymentMethod(m.id)}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer ${
                  paymentMethod === m.id
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                    : 'border-border-default'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            size="sm"
            variant="primary"
            disabled={isLoading}
            onClick={onConfirmPayment}
          >
            {isLoading ? 'جاري الحفظ...' : 'تأكيد السداد'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
