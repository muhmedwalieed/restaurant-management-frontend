import React from 'react';
import { Layers, Clock, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_TAB_GROUPS = [
  { id: 'ALL', label: 'الكل', icon: Layers },
  { id: 'ACTIVE', label: 'قيد التنفيذ', icon: Clock },
  { id: 'DELIVERED', label: 'تم التسليم', icon: CheckCircle2 },
  { id: 'CANCELLED', label: 'ملغي', icon: XCircle },
];

export const OrdersStatusTabs = ({
  activeStatusTab,
  onTabChange,
  tabCounts = {},
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
      {STATUS_TAB_GROUPS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeStatusTab === tab.id;
        const count = tabCounts[tab.id] ?? 0;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              isActive
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary hover:border-border-subtle'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-bg-base text-txt-muted'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
