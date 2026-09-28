import React from 'react';
import { User, Phone, Mail, CalendarDays } from 'lucide-react';

const Card = ({ title, icon: Icon, children }) => (
  <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
    <div className="px-4 py-3 border-b border-border-default flex items-center gap-2">
      <Icon className="w-4 h-4 text-brand-primary" />
      <h3 className="text-sm font-bold text-txt-primary">{title}</h3>
    </div>
    <div className="px-4 py-2 divide-y divide-border-subtle">{children}</div>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-3">
    <span className="p-1.5 rounded-md bg-bg-base text-brand-primary shrink-0">
      <Icon className="w-4 h-4" />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-txt-muted">{label}</p>
      <p className="text-sm font-semibold text-txt-primary truncate">{value || 'غير محدد'}</p>
    </div>
  </div>
);

const formatDate = (date) => {
  if (!date) return 'غير محدد';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 'غير محدد';
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const EmployeeBasicInfoTab = ({ employee }) => {
  return (
    <Card title="معلومات الموظف" icon={User}>
      <InfoRow icon={User} label="الاسم" value={employee?.name} />
      <InfoRow icon={Phone} label="رقم الهاتف" value={employee?.phone} />
      <InfoRow icon={Mail} label="البريد الإلكتروني" value={employee?.email} />
      <InfoRow icon={CalendarDays} label="تاريخ الإنشاء" value={formatDate(employee?.createdAt)} />
      <InfoRow icon={CalendarDays} label="آخر تحديث" value={formatDate(employee?.updatedAt)} />
    </Card>
  );
};
