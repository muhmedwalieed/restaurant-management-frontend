import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/Button.jsx';
import { PermissionGate } from '../../../../shared/components/PermissionGate.jsx';
import {
  ChevronRight,
  Edit3,
  Key,
  LogOut,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

export const EmployeeDetailHeader = ({
  employee,
  status,
  onOpenForceLogout,
  onOpenEdit,
  onOpenPassword,
  onOpenRole,
  onOpenDelete,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/settings/employees')}
          icon={ChevronRight}
        >
          العودة للموظفين
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold text-txt-primary">{employee?.name || 'ملف الموظف'}</h1>
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-bg-surface-elevated text-brand-primary border border-border-subtle">
            {employee?.role?.name || 'غير محدد'}
          </span>
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
              status.label === 'نشط'
                ? 'bg-status-success-bg text-status-success border border-status-success/20'
                : 'bg-status-neutral-bg text-status-neutral border border-status-neutral/20'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PermissionGate permission="employees.manage">
          <Button
            variant="primary"
            size="sm"
            icon={LogOut}
            onClick={onOpenForceLogout}
          >
            إغلاق الجلسات
          </Button>
        </PermissionGate>

        <PermissionGate permission="employees.manage">
          <Button size="sm" variant="outline" icon={Edit3} onClick={onOpenEdit}>
            تعديل البيانات
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={Key}
            onClick={onOpenPassword}
          >
            تغيير كلمة المرور
          </Button>
        </PermissionGate>

        <PermissionGate permission="employees.manage_roles">
          <Button size="sm" variant="outline" icon={ShieldCheck} onClick={onOpenRole}>
            تغيير الدور
          </Button>
        </PermissionGate>

        <PermissionGate permission="employees.manage">
          <Button
            size="sm"
            variant="danger"
            icon={Trash2}
            onClick={onOpenDelete}
          >
            تعطيل الحساب
          </Button>
        </PermissionGate>
      </div>
    </div>
  );
};
