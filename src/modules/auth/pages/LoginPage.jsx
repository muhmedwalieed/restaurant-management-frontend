/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Store, Mail, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';

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
  const [serverError, setServerError] = useState(null);
  const [showForceLogoutModal, setShowForceLogoutModal] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState(null);
  const [sessionDevice, setSessionDevice] = useState(null);

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

  const handleLoginSubmit = async (data, forceLogout = false) => {
    setServerError(null);
    try {
      await login(data.email, data.password, forceLogout);
      setShowForceLogoutModal(false);
      navigate('/');
    } catch (err) {
      // Active session on another device → 422 BUSINESS_RULE_ERROR with details.forceLogoutRequired
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

        {serverError && (
          <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit((data) => handleLoginSubmit(data, false))} className="space-y-4" noValidate>
          <Input
            label="البريد الإلكتروني"
            type="email"
            autoComplete="email"
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
            className="w-full mt-2"
          >
            تسجيل الدخول
          </Button>
        </form>

        <div className="text-center text-xs text-txt-muted border-t border-border-subtle pt-4">
          نظام إدارة المطاعم SaaS — الإصدار 1.0 (Module 2 Active)
        </div>
      </div>

      {/* Force Logout Confirmation Modal (Section 16 UX) */}
      <Modal
        isOpen={showForceLogoutModal}
        onClose={() => setShowForceLogoutModal(false)}
        title="الحساب مفتوح على جهاز آخر"
        subtitle="تنبيه أمان الجلسات النشطة"
        size="sm"
      >
        <div className="space-y-4 text-right">
          <div className="w-12 h-12 rounded-full bg-status-warning-bg text-status-warning flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
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
