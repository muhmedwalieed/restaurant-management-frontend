import React from 'react';
import { Input } from '../../../../shared/components/Input.jsx';
import { Select } from '../../../../shared/components/Select.jsx';
import { Toggle } from '../../../../shared/components/Toggle.jsx';
import { ImageUploadInput } from '../../../../shared/components/ImageUploadInput.jsx';
import { Utensils } from 'lucide-react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';

export const ProductBasicInfoForm = ({
  id,
  register,
  handleSubmit,
  setValue,
  watch,
  errors,
  categoryOptions,
  onSubmit,
}) => {
  const { currency } = useCurrency();
  const isAvailableValue = watch('isAvailable');
  const statusValue = watch('status');
  const isMenuVisible = statusValue === 'ACTIVE';

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-brand-primary" />
          <h3 className="text-xs font-bold text-txt-primary">البيانات العامة للصنف</h3>
        </div>
        <span className="text-[11px] text-txt-muted">
          معرف الصنف: <span className="font-mono">{id?.slice(0, 8)}...</span>
        </span>
      </div>

      <form
        id="product-edit-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 text-right"
        noValidate
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="اسم المنتج"
            required
            error={errors.name?.message}
            {...register('name')}
          />

          <Select
            label="التصنيف"
            options={categoryOptions}
            placeholder="اختر التصنيف..."
            required
            error={errors.categoryId?.message}
            {...register('categoryId')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="سعر الصنف"
            type="number"
            step="0.01"
            min="0"
            suffix={currency}
            required
            error={errors.price?.message}
            {...register('price')}
          />

          <ImageUploadInput
            label="صورة الصنف"
            value={watch('imageUrl')}
            onChange={(url) => setValue('imageUrl', url, { shouldValidate: true })}
            hint="ارفع صورة من جهازك (JPG/PNG/WEBP/GIF حتى 2MB)"
          />
        </div>

        <div className="flex flex-col gap-1.5 w-full text-right">
          <label className="text-xs font-medium text-txt-primary">وصف ومكونات الصنف</label>
          <textarea
            rows={3}
            dir="auto"
            placeholder="أدخل مكونات أو تفاصيل الصنف..."
            className="w-full bg-bg-surface text-txt-primary placeholder:text-txt-muted border border-border-default rounded-lg text-sm px-3 py-2 transition-colors focus-visible:outline-none focus-visible:border-brand-primary"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-status-danger font-medium mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="flex items-center justify-between p-3.5 bg-bg-base/60 border border-border-subtle rounded-xl">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-txt-primary block">التوافر الفوري</span>
              <span className="text-[11px] text-txt-muted block">متاح للطلب الآن بالمطبخ</span>
            </div>
            <Toggle
              checked={isAvailableValue}
              onChange={(val) => setValue('isAvailable', val)}
              label="التوافر الفوري"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-bg-base/60 border border-border-subtle rounded-xl">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-txt-primary block">القائمة الرقمية</span>
              <span className="text-[11px] text-txt-muted block">إظهار في منيو الـ QR</span>
            </div>
            <Toggle
              checked={isMenuVisible}
              onChange={(val) => setValue('status', val ? 'ACTIVE' : 'INACTIVE')}
              label="إظهار في القائمة"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
