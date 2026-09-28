import React from 'react';
import { Store, Users } from 'lucide-react';
import { resolveAssetUrl } from '../../../../lib/asset-url.js';

export const TableMenuHeader = ({
  restaurant,
  table,
  branch,
  session,
  isClosed,
  onLeaveSession,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-border-default bg-bg-surface/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        {restaurant?.logoUrl ? (
          <img
            src={resolveAssetUrl(restaurant.logoUrl)}
            alt={restaurant.name}
            className="w-10 h-10 object-cover rounded-lg border border-border-default shrink-0"
          />
        ) : (
          <span className="w-10 h-10 rounded-lg bg-bg-surface-elevated border border-border-default shrink-0 flex items-center justify-center">
            <Store className="w-5 h-5 text-brand-primary" />
          </span>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-txt-primary truncate">
            {restaurant?.name || 'مطعمنا'}
          </h1>
          <p className="text-xs text-txt-muted truncate">
            {table?.label ? `طاولة ${table.label}` : branch?.name}
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-txt-muted bg-bg-base px-2.5 py-1 rounded-full border border-border-subtle"
          title={session?.members?.map((m) => m.name).join('، ') || ''}
        >
          <Users className="w-3.5 h-3.5 text-brand-primary" />
          <span>{session?.members?.length || 0}</span>
        </span>
        {isClosed && (
          <button
            type="button"
            onClick={onLeaveSession}
            className="shrink-0 text-xs font-semibold text-txt-muted hover:text-status-danger transition-colors cursor-pointer"
            title="تسجيل خروج والعودة لشاشة الدخول"
          >
            تسجيل خروج
          </button>
        )}
      </div>
    </header>
  );
};
