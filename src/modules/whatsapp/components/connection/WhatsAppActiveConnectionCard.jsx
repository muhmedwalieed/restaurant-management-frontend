import React from 'react';
import { Phone, ShieldCheck, Key, Check } from 'lucide-react';
import { PROVIDER_LABELS } from '../../schemas/whatsapp.schema.js';

export const WhatsAppActiveConnectionCard = ({ connection }) => {
  if (!connection) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-bg-base border border-border-default rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-bold text-txt-dim uppercase tracking-wider flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-brand-primary" />
          <span>بيانات الرقم والاتصال</span>
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-border-subtle">
            <span className="text-txt-muted">اسم الحساب:</span>
            <span className="font-bold text-txt-primary">{connection.displayName || 'غير محدد'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border-subtle">
            <span className="text-txt-muted">المزود:</span>
            <span className="font-medium text-txt-primary">{PROVIDER_LABELS[connection.provider] || connection.provider}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border-subtle">
            <span className="text-txt-muted">WABA Account ID:</span>
            <span className="font-mono text-txt-primary dir-ltr">{connection.providerAccountId || '-'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border-subtle">
            <span className="text-txt-muted">Phone Number ID:</span>
            <span className="font-mono text-txt-primary dir-ltr">{connection.providerPhoneNumberId || '-'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-txt-muted">تاريخ الربط:</span>
            <span className="text-txt-primary">{new Date(connection.createdAt).toLocaleDateString('ar-EG')}</span>
          </div>
        </div>
      </div>

      <div className="bg-bg-base border border-border-default rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-bold text-txt-dim uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
          <span>حالة التشفير والأمان</span>
        </h3>
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-2 rounded bg-bg-surface border border-border-default">
            <span className="flex items-center gap-1.5 text-txt-primary">
              <Key className="w-3.5 h-3.5 text-brand-primary" />
              <span>Meta API Token</span>
            </span>
            <span className="flex items-center gap-1 text-status-success font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>مشفر (AES-256)</span>
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-bg-surface border border-border-default">
            <span className="flex items-center gap-1.5 text-txt-primary">
              <Key className="w-3.5 h-3.5 text-brand-primary" />
              <span>Webhook HMAC Secret</span>
            </span>
            <span className="flex items-center gap-1 text-status-success font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>مشفر (AES-256)</span>
            </span>
          </div>
          <p className="text-[11px] text-txt-muted">
            جميع مفاتيح الاتصال الحساسة مخزنة بتشفير قوي وغير قابلة للاستخراج، ويتم التحقق من توقيع كل رسالة قادمة تلقائياً.
          </p>
        </div>
      </div>
    </div>
  );
};
