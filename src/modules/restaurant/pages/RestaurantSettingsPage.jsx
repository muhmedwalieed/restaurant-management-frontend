import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useRestaurantQuery,
  useUpdateRestaurantMutation,
  useUpdateRestaurantStatusMutation,
} from '../hooks/useRestaurant.js';
import { Button } from '../../../shared/components/Button.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import { ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { RestaurantStatusCard } from '../components/RestaurantStatusCard.jsx';
import { RestaurantProfileForm } from '../components/RestaurantProfileForm.jsx';

export const restaurantProfileSchema = z.object({
  name: z.string().min(2, 'اسم المطعم يجب أن لا يقل عن حرفين'),
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('صيغة البريد غير صحيحة'),
  phone: z.string().min(6, 'رقم الهاتف غير صحيح'),
  currency: z.string().min(2, 'رمز العملة مطلوب'),
  timezone: z.string().min(2, 'التوقيت المحلي مطلوب'),
  logoUrl: z
    .string()
    .optional()
    .refine((val) => !val || val.startsWith('/uploads/') || z.string().url().safeParse(val).success, {
      message: 'أرفع لوجو من جهازك أو أدخل رابط صحيح',
    }),
});

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
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(restaurantProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      logoUrl: '',
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
        logoUrl: restaurant.logoUrl || '',
      });
    }
  }, [restaurant, reset]);

  const onSubmit = async (formData) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await updateMutation.mutateAsync({ ...formData, logoUrl: watch('logoUrl') || undefined });
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
        <ShieldAlert className="w-6 h-6 text-status-danger mx-auto" />
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
      <RestaurantStatusCard
        isStatusActive={isStatusActive}
        isLoading={updateStatusMutation.isPending}
        onStatusToggle={handleStatusToggle}
      />

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

      <RestaurantProfileForm
        restaurant={restaurant}
        register={register}
        handleSubmit={handleSubmit}
        errors={errors}
        onSubmit={onSubmit}
        watch={watch}
        setValue={setValue}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};

export default RestaurantSettingsPage;
