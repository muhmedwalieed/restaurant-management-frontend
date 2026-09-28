import React from 'react';
import { Search } from 'lucide-react';

const STATUS_TABS = [
  { value: 'ALL', label: 'الكل' },
  { value: 'AVAILABLE', label: 'متاحة' },
  { value: 'OCCUPIED', label: 'مشغولة' },
  { value: 'RESERVED', label: 'محجوزة' },
  { value: 'MAINTENANCE', label: 'صيانة' },
];

export const TablesFilterToolbar = ({
  statusFilter,
  onStatusChange,
  statusCounts = {},
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onStatusChange(tab.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary'
              }`}
            >
              {tab.label}
              {tab.value !== 'ALL' && (
                <span className="opacity-70 mr-1 font-mono text-[10px]">({statusCounts[tab.value] || 0})</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="relative w-full sm:w-56 shrink-0">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted pointer-events-none" />
        <input
          type="text"
          placeholder="ابحث برقم الطاولة..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-bg-surface border border-border-default rounded-lg text-xs py-2 pr-10 pl-3 text-txt-primary placeholder:text-txt-muted focus-visible:outline-none focus-visible:border-brand-primary"
        />
      </div>
    </div>
  );
};
