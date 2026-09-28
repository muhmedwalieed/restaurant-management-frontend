import React, { useState } from 'react';
import { Key, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Input } from '../../../../shared/components/Input.jsx';

export const WhatsAppMetaCredentialsFields = ({
  connection,
  register,
  errors = {},
}) => {
  const [showApiToken, setShowApiToken] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  return (
    <div className="space-y-3 pt-3 border-t border-border-default">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-2">
          <Key className="w-4 h-4 text-brand-primary" />
          <span>بيانات الاعتماد والأمان (Meta Credentials)</span>
        </h4>
        <span className="text-[11px] text-txt-muted">مشفرة بـ AES-256-GCM عند التخزين</span>
      </div>

      {/* API Token */}
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary cursor-pointer"
            tabIndex={-1}
          >
            {showApiToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.apiToken && (
          <p className="text-xs text-status-danger mt-1">{errors.apiToken.message}</p>
        )}
      </div>

      {/* Webhook Secret */}
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary cursor-pointer"
            tabIndex={-1}
          >
            {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.webhookSecret && (
          <p className="text-xs text-status-danger mt-1">{errors.webhookSecret.message}</p>
        )}
      </div>

      {/* Verify Token */}
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
          placeholder="رمز التحقق الخاص بحسابك..."
          icon={ShieldCheck}
          error={errors.verifyToken?.message}
          {...register('verifyToken')}
        />
      </div>
    </div>
  );
};
