import React from 'react';
import { Select } from '../../../../shared/components/Select.jsx';
import {
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
  ORDER_SOURCE_LABELS,
} from '../../schemas/order.schema.js';
import { Search, Calendar, X, RotateCcw } from 'lucide-react';

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'جميع الحالات' },
  { value: 'ACTIVE', label: 'قيد التنفيذ (نشط)' },
  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const TYPE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'جميع الأنواع' },
  ...Object.entries(ORDER_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

const SOURCE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'جميع المصادر' },
  ...Object.entries(ORDER_SOURCE_LABELS).map(([value, label]) => ({ value, label })),
];

export const OrdersFilterBar = ({
  searchQuery = '',
  onSearchChange,
  dateFilter = '',
  onDateChange,
  statusFilter = 'ALL',
  onStatusChange,
  typeFilter = 'ALL',
  onTypeChange,
  sourceFilter = 'ALL',
  onSourceChange,
  branchFilter = 'ALL',
  onBranchChange,
  branches = [],
  onClearFilters,
  hasActiveFilters = false,
}) => {
  const branchOptions = [
    { value: 'ALL', label: 'جميع الفروع' },
    ...branches.map((b) => ({ value: b.id, label: b.name })),
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900/70 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors select-none">
      {/* Search Input (Aligned on the side) */}
      <div className="relative w-full sm:w-72">
        <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="بحث برقم الطلب، العميل، الهاتف..."
          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 rounded-lg pr-9 pl-8 py-2 text-xs focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-600 transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
            title="مسح البحث"
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* Filter Dropdowns on the other side */}
      <div className="flex flex-wrap items-center gap-2 flex-1 justify-end min-w-0">
        {/* Date Picker Filter */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs">
          <Calendar size={13} className="text-zinc-400 shrink-0" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent text-zinc-800 dark:text-zinc-200 text-xs font-medium focus:outline-none cursor-pointer"
            title="تحديد التاريخ"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => onDateChange('')}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer ml-0.5"
              title="إلغاء فلتر التاريخ"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        {onStatusChange && (
          <Select
            value={statusFilter}
            onChange={onStatusChange}
            options={STATUS_FILTER_OPTIONS}
            className="w-28 sm:w-32 text-xs"
          />
        )}

        {/* Type Dropdown */}
        <Select
          value={typeFilter}
          onChange={onTypeChange}
          options={TYPE_FILTER_OPTIONS}
          className="w-28 sm:w-32 text-xs"
        />

        {/* Source Dropdown */}
        <Select
          value={sourceFilter}
          onChange={onSourceChange}
          options={SOURCE_FILTER_OPTIONS}
          className="w-28 sm:w-32 text-xs"
        />

        {/* Branch Dropdown */}
        {branches.length > 1 && (
          <Select
            value={branchFilter}
            onChange={onBranchChange}
            options={branchOptions}
            className="w-32 sm:w-36 text-xs"
          />
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="h-9 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="إعادة ضبط الفلاتر"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">مسح الفلاتر</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default OrdersFilterBar;
