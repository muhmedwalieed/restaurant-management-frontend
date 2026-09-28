import React from 'react';
import { Sparkles } from 'lucide-react';

const COMMON_VARIABLES = [
  { key: 'customerName', label: 'اسم العميل' },
  { key: 'customerSalutation', label: 'اللقب والتحية' },
  { key: 'orderNumber', label: 'رقم الطلب' },
  { key: 'restaurantName', label: 'اسم المطعم' },
  { key: 'agentName', label: 'اسم الموظف' },
  { key: 'total', label: 'إجمالي الحساب' },
  { key: 'time', label: 'الوقت' },
  { key: 'address', label: 'العنوان' },
];

export const TemplateVariableToolbar = ({ onInsertVariable }) => {
  return (
    <div className="space-y-1.5 bg-bg-base/40 p-2.5 rounded-lg border border-border-default/60">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-txt-muted">
        <Sparkles className="w-3 h-3 text-brand-primary" />
        <span>المتغيرات الديناميكية (اضغط للإدراج في موضع المؤشر):</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {COMMON_VARIABLES.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => onInsertVariable(`{{${v.key}}}`)}
            className="px-2 py-0.5 rounded text-[11px] font-mono bg-bg-surface border border-border-default text-txt-primary hover:border-brand-primary hover:text-brand-primary transition-colors cursor-pointer"
            title={`إدراج {{${v.key}}}`}
          >
            {v.label} <span className="text-txt-dim text-[9px]">({`{{${v.key}}}`})</span>
          </button>
        ))}
      </div>
    </div>
  );
};
