import React from 'react';
import {
  Store,
  Mail,
  Phone,
  Globe,
  DollarSign,
} from 'lucide-react';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { ImageUploadInput } from '../../../shared/components/ImageUploadInput.jsx';

const CURRENCY_OPTIONS = [
  { value: 'EGP', label: 'جنيه مصري (EGP)' },
  { value: 'SAR', label: 'ريال سعودي (SAR)' },
  { value: 'AED', label: 'درهم إماراتي (AED)' },
  { value: 'USD', label: 'دولار أمريكي (USD)' },
];

const TIMEZONE_OPTIONS = [
  { value: 'Africa/Cairo', label: 'القاهرة (Africa/Cairo - UTC+2/3)' },
  { value: 'Asia/Riyadh', label: 'الرياض (Asia/Riyadh - UTC+3)' },
  { value: 'Asia/Dubai', label: 'دبي (Asia/Dubai - UTC+4)' },
  { value: 'UTC', label: 'التوقيت العالمي (UTC)' },
];

export const RestaurantProfileForm = ({
  restaurant,
  register,
  handleSubmit,
  errors = {},
  onSubmit,
  watch,
  setValue,
  isLoading = false,
}) => {
  return (
    <div className="bg-bg-surface border border-border-default rounded-lg p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-right" noValidate>
        <ImageUploadInput
          label="شعار المطعم"
          value={watch('logoUrl')}
          onChange={(url) => setValue('logoUrl', url, { shouldValidate: true })}
          hint="ارفع لوجو من جهازك (JPG/PNG/WEBP/GIF حتى 2MB)"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="اسم المطعم"
            icon={Store}
            required
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="معرّف الرابط"
            value={restaurant?.slug || ''}
            disabled
            readOnly
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="البريد الإلكتروني المؤسسي"
            type="email"
            icon={Mail}
            required
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="رقم الهاتف الرئيسي"
            type="tel"
            icon={Phone}
            required
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="العملة الأساسية"
            options={CURRENCY_OPTIONS}
            icon={DollarSign}
            required
            error={errors.currency?.message}
            {...register('currency')}
          />

          <Select
            label="التوقيت المحلي"
            options={TIMEZONE_OPTIONS}
            icon={Globe}
            required
            error={errors.timezone?.message}
            {...register('timezone')}
          />
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-border-subtle">
          <PermissionGate permission="restaurants.manage">
            <Button type="submit" variant="primary" isLoading={isLoading}>
              حفظ التغييرات
            </Button>
          </PermissionGate>
        </div>
      </form>
    </div>
  );
};
