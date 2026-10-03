
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Modal } from '../../../shared/components/Modal.jsx';
import { getPublicRestaurantApi } from '../../../lib/api/restaurant.api.js';
import { resolveAssetUrl } from '../../../lib/asset-url.js';
import { restaurantSlug } from '../../../shared/tenant/tenant.js';
import { Store, Mail, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('صيغة البريد الإلكتروني غير صحيحة'),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة')
    .min(6, 'كلمة المرور يجب أن لا تقل عن 6 أحرف'),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Branding for the restaurant whose staff host this is.
  const restaurantQuery = useQuery({
    queryKey: ['public-restaurant', restaurantSlug],
    queryFn: () => getPublicRestaurantApi(restaurantSlug),
    enabled: Boolean(restaurantSlug),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const restaurant = restaurantQuery.data;
  const isUnknownRestaurant = Boolean(restaurantSlug) && restaurantQuery.isError;

  const [serverError, setServerError] = useState(null);
  const [showForceLogoutModal, setShowForceLogoutModal] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState(null);
  const [sessionDevice, setSessionDevice] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    reset({ email: '', password: '' });
  }, [reset]);

  const handleLoginSubmit = async (data, forceLogout = false) => {
    setServerError(null);
    try {
      await login(data.email, data.password, forceLogout);
      setShowForceLogoutModal(false);
      navigate('/', { replace: true });
    } catch (err) {

      const isActiveSession = err.code === 'BUSINESS_RULE_ERROR' && err.details?.forceLogoutRequired;
      if (isActiveSession) {
        setPendingCredentials(data);
        setSessionDevice(err.details?.sessionDevice || null);
        setShowForceLogoutModal(true);
      } else if (err.status === 401) {
        setServerError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else {
        setServerError(err.message || 'فشل في تسجيل الدخول. يرجى التأكد من صحة البيانات.');
      }
    }
  };

  const confirmForceLogout = async () => {
    if (pendingCredentials) {
      await handleLoginSubmit(pendingCredentials, true);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-bg-surface border border-border-default rounded-lg p-6 sm:p-8 space-y-6 shadow-lift">
        {/* Header — branded with the restaurant this host belongs to */}
        <div className="text-center space-y-2.5">
          {restaurant?.logoUrl ? (
            <img
              src={resolveAssetUrl(restaurant.logoUrl)}
              alt={restaurant.name}
              className="w-12 h-12 rounded-md object-cover mx-auto shadow-xs"
            />
          ) : (
            <div className="w-10 h-10 rounded-md bg-brand-primary text-txt-inverted flex items-center justify-center mx-auto shadow-xs">
              <Store className="w-5 h-5" />
            </div>
          )}
          <h1 className="text-xl font-bold text-txt-primary">
            {restaurant?.name || 'تسجيل الدخول للنظام'}
          </h1>
          <p className="text-xs text-txt-muted">
            {restaurant
              ? `ادخل بيانات حسابك في ${restaurant.name} للوصول إلى لوحة الإدارة`
              : 'ادخل بيانات الحساب للوصول إلى لوحة إدارة المطعم'}
          </p>
        </div>

        {isUnknownRestaurant && (
          <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>مفيش مطعم بالكود ده. اتأكد من اللينك اللي وصلك من إدارة المطعم.</span>
          </div>
        )}

        {serverError && (
          <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit((data) => handleLoginSubmit(data, false))}
          className="space-y-4"
          autoComplete="on"
          noValidate
        >
          <Input
            label="البريد الإلكتروني"
            type="email"
            autoComplete="username"
            placeholder="admin@restaurant.com"
            icon={Mail}
            required
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="كلمة المرور"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            icon={Lock}
            required
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={isUnknownRestaurant}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 border-transparent shadow-lg shadow-emerald-900/20 rounded-xl py-3 text-sm font-semibold tracking-wide"
            >
              تسجيل الدخول
            </Button>
        </form>

        <div className="text-center text-xs text-txt-muted border-t border-border-subtle pt-4">
          نظام إدارة المطاعم SaaS، الإصدار 1.0
        </div>
      </div>

      {}
      <Modal
        isOpen={showForceLogoutModal}
        onClose={() => setShowForceLogoutModal(false)}
        title="الحساب مفتوح على جهاز آخر"
        subtitle="تنبيه أمان الجلسات النشطة"
        size="sm"
      >
        <div className="space-y-4 text-right">
          <ShieldCheck className="w-6 h-6 text-status-warning" />
          <p className="text-xs text-txt-muted leading-relaxed">
            هذا الحساب مسجّل دخوله حالياً على جهاز أو متصفح آخر
            {sessionDevice ? ` (${sessionDevice})` : ''}. هل تريد إلغاء الجلسة السابقة وتسجيل الدخول من هذا الجهاز؟
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowForceLogoutModal(false)}>
              إلغاء
            </Button>
            <Button variant="danger" size="sm" onClick={confirmForceLogout}>
              إغلاق الجلسة السابقة وتسجيل الدخول
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
