import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { Toggle } from '../../../shared/components/Toggle.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { addressFormSchema, ADDRESS_LABEL_OPTIONS } from '../schemas/customer.schema.js';
import { useCreateAddressMutation, useUpdateAddressMutation } from '../hooks/useCustomers.js';
import { MapPin, Home } from 'lucide-react';

export const AddressFormModal = ({ isOpen, onClose, customerId, addressToEdit = null }) => {
  const isEditing = Boolean(addressToEdit);
  const createMutation = useCreateAddressMutation();
  const updateMutation = useUpdateAddressMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressFormSchema),
    defaultValues: { label: 'HOME', street: '', city: '', state: '', postalCode: '', isDefault: false },
  });
  const isDefaultValue = watch('isDefault');

  useEffect(() => {
    if (isOpen) {
      if (addressToEdit) {
        reset({
          label: addressToEdit.label || 'HOME',
          street: addressToEdit.street || '',
          city: addressToEdit.city || '',
          state: addressToEdit.state || '',
          postalCode: addressToEdit.postalCode || '',
          isDefault: addressToEdit.isDefault ?? false,
        });
      } else {
        reset({ label: 'HOME', street: '', city: '', state: '', postalCode: '', isDefault: false });
      }
    }
  }, [isOpen, addressToEdit, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ customerId, addressId: addressToEdit.id, payload: data });
      } else {
        await createMutation.mutateAsync({ customerId, payload: data });
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
      title={isEditing ? 'تعديل العنوان' : 'إضافة عنوان'}
      subtitle={isEditing ? 'تعديل تفاصيل العنوان' : 'أضف عنوان توصيل للعميل'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="نوع العنوان" options={ADDRESS_LABEL_OPTIONS} error={errors.label?.message} {...register('label')} />
          <Input label="الشارع" icon={Home} error={errors.street?.message} {...register('street')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="المدينة" error={errors.city?.message} {...register('city')} />
          <Input label="المحافظة" error={errors.state?.message} {...register('state')} />
          <Input label="الرمز البريدي" error={errors.postalCode?.message} {...register('postalCode')} />
        </div>

        <div className="flex items-center justify-between p-3 bg-bg-surface-elevated/50 border border-border-default rounded-md">
          <div>
            <span className="text-xs font-medium text-txt-primary block">العنوان الافتراضي</span>
            <span className="text-xs text-txt-muted">يستخدم كعنوان أساسي للتوصيل</span>
          </div>
          <Toggle checked={isDefaultValue} onChange={(val) => setValue('isDefault', val)} label="تحديد كافتراضي" />
        </div>

        {(createMutation.isError || updateMutation.isError) && (
          <div className="p-3 bg-status-danger/10 border border-status-danger/30 rounded-md text-xs text-status-danger">
            {createMutation.error?.message || updateMutation.error?.message || 'حدث خطأ أثناء حفظ العنوان.'}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" isLoading={isPending} icon={MapPin}>
            {isEditing ? 'حفظ العنوان' : 'إضافة العنوان'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};