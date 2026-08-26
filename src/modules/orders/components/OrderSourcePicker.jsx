import React from 'react';
import { UserCheck, Phone, MessageSquare, Globe } from 'lucide-react';

const SOURCE_OPTIONS = [
  { value: 'CASHIER', label: 'كاشير', icon: UserCheck },
  { value: 'PHONE', label: 'هاتف', icon: Phone },
  { value: 'WHATSAPP', label: 'واتساب', icon: MessageSquare },
  { value: 'WEBSITE', label: 'أونلاين', icon: Globe },
];

export const OrderSourcePicker = ({ value, onChange, sources }) => {
  const options = sources ? SOURCE_OPTIONS.filter((o) => sources.includes(o.value)) : SOURCE_OPTIONS;
  if (options.length <= 1) return null;

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-txt-primary block">مصدر الطلب</label>
      <div className="grid grid-flow-col auto-cols-fr gap-1 p-1 bg-bg-base/80 border border-border-default rounded-lg">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`py-1.5 px-1 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${
                isSelected
                  ? 'bg-brand-primary text-slate-950 shadow-sm'
                  : 'text-txt-muted hover:text-txt-primary hover:bg-white/[0.04]'
              }`}
              title={opt.label}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OrderSourcePicker;