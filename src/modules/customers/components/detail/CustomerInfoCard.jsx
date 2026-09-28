import React from 'react';
import { User, Phone, StickyNote, Calendar } from 'lucide-react';

const InfoRow = ({ icon: Icon, label, value, isPhone }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border-subtle/40 last:border-b-0 text-xs">
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-brand-primary shrink-0" />
      <span className="font-medium text-txt-muted">{label}:</span>
    </div>
    <span className={`font-semibold text-txt-primary text-left ${isPhone ? 'font-mono dir-ltr' : ''}`}>
      {value || 'غير محدد'}
    </span>
  </div>
);

export const CustomerInfoCard = ({ customer }) => {
  return (
    <div className="bg-bg-surface border border-border-default rounded-lg p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border-default pb-3">
        <User className="w-4 h-4 text-brand-primary" />
        <h3 className="text-sm font-bold text-txt-primary">البيانات الشخصية</h3>
      </div>

      <div className="divide-y divide-border-subtle/40">
        <InfoRow icon={User} label="الاسم الكامل" value={customer?.name} />
        <InfoRow icon={Phone} label="رقم الهاتف" value={customer?.phone} isPhone />
        <InfoRow
          icon={Calendar}
          label="تاريخ التسجيل"
          value={
            customer?.createdAt
              ? new Date(customer.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : '—'
          }
        />
        {customer?.notes && (
          <div className="pt-2.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-txt-muted">
              <StickyNote className="w-3.5 h-3.5 text-brand-primary" />
              <span>ملاحظات خاصة:</span>
            </div>
            <p className="text-xs text-txt-primary bg-bg-base p-2.5 rounded-md border border-border-subtle leading-relaxed">
              {customer.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
