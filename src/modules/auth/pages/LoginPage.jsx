/* eslint-disable react-refresh/only-export-components */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Store, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

// Zod Login Form Validation Schema
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
  const [serverNotice, setServerNotice] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setServerNotice(null);
    try {
      // Presentational / UI-Only Handler (Section 7.1 & ADR-F009: Backend Auth Module is NOT DONE yet)
      await login(data.email, data.password);
      setServerNotice({ type: 'success', text: 'تم تسجيل الدخول بنجاح (واجهة العرض التجريبية).' });
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (_err) {
      setServerNotice({ type: 'error', text: 'فشل في تسجيل الدخول.' });
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-bg-surface border border-border-default rounded-lg p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-txt-primary">تسجيل الدخول للنظام</h1>
          <p className="text-xs text-txt-muted">
            ادخل بيانات الحساب للوصول إلى لوحة إدارة المطعم
          </p>
        </div>

        {/* UI-Only Notice Banner */}
        <div className="bg-status-info-bg border border-status-info/30 rounded-md p-3 text-xs text-status-info flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>
            هذه الشاشة تجريبية (Presentational / UI-Only) تلتزم بـ ADR-F009 لعدم إرسال طلبات لـ Backend Auth الموديول القادم.
          </span>
        </div>

        {serverNotice && (
          <div
            className={`p-3 rounded-md text-xs font-medium ${
              serverNotice.type === 'success'
                ? 'bg-status-success-bg text-status-success border border-status-success/30'
                : 'bg-status-danger-bg text-status-danger border border-status-danger/30'
            }`}
          >
            {serverNotice.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="البريد الإلكتروني"
            type="email"
            placeholder="admin@restaurant.com"
            icon={Mail}
            required
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="كلمة المرور"
            type="password"
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
            className="w-full mt-2"
          >
            تسجيل الدخول
          </Button>
        </form>

        <div className="text-center text-xs text-txt-muted border-t border-border-subtle pt-4">
          نظام إدارة المطاعم SaaS — الإصدار 1.0 (Foundation Shell)
        </div>
      </div>
    </div>
  );
};
