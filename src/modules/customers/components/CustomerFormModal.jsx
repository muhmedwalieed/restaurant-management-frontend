import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { customerFormSchema } from '../schemas/customer.schema.js';
import { useCreateCustomerMutation, useUpdateCustomerMutation } from '../hooks/useCustomers.js';
import { User, Phone, Mail, Edit3 } from 'lucide-react';

export const CustomerFormModal = ({ isOpen, onClose, customerToEdit = null }) => {
  const isEditing = Boolean(customerToEdit);
  const createMutation = useCreateCustomerMutation();
  const updateMutation = useUpdateCustomerMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerFormSchema),
    defaultValues: { name: '', phone: '', email: '', notes: '' },
  });

  useEffect(() => {
    if (isOpen) {
      if (customerToEdit) {
        reset({
          name: customerToEdit.name || '',
          phone: customerToEdit.phone || '',
          email: customerToEdit.email || '',
          notes: customerToEdit.notes || '',
        });
      } else {
        reset({ name: '', phone: '', email: '', notes: '' });
      }
    }
  }, [isOpen, customerToEdit, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: customerToEdit.id, payload: data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (err) {
      // Handled by interceptor / error state
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
      subtitle={isEditing ? 'تعديل بيانات العميل وحسابه' : 'أدخل بيانات العميل الجديد لإضافته لقاعدة العملاء'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="اسم العميل" required icon={isEditing ? Edit3 : User} error={errors.name?.message} {...register('name')} />
        <Input
          label="رقم الهاتف"
          required
          dir="ltr"
          icon={Phone}
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input label="البريد الإلكتروني (اختياري)" dir="ltr" icon={Mail} error={errors.email?.message} {...register('email')} />

        <div className="flex flex-col gap-1.5 w-full text-right">
          <label className="text-xs font-medium text-txt-primary">ملاحظات (اختياري)</label>
          <textarea
            rows={2}
            placeholder="مثال: عميل VIP، يفضل الاتصال مساءً..."
            className="w-full bg-bg-surface text-txt-primary placeholder:text-txt-muted border border-border-default rounded-md text-sm px-3 py-2 transition-colors focus-visible:outline-none focus-visible:border-brand-primary"
            {...register('notes')}
          />
          {errors.notes && <p className="text-xs text-status-danger font-medium">{errors.notes.message}</p>}
        </div>

        {(createMutation.isError || updateMutation.isError) && (
          <div className="p-3 bg-status-danger/10 border border-status-danger/30 rounded-md text-xs text-status-danger">
            {createMutation.error?.message || updateMutation.error?.message || 'حدث خطأ أثناء حفظ بيانات العميل.'}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" isLoading={isPending}>
            {isEditing ? 'حفظ التعديلات' : 'إضافة العميل'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};