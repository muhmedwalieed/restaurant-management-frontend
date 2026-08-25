import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { customerFormSchema } from '../schemas/customer.schema.js';
import { useCreateCustomerMutation, useUpdateCustomerMutation } from '../hooks/useCustomers.js';
import { User, Phone, Edit3, Plus, Trash2 } from 'lucide-react';

export const CustomerFormModal = ({ isOpen, onClose, customerToEdit = null }) => {
  const isEditing = Boolean(customerToEdit);
  const createMutation = useCreateCustomerMutation();
  const updateMutation = useUpdateCustomerMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerFormSchema),
    defaultValues: { firstName: '', lastName: '', phone: '', phones: [], notes: '' },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'phones' });

  useEffect(() => {
    if (isOpen) {
      if (customerToEdit) {
        const extraPhones = (customerToEdit.phones || [])
          .filter((p) => p.phone !== customerToEdit.phone)
          .map((p) => ({ value: p.phone }));
        reset({
          firstName: customerToEdit.firstName || customerToEdit.name || '',
          lastName: customerToEdit.lastName || '',
          phone: customerToEdit.phone || '',
          phones: extraPhones,
          notes: customerToEdit.notes || '',
        });
      } else {
        reset({ firstName: '', lastName: '', phone: '', phones: [], notes: '' });
      }
    }
  }, [isOpen, customerToEdit, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName || undefined,
        phone: data.phone,
        phones: [data.phone, ...(data.phones || []).map((p) => p.value || p).filter(Boolean)],
        notes: data.notes || undefined,
      };
      if (isEditing) {
        await updateMutation.mutateAsync({ id: customerToEdit.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      setError('root', { message: err?.message || 'حدث خطأ أثناء حفظ بيانات العميل.' });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
      subtitle={isEditing ? 'تعديل بيانات العميل وأرقامه' : 'أدخل بيانات العميل الجديد لإضافته لقاعدة العملاء'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="الاسم الأول"
            required
            icon={isEditing ? Edit3 : User}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input label="اسم العائلة (اختياري)" error={errors.lastName?.message} {...register('lastName')} />
        </div>

        <Input
          label="رقم الهاتف الأساسي"
          required
          dir="ltr"
          icon={Phone}
          error={errors.phone?.message}
          {...register('phone')}
        />

        {}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-txt-primary">أرقام هاتف إضافية</label>
            <Button type="button" size="sm" variant="outline" icon={Plus} onClick={() => append({ value: '' })}>
              إضافة رقم
            </Button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input
                dir="ltr"
                placeholder="01xxxxxxxxx"
                {...register(`phones.${index}.value`)}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                variant="danger"
                icon={Trash2}
                onClick={() => remove(index)}
                aria-label="حذف الرقم"
              />
            </div>
          ))}
          {errors.phones?.message && (
            <p className="text-xs text-status-danger font-medium">{errors.phones.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full text-right">
          <label className="text-xs font-medium text-txt-primary">ملاحظات</label>
          <textarea
            rows={2}
            placeholder="مثال: عميل VIP، يفضل الاتصال مساءً..."
            className="w-full bg-bg-surface text-txt-primary placeholder:text-txt-muted border border-border-default rounded-md text-sm px-3 py-2 transition-colors focus-visible:outline-none focus-visible:border-brand-primary"
            {...register('notes')}
          />
          {errors.notes && <p className="text-xs text-status-danger font-medium">{errors.notes.message}</p>}
        </div>

        {errors.root?.message && (
          <div className="p-3 bg-status-danger/10 border border-status-danger/30 rounded-md text-xs text-status-danger">
            {errors.root.message}
          </div>
        )}

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
