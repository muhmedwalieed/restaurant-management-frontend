import React from 'react';
import { Store, Utensils, Lock, Users, Send, AlertCircle } from 'lucide-react';
import { Button } from '../../../../shared/components/Button.jsx';
import { Input } from '../../../../shared/components/Input.jsx';
import { resolveAssetUrl } from '../../../../lib/asset-url.js';

export const TablePinEntryCard = ({
  restaurant,
  table,
  branch,
  myName,
  onChangeMyName,
  pin,
  onChangePin,
  joinError,
  joinLoading,
  onJoin,
}) => {
  return (
    <div className="min-h-screen bg-bg-base">
      {/* Brand Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-brand-primary/15 via-transparent to-transparent">
        <div className="max-w-md mx-auto px-6 pt-12 pb-8 text-center">
          {restaurant?.logoUrl ? (
            <img
              src={resolveAssetUrl(restaurant.logoUrl)}
              alt={restaurant.name}
              className="w-24 h-24 object-cover rounded-2xl border border-border-default shadow-lg mx-auto"
            />
          ) : (
            <span className="inline-flex w-24 h-24 rounded-2xl bg-bg-surface border border-border-default items-center justify-center shadow-lg">
              <Store className="w-10 h-10 text-brand-primary" />
            </span>
          )}
          <h1 className="mt-5 text-2xl font-bold text-txt-primary">
            {restaurant?.name || 'مطعمنا'}
          </h1>
          <p className="mt-2 text-sm text-txt-muted">
            {table?.label ? `طاولة ${table.label}` : branch?.name}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-txt-muted bg-bg-surface border border-border-subtle px-3 py-1.5 rounded-full">
            <Utensils className="w-3.5 h-3.5 text-brand-primary" />
            اطلب بنفسك من الطاولة
          </span>
        </div>
      </div>

      {/* PIN Card */}
      <div className="max-w-md mx-auto px-6 pb-12 -mt-2">
        <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-lg space-y-5">
          <div className="text-center space-y-1.5">
            <span className="inline-flex p-3 rounded-full bg-brand-primary/10">
              <Lock className="w-5 h-5 text-brand-primary" />
            </span>
            <h2 className="text-base font-bold text-txt-primary">الانضمام إلى طاولة الطعام</h2>
            <p className="text-xs text-txt-muted">أدخل اسمك والرمز السري (PIN) المزود من قِبل موظف الصالة</p>
          </div>

          <form onSubmit={onJoin} className="space-y-4">
            <Input
              label="اسمك"
              value={myName}
              onChange={(e) => onChangeMyName(e.target.value)}
              placeholder="مثال: أحمد"
              icon={Users}
            />
            <Input
              label="الرمز السري (PIN)"
              value={pin}
              onChange={(e) => onChangePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
              dir="ltr"
              icon={Lock}
              maxLength={4}
              inputMode="numeric"
            />

            {joinError && (
              <div className="p-3 rounded-xl text-xs font-medium bg-status-danger/10 text-status-danger border border-status-danger/30 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{joinError}</span>
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={joinLoading} icon={Send}>
              دخول الجلسة
            </Button>
          </form>

          {!table?.label && (
            <p className="text-[11px] text-txt-muted text-center">
              في حال عدم وجود جلسة نشطة، يرجى طلب بدء الجلسة من موظف الصالة.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
