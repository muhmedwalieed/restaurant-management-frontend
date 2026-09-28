import React from 'react';
import { getLocalizedPermissionName } from '../../schemas/permissions.dict.js';

export const RolePermissionItem = ({
  permission,
  isChecked = false,
  isDisabled = false,
  onToggle,
}) => {
  const localizedName = getLocalizedPermissionName(permission.key, permission.name);

  return (
    <label
      className={`flex items-start gap-2.5 p-3 rounded-lg border transition-all select-none ${
        isDisabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
      } ${
        isChecked
          ? 'bg-brand-primary/10 border-brand-primary/30 text-txt-primary'
          : 'bg-bg-base/40 border-border-subtle hover:border-white/10 text-txt-muted hover:text-txt-primary'
      }`}
    >
      <input
        type="checkbox"
        checked={isChecked}
        disabled={isDisabled}
        onChange={() => onToggle(permission.key)}
        className="mt-0.5 w-4 h-4 rounded border-border-default bg-bg-surface text-brand-primary focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0"
      />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-semibold text-txt-primary leading-tight">
          {localizedName}
        </span>
        <span className="font-mono text-[10px] text-txt-muted/70 tracking-wider truncate" dir="ltr">
          {permission.key}
        </span>
      </div>
    </label>
  );
};
