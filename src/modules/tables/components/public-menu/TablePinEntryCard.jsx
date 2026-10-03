import React from 'react';
import { Store, Utensils, Lock, Users, Send, AlertCircle } from 'lucide-react';
import { Button } from '../../../../shared/components/Button.jsx';
import { Input } from '../../../../shared/components/Input.jsx';
import { resolveAssetUrl } from '../../../../lib/asset-url.js';
import { formatTableLabel } from '../../utils/tableLabel.js';

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
    <div className="min-h-screen bg-bg-base flex flex-col">
      {/* Brand header */}
      <div className="px-4 sm:px-6 pt-12 pb-10 text-center border-b border-border-subtle bg-gradient-to-b from-brand-primary/[0.08] to-transparent">
        <div className="max-w-md mx-auto space-y-4">
          {restaurant?.logoUrl ? (
            <img
              src={resolveAssetUrl(restaurant.logoUrl)}
              alt=""
              className="w-20 h-20 object-cover rounded-2xl border border-border-default mx-auto"
            />
          ) : (
            <span className="inline-flex w-20 h-20 rounded-2xl bg-bg-surface border border-border-default items-center justify-center mx-auto">
              <Store className="w-9 h-9 text-brand-primary" aria-hidden="true" />
            </span>
          )}

          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold text-txt-primary">
              {restaurant?.name || 'مطعمنا'}
            </h1>
            <p className="text-sm text-txt-muted">
              {table?.label ? formatTableLabel(table.label) : branch?.name}
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-txt-muted bg-bg-surface border border-border-subtle px-3 py-1.5 rounded-full">
            <Utensils className="w-3.5 h-3.5 text-brand-primary" aria-hidden="true" />
            اطلب بنفسك من هاتفك
          </span>
        </div>
      </div>

      {/* Join card */}
      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-md bg-bg-surface border border-border-default rounded-2xl p-6 sm:p-7 space-y-6 animate-fadeUp">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-primary/10">
              <Lock className="w-5 h-5 text-brand-primary" aria-hidden="true" />
            </span>
            <h2 className="text-base font-bold text-txt-primary">الانضمام إلى طاولة الطعام</h2>
            <p className="text-xs text-txt-muted leading-relaxed">
              أدخل اسمك والرمز السري (PIN) اللي أعطاه لك موظف الصالة.
            </p>
          </div>

          <form onSubmit={onJoin} className="space-y-4">
            <Input
              name="guestName"
              label="اسمك"
              value={myName}
              onChange={(e) => onChangeMyName(e.target.value)}
              placeholder="مثال: أحمد"
              icon={Users}
              autoComplete="name"
              className="text-base min-h-[44px]"
            />
            <Input
              name="guestPin"
              label="الرمز السري (PIN)"
              value={pin}
              onChange={(e) => onChangePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
              dir="ltr"
              icon={Lock}
              maxLength={4}
              inputMode="numeric"
              autoComplete="one-time-code"
              className="text-center text-base font-bold tracking-[0.35em] min-h-[44px]"
            />

            {joinError && (
              <div
                role="alert"
                className="p-3 rounded-xl text-xs font-medium bg-status-danger/10 text-status-danger border border-status-danger/30 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{joinError}</span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              radius="lg"
              className="w-full"
              isLoading={joinLoading}
              icon={Send}
            >
              دخول الجلسة
            </Button>
          </form>

          <p className="text-[11px] text-txt-muted text-center leading-relaxed">
           لو مش عارف رمز الدخول (PIN)، أو مفيش جلسة مفتوحة على الطاولة، كلّم أحد أفراد الخدمة.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TablePinEntryCard;
