import React, { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { Button } from '../../../../shared/components/Button.jsx';
import { Input } from '../../../../shared/components/Input.jsx';
import { Select } from '../../../../shared/components/Select.jsx';
import { Phone, Plus } from 'lucide-react';

export const NewTicketModal = ({
  isOpen,
  onClose,
  onSubmit,
  isPending,
}) => {
  const [form, setForm] = useState({
    customerPhone: '',
    ticketType: 'SUPPORT',
    subject: '',
    initialMessage: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.customerPhone.trim()) return;

    let cleanPhone = form.customerPhone.trim();
    if (!cleanPhone.startsWith('+') && cleanPhone.startsWith('01')) {
      cleanPhone = '+2' + cleanPhone;
    }

    onSubmit({
      ...form,
      customerPhone: cleanPhone,
    });
    setForm({ customerPhone: '', ticketType: 'SUPPORT', subject: '', initialMessage: '' });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="فتح تذكرة دعم أو شكوى جديدة"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="رقم هاتف العميل"
          placeholder="مثال: +201012345678"
          dir="ltr"
          icon={Phone}
          value={form.customerPhone}
          onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="نوع التذكرة"
            options={[
              { value: 'SUPPORT', label: 'دعم فني عام' },
              { value: 'COMPLAINT', label: 'شكوى بخصوص طلب' },
              { value: 'ORDER', label: 'طلب طعام' },
              { value: 'INQUIRY', label: 'استفسار' },
            ]}
            value={form.ticketType}
            onChange={(e) => setForm({ ...form, ticketType: e.target.value })}
          />

          <Input
            label="موضوع أو عنوان التذكرة"
            placeholder="مثال: شكوى تأخر أوردر #104"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
        </div>

        <Input
          label="رسالة البداية (اختياري)"
          placeholder="اكتب استفسار أو مشكلة العميل..."
          value={form.initialMessage}
          onChange={(e) => setForm({ ...form, initialMessage: e.target.value })}
        />

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
            variant="primary"
            size="sm"
            isLoading={isPending}
            icon={Plus}
          >
            فتح التذكرة الآن
          </Button>
        </div>
      </form>
    </Modal>
  );
};
