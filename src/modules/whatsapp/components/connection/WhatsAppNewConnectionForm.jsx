import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { connectConnectionSchema } from '../../schemas/whatsapp.schema.js';
import { Button } from '../../../../shared/components/Button.jsx';
import { Input } from '../../../../shared/components/Input.jsx';
import { Select } from '../../../../shared/components/Select.jsx';
import { Link2, ShieldCheck } from 'lucide-react';

export const WhatsAppNewConnectionForm = ({ onConnect, isConnecting }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(connectConnectionSchema),
    defaultValues: {
      provider: 'META',
      providerAccountId: '',
      providerPhoneNumberId: '',
      apiToken: '',
      webhookSecret: '',
      verifyToken: '',
      displayName: '',
    },
  });

  const selectedProvider = watch('provider');

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-bg-base border border-border-default rounded-lg p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-txt-primary">ربط حساب واتساب جديد للمطعم</h3>
            <p className="text-xs text-txt-muted">
              أدخل بيانات حساب Meta Cloud API أو اختر Mock للتجربة والاختبار المحلي
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onConnect)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="نوع المزود (Provider)"
              options={[
                { value: 'META', label: 'Meta Cloud API (الرسمي)' },
                { value: 'MOCK', label: 'Mock (اختباري محلي)' },
              ]}
              {...register('provider')}
            />

            <Input
              label="اسم الحساب التعريفي"
              placeholder="مثال: مطعمنا - الفرع الرئيسي"
              error={errors.displayName?.message}
              {...register('displayName')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="معرّف حساب واتساب للأعمال (WABA Account ID)"
              placeholder="1105591915343508"
              dir="ltr"
              error={errors.providerAccountId?.message}
              {...register('providerAccountId')}
            />

            <Input
              label="معرّف رقم الهاتف (Phone Number ID)"
              placeholder="1233113343227409"
              dir="ltr"
              error={errors.providerPhoneNumberId?.message}
              {...register('providerPhoneNumberId')}
            />
          </div>

          {selectedProvider === 'META' && (
            <div className="space-y-4 pt-2 border-t border-border-subtle">
              <div className="p-3 bg-bg-surface rounded-md border border-border-default text-xs text-txt-muted flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                <span>
                  يتم تشفير الـ <strong>API Token</strong> والـ <strong>Webhook Secret</strong> تلقائياً بخوارزمية <strong>AES-256-GCM</strong> داخل قاعدة البيانات ولن تظهر كنص صريح أبداً.
                </span>
              </div>

              <Input
                label="رمز الوصول الدائم (System User API Token)"
                type="password"
                placeholder="EAAc4OTk0YyM..."
                dir="ltr"
                error={errors.apiToken?.message}
                {...register('apiToken')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="السر الخاص بالـ Webhook (App Secret / Webhook Secret)"
                  type="password"
                  placeholder="9755d936ab8ba8e3..."
                  dir="ltr"
                  error={errors.webhookSecret?.message}
                  {...register('webhookSecret')}
                />

                <Input
                  label="رمز التحقق (Verify Token)"
                  placeholder="PrimeRestaurantVerify2026_8xK"
                  dir="ltr"
                  error={errors.verifyToken?.message}
                  {...register('verifyToken')}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isConnecting}
              icon={Link2}
            >
              ربط الحساب وتشفير المفاتيح
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
