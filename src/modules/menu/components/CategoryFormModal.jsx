import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { categoryFormSchema } from '../schemas/menu.schema.js';
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '../hooks/useMenu.js';
import { FolderPlus, Edit3 } from 'lucide-react';

export const CategoryFormModal = ({ isOpen, onClose, categoryToEdit = null }) => {
  const isEditing = Boolean(categoryToEdit);
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      sortOrder: 0,
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        reset({
          name: categoryToEdit.name || '',
          description: categoryToEdit.description || '',
          sortOrder: categoryToEdit.sortOrder ?? 0,
          status: categoryToEdit.status || 'ACTIVE',
        });
      } else {
        reset({
          name: '',
          description: '',
          sortOrder: 0,
          status: 'ACTIVE',
        });
      }
    }
  }, [isOpen, categoryToEdit, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: categoryToEdit.id,
          payload: data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (err) {
      setError('root', { message: err?.message || 'حدث خطأ أثناء حفظ التصنيف.' });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
      subtitle={isEditing ? 'تعديل اسم وبيانات التصنيف في قائمة الطعام' : 'أدخل بيانات التصنيف الجديد لإضافته للمنيو'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="اسم التصنيف"
          placeholder="مثال: الوجبات الرئيسية، المشروبات..."
          required
          icon={isEditing ? Edit3 : FolderPlus}
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="flex flex-col gap-2 w-full text-right">
          <label className="text-xs font-medium text-txt-primary">وصف التصنيف </label>
          <textarea
            rows={3}
            placeholder="وصف مختصر لمحتويات هذا التصنيف..."
            className="w-full bg-bg-surface text-txt-primary placeholder:text-txt-muted border border-border-default rounded-md text-sm px-3 py-2 transition-colors focus-visible:outline-none focus-visible:border-brand-primary"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-status-danger font-medium mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="ترتيب العرض (Sort Order)"
            type="number"
            min="0"
            helperText="الرقم الأصغر يظهر في البداية"
            error={errors.sortOrder?.message}
            {...register('sortOrder')}
          />

          <Select
            label="حالة التصنيف"
            options={[
              { value: 'ACTIVE', label: 'نشط (مفعل)' },
              { value: 'INACTIVE', label: 'غير نشط (معطل)' },
            ]}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        {errors.root?.message && (
          <div className="p-3 bg-status-danger/10 border border-status-danger/30 rounded-md text-xs text-status-danger">
            {errors.root.message}
          </div>
        )}

        {(createMutation.isError || updateMutation.isError) && (
          <div className="p-3 bg-status-danger/10 border border-status-danger/30 rounded-md text-xs text-status-danger">
            {createMutation.error?.message ||
              updateMutation.error?.message ||
              'حدث خطأ أثناء حفظ التصنيف، يرجى المحاولة مرة أخرى'}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" isLoading={isPending}>
            {isEditing ? 'حفظ التعديلات' : 'إضافة التصنيف'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
