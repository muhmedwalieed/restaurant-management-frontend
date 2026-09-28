import React, { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { Button } from '../../../../shared/components/Button.jsx';
import { Select } from '../../../../shared/components/Select.jsx';
import { Lock, XCircle } from 'lucide-react';

export const CloseResolutionModal = ({
  isOpen,
  onClose,
  onConfirmClose,
  isPending,
}) => {
  const [form, setForm] = useState({
    resolutionStatus: 'RESOLVED',
    resolutionCategory: 'GENERAL_INQUIRY',
    resolutionNotes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmClose(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="نموذج إغلاق التذكرة وتوثيق الحل"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-status-danger-bg/20 border border-status-danger/30 rounded-lg text-xs text-status-danger space-y-1">
          <strong className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            تنبيه مهم:
          </strong>
          <p>
            إغلاق التذكرة هو إجراء نهائي لا يمكن التراجع عنه أو إعادة فتح التذكرة بعده. وسيتم إرسال استبيان تقييم فوري للعميل عبر الواتساب.
          </p>
        </div>

        <Select
          label="هل تم حل المشكلة مع العميل؟"
          options={[
            { value: 'RESOLVED', label: 'تم حل المشكلة بنجاح (Resolved)' },
            { value: 'UNRESOLVED', label: 'تعذر الحل / عدم تجاوب العميل (Unresolved)' },
            { value: 'CANCELLED', label: 'إلغاء التذكرة - طلب مكرر أو خاطئ (Cancelled)' },
          ]}
          value={form.resolutionStatus}
          onChange={(e) =>
            setForm({ ...form, resolutionStatus: e.target.value })
          }
        />

        <Select
          label="تصنيف سبب المشكلة / نوع الاستفسار"
          options={[
            { value: 'GENERAL_INQUIRY', label: 'استفسار عام / معلومات عن المنيو والفرع' },
            { value: 'LATE_DELIVERY', label: 'تأخر وقت التوصيل (Delivery Delay)' },
            { value: 'FOOD_QUALITY', label: 'جودة الطعام والتحضير (Food Quality)' },
            { value: 'WRONG_ITEM', label: 'طلب غير مكتمل / صنف ناقص أو خاطئ' },
            { value: 'PAYMENT_ISSUE', label: 'مشكلة في الحساب والدفع' },
            { value: 'OTHER', label: 'سبب آخر' },
          ]}
          value={form.resolutionCategory}
          onChange={(e) =>
            setForm({ ...form, resolutionCategory: e.target.value })
          }
        />

        <div>
          <label className="block text-xs font-bold text-txt-primary mb-1">
            ملاحظات وتفاصيل الإغلاق والحل:
          </label>
          <textarea
            rows={3}
            placeholder="اكتب الإجراء الذي تم اتخاذه (مثال: تم التواصل مع العميل والاعتذار وإرسال طبق تعويضي مع الأوردر القادم)..."
            value={form.resolutionNotes}
            onChange={(e) =>
              setForm({ ...form, resolutionNotes: e.target.value })
            }
            className="w-full p-3 rounded-md bg-bg-base border border-border-default text-txt-primary text-xs focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-default">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="danger"
            size="sm"
            isLoading={isPending}
            icon={XCircle}
          >
            تأكيد الإغلاق وإرسال التقييم
          </Button>
        </div>
      </form>
    </Modal>
  );
};
