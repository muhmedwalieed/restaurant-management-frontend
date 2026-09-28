import React from 'react';
import { Select } from '../../../../shared/components/Select.jsx';
import {
  ORDER_TYPE_LABELS,
  ORDER_SOURCE_LABELS,
} from '../../schemas/order.schema.js';
import { Search } from 'lucide-react';

const TYPE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'جميع الأنواع' },
  ...Object.entries(ORDER_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

const SOURCE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'جميع المصادر' },
  ...Object.entries(ORDER_SOURCE_LABELS).map(([value, label]) => ({ value, label })),
];

export const OrdersFilterBar = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
  sourceFilter,
  onSourceChange,
  branchFilter,
  onBranchChange,
  branches = [],
}) => {
  const branchOptions = [
    { value: 'ALL', label: 'جميع الفروع' },
    ...branches.map((b) => ({ value: b.id, label: b.name })),
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-txt-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث برقم الطلب، اسم العميل، الهاتف، أو الطاولة..."
          className="w-full bg-bg-surface border border-border-default/80 rounded-xl pr-9 pl-4 py-2 text-xs text-txt-primary placeholder:text-txt-muted/70 focus:outline-none focus:border-brand-primary transition-colors"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:w-auto w-full">
        <Select
          value={typeFilter}
          onChange={onTypeChange}
          options={TYPE_FILTER_OPTIONS}
          className="w-full sm:w-36 text-xs"
        />

        <Select
          value={sourceFilter}
          onChange={onSourceChange}
          options={SOURCE_FILTER_OPTIONS}
          className="w-full sm:w-36 text-xs"
        />

        {branches.length > 1 && (
          <Select
            value={branchFilter}
            onChange={onBranchChange}
            options={branchOptions}
            className="w-full sm:w-40 text-xs"
          />
        )}
      </div>
    </div>
  );
};
