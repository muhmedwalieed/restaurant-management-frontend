/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Select } from '../../../shared/components/Select.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import { DollarSign, Globe, CheckCircle2, Sliders, AlertCircle } from 'lucide-react';

export const branchSettingsSchema = z.object({
  currency: z.string().min(2, 'رمز العملة مطلوب'),
  timezone: z.string().min(2, 'التوقيت المحلي مطلوب'),
});

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

export const BranchSettingsForm = ({ initialData, onSave, isLoading = false }) => {
  const [successMessage, setSuccessMessage] = useAutoDismiss();
  const [errorMessage, setErrorMessage] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(branchSettingsSchema),
    defaultValues: {
      currency: 'EGP',
      timezone: 'Africa/Cairo',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        currency: initialData.currency || 'EGP',
        timezone: initialData.timezone || 'Africa/Cairo',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (formData) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await onSave(formData);
      setSuccessMessage('تم حفظ إعدادات الفرع بنجاح.');
    } catch (err) {
      setErrorMessage(err?.message || 'حدث خطأ أثناء حفظ إعدادات الفرع.');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 text-right" noValidate>
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <div>
          <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-primary" />
            <span>إعدادات تشغيل الفرع الحسابية</span>
          </h3>
          <p className="text-xs text-txt-muted mt-0.5">
            ضبط العملة والتوقيت المحلي الخاص بالفرع
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="العملة الرسمية للفرع"
          options={CURRENCY_OPTIONS}
          icon={DollarSign}
          required
          error={errors.currency?.message}
          {...register('currency')}
        />

        <Select
          label="التوقيت المحلي للفرع"
          options={TIMEZONE_OPTIONS}
          icon={Globe}
          required
          error={errors.timezone?.message}
          {...register('timezone')}
        />
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-border-subtle">
        <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
          حفظ إعدادات الفرع
        </Button>
      </div>
    </form>
  );
};
