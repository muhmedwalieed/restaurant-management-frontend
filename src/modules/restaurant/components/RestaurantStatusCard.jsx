import React from 'react';
import { Store } from 'lucide-react';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';

export const RestaurantStatusCard = ({
  isStatusActive,
  isLoading = false,
  onStatusToggle,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <Store className="w-5 h-5 text-brand-primary" />
            <span>إعدادات المطعم الرئيسية</span>
          </h1>
          <StatusPill status={isStatusActive ? 'success' : 'neutral'}>
            {isStatusActive ? 'نشط' : 'معطل'}
          </StatusPill>
        </div>
        <p className="text-xs text-txt-muted mt-1">
          إدارة بيانات الحساب المؤسسي الرئيسي، التوقيت، والعملة
        </p>
      </div>

      <PermissionGate permission="restaurants.manage">
        <Button
          variant={isStatusActive ? 'outline' : 'primary'}
          size="sm"
          isLoading={isLoading}
          onClick={onStatusToggle}
        >
          {isStatusActive ? 'تعطيل حساب المطعم' : 'تفعيل حساب المطعم'}
        </Button>
      </PermissionGate>
    </div>
  );
};
