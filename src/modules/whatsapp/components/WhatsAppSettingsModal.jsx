import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { updateConnectionSchema } from '../schemas/whatsapp.schema.js';
import {
  Settings,
  Phone,
  MessageSquare,
  Key,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

export const WhatsAppSettingsModal = ({
  isOpen,
  onClose,
  connection,
  onUpdate,
  isLoading,
}) => {
  const [showApiToken, setShowApiToken] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateConnectionSchema),
    defaultValues: {
      displayName: '',
      provider: 'META',
      providerPhoneNumberId: '',
      apiToken: '',
      webhookSecret: '',
      verifyToken: '',
      status: 'ACTIVE',
    },
  });

  const selectedProvider = watch('provider');

  useEffect(() => {
    if (connection && isOpen) {
      reset({
        displayName: connection.displayName || '',
        provider: connection.provider || 'META',
        providerPhoneNumberId: connection.providerPhoneNumberId || '',
        apiToken: '',
        webhookSecret: '',
        verifyToken: connection.verifyToken || '',
        status: connection.status || 'ACTIVE',
      });
      setShowApiToken(false);
      setShowWebhookSecret(false);
    }
  }, [connection, isOpen, reset]);

  const onSubmit = async (data) => {
    const payload = {};
    if (data.displayName !== undefined) payload.displayName = data.displayName;
    if (data.provider) payload.provider = data.provider;
    if (data.providerPhoneNumberId) payload.providerPhoneNumberId = data.providerPhoneNumberId;
    if (data.status) payload.status = data.status;
    if (data.verifyToken !== undefined) payload.verifyToken = data.verifyToken;
    if (data.apiToken && data.apiToken.trim() !== '') payload.apiToken = data.apiToken.trim();
    if (data.webhookSecret && data.webhookSecret.trim() !== '') payload.webhookSecret = data.webhookSecret.trim();

    const success = await onUpdate(payload);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل إعدادات الواتساب"
      subtitle="تعديل بيانات الاتصال وMeta Cloud API والتحقق الرقمي"
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-brand-primary" />
            <span>البيانات الأساسية</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="اسم العرض للاتصال"
              placeholder="مثال: الفرع الرئيسي"
              icon={MessageSquare}
              error={errors.displayName?.message}
              {...register('displayName')}
            />

            <Select
              label="نوع المزود (Provider)"
              options={[
                { value: 'META', label: 'Meta Cloud API (الرسمي الإنتاجي)' },
                { value: 'MOCK', label: 'Mock (اختباري محلي)' },
              ]}
              {...register('provider')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number ID"
              dir="ltr"
              placeholder="مثال: 1233113343227409"
              icon={Phone}
              error={errors.providerPhoneNumberId?.message}
              {...register('providerPhoneNumberId')}
            />

            <Select
              label="حالة الاتصال"
              options={[
                { value: 'ACTIVE', label: 'نشط (مفعل)' },
                { value: 'DISCONNECTED', label: 'مفصول (معطل مؤقتاً)' },
              ]}
              {...register('status')}
            />
          </div>
        </div>

        {}
        {selectedProvider === 'META' && (
          <div className="space-y-3 pt-3 border-t border-border-default">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-brand-primary" />
                <span>بيانات الاعتماد والأمان (Meta Credentials)</span>
              </h4>
              <span className="text-[11px] text-txt-muted">مشفرة بـ AES-256-GCM عند التخزين</span>
            </div>

            {}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-txt-primary">
                  Meta System User Access Token (API Token)
                </label>
                {connection?.hasApiToken && (
                  <span className="text-[11px] text-status-success font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    يوجد توكن محفوظ ومشفّر
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showApiToken ? 'text' : 'password'}
                  dir="ltr"
                  placeholder={
                    connection?.hasApiToken
                      ? '•••••••••••••••••••••••• (اتركه فارغاً للاحتفاظ بالتوكن الحالي)'
                      : 'EAA...'
                  }
                  className="w-full h-9 px-3 rounded-md bg-bg-base border border-border-default text-txt-primary text-xs focus:outline-none focus:border-brand-primary transition-colors pr-10"
                  {...register('apiToken')}
                />
                <button
                  type="button"
                  onClick={() => setShowApiToken(!showApiToken)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary"
                  tabIndex={-1}
                >
                  {showApiToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.apiToken && (
                <p className="text-xs text-status-danger mt-1">{errors.apiToken.message}</p>
              )}
            </div>

            {}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-txt-primary">
                  Webhook Secret (Meta App Secret للتحقق من التوقيع الرقمي)
                </label>
                {connection?.hasWebhookSecret && (
                  <span className="text-[11px] text-status-success font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    يوجد Secret محفوظ ومشفّر
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showWebhookSecret ? 'text' : 'password'}
                  dir="ltr"
                  placeholder={
                    connection?.hasWebhookSecret
                      ? '•••••••••••••••••••••••• (اتركه فارغاً للاحتفاظ بالـSecret الحالي)'
                      : 'App Secret من لوحة تحكم Meta'
                  }
                  className="w-full h-9 px-3 rounded-md bg-bg-base border border-border-default text-txt-primary text-xs focus:outline-none focus:border-brand-primary transition-colors pr-10"
                  {...register('webhookSecret')}
                />
                <button
                  type="button"
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary"
                  tabIndex={-1}
                >
                  {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.webhookSecret && (
                <p className="text-xs text-status-danger mt-1">{errors.webhookSecret.message}</p>
              )}
            </div>

            {}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-txt-primary">
                  Verify Token (المستخدم في مصافحة Webhook)
                </label>
                {connection?.hasVerifyToken && (
                  <span className="text-[11px] text-status-success font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    تم التعيين
                  </span>
                )}
              </div>
              <Input
                dir="ltr"
                placeholder="مثال: PrimeRestaurantVerify2026_8xK"
                icon={ShieldCheck}
                error={errors.verifyToken?.message}
                {...register('verifyToken')}
              />
            </div>
          </div>
        )}

        {}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            حفظ التغييرات
          </Button>
        </div>
      </form>
    </Modal>
  );
};
