import React from 'react';
import { User, Building2, ShieldCheck, Activity } from 'lucide-react';

const QuickViewRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-3">
    <span className="flex items-center gap-2 text-xs text-txt-muted">
      <Icon className="w-4 h-4 text-brand-primary" />
      {label}
    </span>
    <span className="text-xs font-semibold text-txt-primary">{value || 'غير محدد'}</span>
  </div>
);

export const EmployeeQuickViewCard = ({ employee, statusLabel }) => {
  return (
    <div className="bg-bg-surface border border-border-default rounded-lg p-5 space-y-2 shadow-sm">
      <h3 className="text-sm font-bold text-txt-primary border-b border-border-default pb-3">
        نظرة سريعة
      </h3>
      <div className="divide-y divide-border-subtle">
        <QuickViewRow icon={Building2} label="الفرع" value={employee?.branch?.name || 'الفرع الرئيسي'} />
        <QuickViewRow icon={ShieldCheck} label="الدور الوظيفي" value={employee?.role?.name} />
        <QuickViewRow icon={Activity} label="الحالة الحالية" value={statusLabel} />
        <QuickViewRow icon={User} label="معرف الموظف" value={`#${employee?.id?.slice(-6)}`} />
      </div>
    </div>
  );
};
