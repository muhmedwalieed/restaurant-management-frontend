import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { Toggle } from '../../../shared/components/Toggle.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { couponFormSchema } from '../schemas/coupon.schema.js';
import { useCreateCouponMutation, useUpdateCouponMutation } from '../hooks/useCoupons.js';
import { TicketPercent } from 'lucide-react';

export const CouponFormModal = ({ isOpen, onClose, couponToEdit = null }) => {
  const isEditing = Boolean(couponToEdit);
  const createMutation = useCreateCouponMutation();
  const updateMutation = useUpdateCouponMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: '',
      type: 'PERCENTAGE',
      value: 10,
      minSubtotal: 0,
      maxDiscount: null,
      usageLimit: null,
      startsAt: '',
      expiresAt: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (couponToEdit) {
        reset({
          code: couponToEdit.code || '',
          type: couponToEdit.type || 'PERCENTAGE',
          value: Number(couponToEdit.value) || 0,
          minSubtotal: Number(couponToEdit.minSubtotal) || 0,
          maxDiscount: couponToEdit.maxDiscount != null ? Number(couponToEdit.maxDiscount) : null,
          usageLimit: couponToEdit.usageLimit ?? null,
          startsAt: couponToEdit.startsAt ? couponToEdit.startsAt.slice(0, 16) : '',
          expiresAt: couponToEdit.expiresAt ? couponToEdit.expiresAt.slice(0, 16) : '',
          isActive: couponToEdit.isActive ?? true,
        });
      } else {
        reset({
          code: '',
          type: 'PERCENTAGE',
          value: 10,
          minSubtotal: 0,
          maxDiscount: null,
          usageLimit: null,
          startsAt: '',
          expiresAt: '',
          isActive: true,
        });
      }
    }
  }, [isOpen, couponToEdit, reset]);

  const onSubmit = async (data) => {
    const payload = {
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      minSubtotal: data.minSubtotal,
      isActive: data.isActive,
      ...(data.maxDiscount != null && data.maxDiscount !== '' ? { maxDiscount: data.maxDiscount } : {}),
      ...(data.usageLimit != null && data.usageLimit !== '' ? { usageLimit: data.usageLimit } : {}),
      ...(data.startsAt ? { startsAt: new Date(data.startsAt).toISOString() } : {}),
      ...(data.expiresAt ? { expiresAt: new Date(data.expiresAt).toISOString() } : {}),
    };
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: couponToEdit.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      setError('root', { message: err?.message || 'حدث خطأ أثناء حفظ الكوبون.' });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const couponType = watch('type');
  const isActive = watch('isActive');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}
      subtitle={isEditing ? 'تعديل خصومات وشروط الكوبون' : 'أنشئ كود خصم يطبّق تلقائيًا على الطلبات'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="كود الخصم"
          placeholder="مثال: SAVE10"
          required
          icon={TicketPercent}
          error={errors.code?.message}
          {...register('code')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="نوع الخصم"
            required
            options={[
              { value: 'PERCENTAGE', label: 'نسبة مئوية (%)' },
              { value: 'FIXED', label: 'مبلغ ثابت' },
            ]}
            error={errors.type?.message}
            {...register('type')}
          />
          <Input
            label={couponType === 'PERCENTAGE' ? 'نسبة الخصم (%)' : 'قيمة الخصم (ج.م)'}
            required
            type="number"
            min="0"
            step="0.01"
            error={errors.value?.message}
            {...register('value')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="الحد الأدنى للطلب (ج.م)"
            type="number"
            min="0"
            helperText="الخصم يشتغل لو الطلب أكبر من أو يساوي الرقم ده"
            error={errors.minSubtotal?.message}
            {...register('minSubtotal')}
          />
          {couponType === 'PERCENTAGE' && (
            <Input
              label="أقصى خصم (ج.م)، اختياري"
              type="number"
              min="0"
              step="0.01"
              placeholder="بدون حد أقصى"
              error={errors.maxDiscount?.message}
              {...register('maxDiscount')}
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="حد الاستخدام الكلي، اختياري"
            type="number"
            min="1"
            placeholder="بدون حد"
            error={errors.usageLimit?.message}
            {...register('usageLimit')}
          />
          <Input label="ينتهي في، اختياري" type="datetime-local" error={errors.expiresAt?.message} {...register('expiresAt')} />
        </div>

        <div className="flex items-center justify-between px-3 py-2 rounded-md border border-border-default">
          <span className="text-xs text-txt-primary">الكوبون مفعّل</span>
          <Toggle checked={isActive} onChange={(v) => setValue('isActive', v)} label="تفعيل الكوبون" />
        </div>

        {errors.root?.message && (
          <div className="p-3 bg-status-danger/10 border border-status-danger/30 rounded-md text-xs text-status-danger">
            {errors.root.message}
          </div>
        )}

        {(createMutation.isError || updateMutation.isError) && (
          <div className="p-3 bg-status-danger/10 border border-status-danger/30 rounded-md text-xs text-status-danger">
            {createMutation.error?.message || updateMutation.error?.message || 'حدث خطأ أثناء حفظ الكوبون'}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" isLoading={isPending}>
            {isEditing ? 'حفظ التعديلات' : 'إضافة الكوبون'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CouponFormModal;
