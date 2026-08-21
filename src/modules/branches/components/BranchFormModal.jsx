/* eslint-disable react-refresh/only-export-components */
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Building2, Hash, MapPin, Phone, ShieldCheck } from 'lucide-react';

export const branchFormSchema = z.object({
  name: z.string().min(2, 'اسم الفرع يجب أن لا يقل عن حرفين'),
  code: z.string().min(2, 'كود الفرع يجب أن لا يقل عن حرفين'),
  address: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
  isMain: z.boolean().default(false),
});

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'نشط' },
  { value: 'INACTIVE', label: 'معطل' },
  { value: 'SUSPENDED', label: 'موقوف مؤقتاً' },
];

export const BranchFormModal = ({
  isOpen,
  onClose,
  initialValues = null,
  onSubmit,
  isLoading = false,
}) => {
  const isEdit = Boolean(initialValues?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: '',
      code: '',
      address: '',
      phone: '',
      status: 'ACTIVE',
      isMain: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        reset({
          name: initialValues.name || '',
          code: initialValues.code || '',
          address: initialValues.address || '',
          phone: initialValues.phone || '',
          status: initialValues.status || 'ACTIVE',
          isMain: Boolean(initialValues.isMain),
        });
      } else {
        reset({
          name: '',
          code: '',
          address: '',
          phone: '',
          status: 'ACTIVE',
          isMain: false,
        });
      }
    }
  }, [isOpen, initialValues, reset]);

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-right" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="اسم الفرع"
            icon={Building2}
            placeholder="مثال: فرع مدينة نصر"
            required
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="كود الفرع (Code)"
            icon={Hash}
            placeholder="مثال: MN-01"
            required
            error={errors.code?.message}
            {...register('code')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="رقم هاتف الفرع"
            icon={Phone}
            placeholder="مثال: 01012345678"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Select
            label="حالة التشغيل"
            options={STATUS_OPTIONS}
            required
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        <Input
          label="عنوان الفرع بالتفصيل"
          icon={MapPin}
          placeholder="مثال: 15 شارع النصر، مدينة نصر، القاهرة"
          error={errors.address?.message}
          {...register('address')}
        />

        <div className="flex items-center gap-2 p-3 bg-bg-surface-elevated rounded-md border border-border-subtle">
          <input
            type="checkbox"
            id="isMain"
            className="w-4 h-4 rounded border-border-default text-brand-primary focus:ring-brand-primary cursor-pointer"
            {...register('isMain')}
          />
          <label htmlFor="isMain" className="text-xs font-semibold text-txt-primary cursor-pointer flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-primary" />
            <span>تعيين كـ &quot;الفرع الرئيسي للمطعم&quot; (isMain)</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-subtle">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            إلغاء
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            {isEdit ? 'حفظ التعديلات' : 'إضافة الفرع'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
