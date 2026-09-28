import React from 'react';
import {
  Building2,
  Hash,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Input } from '../../../../shared/components/Input.jsx';
import { Select } from '../../../../shared/components/Select.jsx';
import { Button } from '../../../../shared/components/Button.jsx';
import { PermissionGate } from '../../../../shared/components/PermissionGate.jsx';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'نشط' },
  { value: 'INACTIVE', label: 'معطل' }
];

export const BranchGeneralInfoTab = ({
  branch,
  register,
  handleSubmit,
  errors = {},
  onSubmit,
  isLoading = false,
  generalSuccess,
  generalError,
}) => {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-right" noValidate>
      <input type="hidden" {...register('code')} value={branch?.code || ''} />
      {generalSuccess && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{generalSuccess}</span>
        </div>
      )}

      {generalError && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="اسم الفرع"
          icon={Building2}
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="كود الفرع"
          icon={Hash}
          value={branch?.code || ''}
          disabled
          readOnly
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="رقم الهاتف"
          icon={Phone}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Select
          label="حالة التشغيل"
          options={STATUS_OPTIONS}
          required
          error={errors.status?.message}
          {...register('status')}
        />
      </div>

      <Input
        label="العنوان بالتفصيل"
        icon={MapPin}
        error={errors.address?.message}
        {...register('address')}
      />

      <div className="flex items-center gap-2 p-3 bg-bg-surface-elevated rounded-md border border-border-subtle w-fit">
        <input
          type="checkbox"
          id="isMainDetail"
          className="w-4 h-4 rounded border-border-default text-brand-primary focus:ring-brand-primary cursor-pointer"
          {...register('isMain')}
        />
        <label
          htmlFor="isMainDetail"
          className="text-xs font-semibold text-txt-primary cursor-pointer flex items-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-brand-primary" />
          <span>الفرع الرئيسي</span>
        </label>
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-border-subtle">
        <PermissionGate permission="branches.manage">
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            حفظ البيانات العامة
          </Button>
        </PermissionGate>
      </div>
    </form>
  );
};
