import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Toggle } from '../../../shared/components/Toggle.jsx';
import { modifierFormSchema } from '../schemas/menu.schema.js';
import { useCreateModifierMutation, useUpdateModifierMutation } from '../hooks/useMenu.js';
import { PlusCircle } from 'lucide-react';

export const ModifierFormModal = ({
  isOpen,
  onClose,
  productId,
  modifierToEdit = null,
}) => {
  const isEditing = Boolean(modifierToEdit);
  const createMutation = useCreateModifierMutation();
  const updateMutation = useUpdateModifierMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(modifierFormSchema),
    defaultValues: {
      name: '',
      priceDelta: 0,
      isRequired: false,
    },
  });

  const isRequiredValue = watch('isRequired');

  useEffect(() => {
    if (isOpen) {
      if (modifierToEdit) {
        reset({
          name: modifierToEdit.name || '',
          priceDelta: modifierToEdit.priceDelta !== undefined ? String(modifierToEdit.priceDelta) : '0',
          isRequired: modifierToEdit.isRequired ?? false,
        });
      } else {
        reset({
          name: '',
          priceDelta: 0,
          isRequired: false,
        });
      }
    }
  }, [isOpen, modifierToEdit, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          productId,
          modifierId: modifierToEdit.id,
          payload: data,
        });
      } else {
        await createMutation.mutateAsync({
          productId,
          payload: data,
        });
      }
      onClose();
    } catch (err) {
      // Error handled by mutation state
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'تعديل الخيار الإضافي' : 'إضافة خيار إضافي للمنتج'}
      subtitle={isEditing ? 'تعديل الاسم أو الفرق في السعر لهذا الخيار' : 'أدخل اسم وسعر الخيار الإضافي (Add-on)'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="اسم الخيار / الإضافة"
          placeholder="مثال: جبنة شيدر إضافية، صوص هالبينو، حجم كبير..."
          required
          icon={PlusCircle}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="الفرق في السعر الإضافي"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          helperText="0 يعني خيار مجاني بدون تكلفة إضافية"
          prefix="+"
          suffix="ج.م"
          error={errors.priceDelta?.message}
          {...register('priceDelta')}
        />

        <div className="flex items-center justify-between p-3 bg-bg-base/60 border border-border-default rounded-lg">
          <div>
            <span className="text-xs font-medium text-txt-primary block">خيار إجباري عند الطلب</span>
            <span className="text-[11px] text-txt-muted">يلزم العميل باختيار هذا الخيار قبل الإضافة للسلة</span>
          </div>
          <Toggle
            checked={isRequiredValue}
            onChange={(val) => setValue('isRequired', val)}
            label="تحديد كإجباري"
          />
        </div>

        {(createMutation.isError || updateMutation.isError) && (
          <div className="p-3 bg-status-danger/10 border border-status-danger/30 rounded-md text-xs text-status-danger">
            {createMutation.error?.message ||
              updateMutation.error?.message ||
              'حدث خطأ أثناء حفظ الخيار الإضافي'}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/[0.06]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="border-white/10 text-xs"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isPending}
            className="bg-white text-slate-950 font-medium hover:bg-slate-200 border-none shadow-sm text-xs"
          >
            {isEditing ? 'حفظ التعديل' : 'إضافة الخيار'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
