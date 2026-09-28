import React from 'react';
import { RolePermissionItem } from './RolePermissionItem.jsx';

export const RolePermissionModuleCard = ({
  group,
  selectedPermissions = [],
  isDisabled = false,
  onTogglePermission,
  onToggleGroup,
}) => {
  const groupKeys = (group.matchingPermissions || []).map((p) => p.key);
  const selectedInGroup = groupKeys.filter((k) => selectedPermissions.includes(k)).length;
  const isGroupAllSelected = groupKeys.length > 0 && selectedInGroup === groupKeys.length;

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-bg-base/60 border-b border-border-subtle flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <h3 className="text-xs font-bold text-txt-primary truncate">
            {group.localizedModule}
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-white/[0.06] text-txt-muted border border-border-subtle">
            {selectedInGroup} / {group.matchingPermissions.length} محدد
          </span>
        </div>

        {!isDisabled && onToggleGroup && (
          <button
            type="button"
            onClick={() => onToggleGroup(group.matchingPermissions)}
            className="text-[11px] font-semibold text-brand-primary hover:underline shrink-0 cursor-pointer"
          >
            {isGroupAllSelected ? 'إلغاء تحديد القسم' : 'تحديد الكل في القسم'}
          </button>
        )}
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {group.matchingPermissions.map((p) => (
          <RolePermissionItem
            key={p.key}
            permission={p}
            isChecked={selectedPermissions.includes(p.key)}
            isDisabled={isDisabled}
            onToggle={onTogglePermission}
          />
        ))}
      </div>
    </div>
  );
};
