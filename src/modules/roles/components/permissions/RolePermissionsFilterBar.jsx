import React from 'react';
import { Search } from 'lucide-react';

export const RolePermissionsFilterBar = ({
  searchQuery,
  onSearchChange,
  categoryTabs = [],
  activeCategoryTab,
  onCategoryTabChange,
}) => {
  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-4 space-y-3.5 shadow-sm">
      <div className="relative">
        <Search className="w-4 h-4 text-txt-muted absolute right-3 top-2.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث في الصلاحيات (مثال: طاولات، دفع، إلغاء)..."
          className="w-full bg-bg-base border border-border-default rounded-lg text-xs py-2 pr-10 pl-3 text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-brand-primary"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {categoryTabs.map((tab) => {
          const isSelected = activeCategoryTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onCategoryTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-bg-base text-txt-muted border border-border-subtle hover:text-txt-primary hover:border-white/10'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
