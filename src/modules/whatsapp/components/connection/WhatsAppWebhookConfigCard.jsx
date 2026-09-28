import React, { useState } from 'react';
import { ExternalLink, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from '../../../../shared/components/Button.jsx';

export const WhatsAppWebhookConfigCard = ({
  connection,
  onRetryWebhooks,
  isRetrying,
}) => {
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const webhookCallbackUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/whatsapp`;
  const verifyToken = connection.verifyToken || '';

  return (
    <div className="bg-bg-base border border-border-default rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-brand-primary" />
            <span>إعدادات Webhook في Meta Developer Portal</span>
          </h3>
          <p className="text-xs text-txt-muted mt-0.5">
            انسخ هذه القيم وضعها داخل إعدادات تطبيق Meta الخاص برقم المطعم لتلقي الرسائل فورياً
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          icon={RefreshCw}
          isLoading={isRetrying}
          onClick={onRetryWebhooks}
          title="إعادة معالجة الرسائل العالقة"
        >
          إعادة محاولة Webhooks
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-txt-muted mb-1">
            رابط الاستقبال (Callback URL):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookCallbackUrl}
              className="flex-1 h-8 px-3 rounded-md bg-bg-surface border border-border-default font-mono text-xs text-txt-primary dir-ltr select-all"
            />
            <Button
              size="sm"
              icon={copiedField === 'url' ? Check : Copy}
              onClick={() => copyToClipboard(webhookCallbackUrl, 'url')}
            >
              {copiedField === 'url' ? 'تم النسخ' : 'نسخ'}
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-txt-muted mb-1">
            رمز التحقق (Verify Token):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={verifyToken}
              className="flex-1 h-8 px-3 rounded-md bg-bg-surface border border-border-default font-mono text-xs text-txt-primary dir-ltr select-all"
            />
            <Button
              size="sm"
              icon={copiedField === 'verify' ? Check : Copy}
              onClick={() => copyToClipboard(verifyToken, 'verify')}
            >
              {copiedField === 'verify' ? 'تم النسخ' : 'نسخ'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
