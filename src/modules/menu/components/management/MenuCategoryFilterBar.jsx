import React from 'react';
import { Select } from '../../../../shared/components/Select.jsx';
import { Search } from 'lucide-react';

const CATEGORY_STATUS_OPTIONS = [
  { value: 'ALL', label: 'جميع الحالات' },
  { value: 'ACTIVE', label: 'نشط فقط' },
  { value: 'INACTIVE', label: 'معطل فقط' },
];

export const MenuCategoryFilterBar = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-txt-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث في أسماء وتوصيف الأقسام..."
          className="w-full bg-bg-surface border border-border-default/80 rounded-xl pr-9 pl-4 py-2 text-xs text-txt-primary placeholder:text-txt-muted/70 focus:outline-none focus:border-brand-primary transition-colors"
        />
      </div>

      <div className="sm:w-48 w-full">
        <Select
          value={statusFilter}
          onChange={onStatusChange}
          options={CATEGORY_STATUS_OPTIONS}
          className="w-full text-xs"
        />
      </div>
    </div>
  );
};
