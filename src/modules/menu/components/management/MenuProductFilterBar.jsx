import React from 'react';
import { Select } from '../../../../shared/components/Select.jsx';
import { Search } from 'lucide-react';

const AVAILABILITY_OPTIONS = [
  { value: 'ALL', label: 'جميع حالات التوافر' },
  { value: 'true', label: 'المتاحة للطلب فقط' },
  { value: 'false', label: 'غير المتاحة حالياً' },
];

export const MenuProductFilterBar = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  availabilityFilter,
  onAvailabilityChange,
  categoryOptions = [],
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-txt-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث بالاسم، الوصف، أو الرمز..."
          className="w-full bg-bg-surface border border-border-default/80 rounded-xl pr-9 pl-4 py-2 text-xs text-txt-primary placeholder:text-txt-muted/70 focus:outline-none focus:border-brand-primary transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 sm:w-auto w-full">
        <Select
          value={selectedCategory}
          onChange={onCategoryChange}
          options={[
            { value: 'ALL', label: 'جميع التصنيفات' },
            ...categoryOptions,
          ]}
          className="w-full sm:w-44 text-xs"
        />

        <Select
          value={availabilityFilter}
          onChange={onAvailabilityChange}
          options={AVAILABILITY_OPTIONS}
          className="w-full sm:w-40 text-xs"
        />
      </div>
    </div>
  );
};
