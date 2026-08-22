import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Toggle } from '../../../shared/components/Toggle.jsx';
import { productFormSchema } from '../schemas/menu.schema.js';
import { useCreateProductMutation, useUpdateProductMutation } from '../hooks/useMenu.js';
import { Utensils, DollarSign, Image } from 'lucide-react';

export const ProductFormModal = ({ isOpen, onClose, productToEdit = null, categories = [] }) => {
  const isEditing = Boolean(productToEdit);
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      categoryId: '',
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      isAvailable: true,
      status: 'ACTIVE',
    },
  });

  const isAvailableValue = watch('isAvailable');

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        reset({
          categoryId: productToEdit.categoryId || productToEdit.category?.id || '',
          name: productToEdit.name || '',
          description: productToEdit.description || '',
          price: productToEdit.price !== undefined ? String(productToEdit.price) : '',
          imageUrl: productToEdit.imageUrl || '',
          isAvailable: productToEdit.isAvailable ?? true,
          status: productToEdit.status || 'ACTIVE',
        });
      } else {
        reset({
          categoryId: categories.length > 0 ? categories[0].id : '',
          name: '',
          description: '',
          price: '',
          imageUrl: '',
          isAvailable: true,
          status: 'ACTIVE',
        });
      }
    }
  }, [isOpen, productToEdit, categories, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: productToEdit.id,
          payload: data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (err) {
      // Handled by query/toast/interceptor or error block
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
      subtitle={isEditing ? 'تعديل بيانات وسعر وحالة التوافر للمنتج' : 'أدخل بيانات المنتج الجديد لإضافته للمنيو'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="التصنيف"
            options={categoryOptions}
            placeholder="اختر التصنيف..."
            required
            error={errors.categoryId?.message}
            {...register('categoryId')}
          />

          <Input
            label="اسم المنتج"
            placeholder="مثال: تشيز برجر سينجل، كوكاكولا..."
            required
            icon={Utensils}
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="السعر (EGP)"
            type="number"
            step="0.01"
            placeholder="0.00"
            required
            icon={DollarSign}
            error={errors.price?.message}
            {...register('price')}
          />

          <Input
            label="رابط الصورة (Image URL)"
            type="url"
            placeholder="https://example.com/item.jpg"
            helperText="رابط صورة مباشر للمنتج (اختياري)"
            icon={Image}
            error={errors.imageUrl?.message}
            {...register('imageUrl')}
          />
        </div>

        <div className="flex flex-col gap-1.5 w-full text-right">
          <label className="text-xs font-medium text-txt-primary">وصف المنتج (اختياري)</label>
          <textarea
            rows={3}
            placeholder="أدخل مكونات أو تفاصيل المنتج..."
            className="w-full bg-bg-surface text-txt-primary placeholder:text-txt-muted border border-border-default rounded-md text-sm px-3 py-2 transition-colors focus-visible:outline-none focus-visible:border-brand-primary"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-status-danger font-medium mt-0.5">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
          <div className="flex items-center justify-between p-3 bg-bg-surface-elevated/50 border border-border-default rounded-md">
            <div>
              <span className="text-xs font-medium text-txt-primary block">التوافر الفوري للمطبخ</span>
              <span className="text-[11px] text-txt-muted">متاح للطلب الآن على الكاشير/الواتساب</span>
            </div>
            <Toggle
              checked={isAvailableValue}
              onChange={(val) => setValue('isAvailable', val)}
              label="تغيير التوافر"
            />
          </div>

          <Select
            label="حالة المنتج الإدارية"
            options={[
              { value: 'ACTIVE', label: 'نشط (ظاهر في المنيو)' },
              { value: 'INACTIVE', label: 'غير نشط (مخفي من المنيو)' },
            ]}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        {(createMutation.isError || updateMutation.isError) && (
          <div className="p-3 bg-status-danger/10 border border-status-danger/30 rounded-md text-xs text-status-danger">
            {createMutation.error?.message ||
              updateMutation.error?.message ||
              'حدث خطأ أثناء حفظ بيانات المنتج، يرجى المحاولة مرة أخرى'}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" isLoading={isPending}>
            {isEditing ? 'حفظ التعديلات' : 'إضافة المنتج'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
