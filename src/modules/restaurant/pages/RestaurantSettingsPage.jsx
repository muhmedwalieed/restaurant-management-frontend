/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useRestaurantQuery,
  useUpdateRestaurantMutation,
  useUpdateRestaurantStatusMutation,
} from '../hooks/useRestaurant.js';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import { Store, Mail, Phone, Globe, DollarSign, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

export const restaurantProfileSchema = z.object({
  name: z.string().min(2, 'اسم المطعم يجب أن لا يقل عن حرفين'),
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('صيغة البريد غير صحيحة'),
  phone: z.string().min(6, 'رقم الهاتف غير صحيح'),
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

export const RestaurantSettingsPage = () => {
  const { data: restaurant, isLoading, isError, error, refetch } = useRestaurantQuery();
  const updateMutation = useUpdateRestaurantMutation();
  const updateStatusMutation = useUpdateRestaurantStatusMutation();
  const [successMessage, setSuccessMessage] = useAutoDismiss();
  const [errorMessage, setErrorMessage] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(restaurantProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      currency: 'EGP',
      timezone: 'Africa/Cairo',
    },
  });

  useEffect(() => {
    if (restaurant) {
      reset({
        name: restaurant.name || '',
        email: restaurant.email || '',
        phone: restaurant.phone || '',
        currency: restaurant.currency || 'EGP',
        timezone: restaurant.timezone || 'Africa/Cairo',
      });
    }
  }, [restaurant, reset]);

  const onSubmit = async (formData) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await updateMutation.mutateAsync(formData);
      setSuccessMessage('تم حفظ بيانات المطعم بنجاح.');
    } catch (err) {
      setErrorMessage(err?.message || 'حدث خطأ أثناء حفظ بيانات المطعم.');
    }
  };

  const handleStatusToggle = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);
    const newStatus = restaurant?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateStatusMutation.mutateAsync(newStatus);
      setSuccessMessage(`تم تغيير حالة المطعم إلى ${newStatus === 'ACTIVE' ? 'نشط' : 'معطل'}.`);
    } catch (err) {
      setErrorMessage(err?.message || 'حدث خطأ أثناء تغيير حالة المطعم.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton height={60} className="w-full" />
        <div className="bg-bg-surface p-6 rounded-lg space-y-4">
          <LoadingSkeleton height={40} className="w-full" />
          <LoadingSkeleton height={40} className="w-full" />
          <LoadingSkeleton height={40} className="w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-status-danger-bg border border-status-danger/30 rounded-lg p-6 text-center space-y-3">
        <ShieldAlert className="w-8 h-8 text-status-danger mx-auto" />
        <h3 className="text-base font-bold text-txt-primary">فشل في تحميل بيانات المطعم</h3>
        <p className="text-xs text-txt-muted">{error?.message || 'تعذر الاتصال بالسيرفر.'}</p>
        <Button size="sm" variant="outline" onClick={refetch}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  const isStatusActive = restaurant?.status === 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
              <Store className="w-6 h-6 text-brand-primary" />
              <span>إعدادات المطعم الرئيسية</span>
            </h1>
            <StatusPill status={isStatusActive ? 'success' : 'neutral'}>
              {isStatusActive ? 'نشط' : 'معطل'}
            </StatusPill>
          </div>
          <p className="text-xs text-txt-muted mt-1">
            إدارة بيانات الحساب المؤسسي الرئيسي، التوقيت، والعملة
          </p>
        </div>

        <PermissionGate permission="restaurants.manage">
          <Button
            variant={isStatusActive ? 'outline' : 'primary'}
            size="sm"
            isLoading={updateStatusMutation.isPending}
            onClick={handleStatusToggle}
          >
            {isStatusActive ? 'تعطيل حساب المطعم' : 'تفعيل حساب المطعم'}
          </Button>
        </PermissionGate>
      </div>

      {successMessage && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-bg-surface border border-border-default rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-right" noValidate>
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
              <Button type="submit" variant="primary" isLoading={updateMutation.isPending}>
                حفظ التغييرات
              </Button>
            </PermissionGate>
          </div>
        </form>
      </div>
    </div>
  );
};
