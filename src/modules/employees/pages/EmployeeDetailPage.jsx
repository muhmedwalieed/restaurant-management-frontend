import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useEmployeeQuery,
  useUpdateEmployeeMutation,
  useChangePasswordMutation,
  useChangeRoleMutation,
  useDeleteEmployeeMutation,
  useForceLogoutEmployeeMutation,
} from '../hooks/useEmployees.js';
import { EmployeeFormModal } from '../components/EmployeeFormModal.jsx';
import { ChangePasswordModal } from '../components/ChangePasswordModal.jsx';
import { ChangeRoleModal } from '../components/ChangeRoleModal.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Modal } from '../../../shared/components/Modal.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { EmployeeDetailHeader } from '../components/detail/EmployeeDetailHeader.jsx';
import { EmployeeBasicInfoTab } from '../components/detail/EmployeeBasicInfoTab.jsx';
import { EmployeeQuickViewCard } from '../components/detail/EmployeeQuickViewCard.jsx';
import {
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  Activity,
} from 'lucide-react';

const STATUS_DOT = {
  ACTIVE: { dot: 'bg-status-success', label: 'نشط' },
  INACTIVE: { dot: 'bg-status-neutral', label: 'معطل' },
  SUSPENDED: { dot: 'bg-status-danger', label: 'موقوف' },
};

const TABS = [
  { key: 'basic', label: 'البيانات الأساسية', icon: Info },
  { key: 'permissions', label: 'الصلاحيات', icon: ShieldCheck },
  { key: 'sessions', label: 'الجلسات', icon: Clock },
  { key: 'activity', label: 'سجل النشاط', icon: Activity },
];

export const EmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: employee, isLoading, isError, error, refetch } = useEmployeeQuery(id);
  const updateMutation = useUpdateEmployeeMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const changeRoleMutation = useChangeRoleMutation();
  const deleteMutation = useDeleteEmployeeMutation();
  const forceLogoutMutation = useForceLogoutEmployeeMutation();

  const [activeTab, setActiveTab] = useState('basic');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isForceLogoutOpen, setIsForceLogoutOpen] = useState(false);
  const [actionError, setActionError] = useState(null);

  const handleAction = async (actionFn, onSuccess) => {
    setActionError(null);
    try {
      await actionFn();
      if (onSuccess) onSuccess();
    } catch (err) {
      setActionError(err?.message || 'حدث خطأ أثناء تنفيذ الإجراء.');
    }
  };

  const handleDelete = () => {
    handleAction(
      () => deleteMutation.mutateAsync(id),
      () => navigate('/settings/employees')
    );
  };

  const handleForceLogout = () => {
    handleAction(
      () => forceLogoutMutation.mutateAsync(id),
      () => setIsForceLogoutOpen(false)
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton height={44} className="w-1/2" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LoadingSkeleton height={400} className="lg:col-span-2 w-full" />
          <LoadingSkeleton height={300} className="w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-status-danger-bg border border-status-danger/30 rounded-lg p-6 text-center space-y-3">
        <AlertCircle className="w-6 h-6 text-status-danger mx-auto" />
        <h3 className="text-base font-bold text-txt-primary">فشل في تحميل بيانات الموظف</h3>
        <p className="text-xs text-txt-muted">{error?.message || 'تعذر التواصل مع الخادم.'}</p>
        <Button size="sm" variant="outline" onClick={refetch}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  const status = STATUS_DOT[employee?.status] || STATUS_DOT.INACTIVE;

  return (
    <div className="space-y-6">
      {/* Header */}
      <EmployeeDetailHeader
        employee={employee}
        status={status}
        onOpenForceLogout={() => setIsForceLogoutOpen(true)}
        onOpenEdit={() => setIsEditOpen(true)}
        onOpenPassword={() => setIsPasswordOpen(true)}
        onOpenRole={() => setIsRoleOpen(true)}
        onOpenDelete={() => setIsDeleteOpen(true)}
      />

      {actionError && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-status-danger-bg text-status-danger border border-status-danger/30 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-1 border-b border-border-default">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 focus-visible:outline-none cursor-pointer ${
                    isActive
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-txt-muted hover:text-txt-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === 'basic' ? (
            <EmployeeBasicInfoTab employee={employee} />
          ) : (
            <div className="bg-bg-surface border border-border-default rounded-lg p-10 text-center">
              <p className="text-sm text-txt-muted">هذا القسم قيد التوسعة في الإصدار القادم.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <EmployeeQuickViewCard employee={employee} statusLabel={status.label} />
        </div>
      </div>

      {/* Modals */}
      <EmployeeFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialValues={employee}
        onSubmit={async (data) => {
          await updateMutation.mutateAsync({ id, ...data });
          setIsEditOpen(false);
        }}
        isLoading={updateMutation.isPending}
      />

      <ChangePasswordModal
        isOpen={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
        employeeId={id}
        onSubmit={async (data) => {
          await changePasswordMutation.mutateAsync({ id, ...data });
          setIsPasswordOpen(false);
        }}
        isLoading={changePasswordMutation.isPending}
      />

      <ChangeRoleModal
        isOpen={isRoleOpen}
        onClose={() => setIsRoleOpen(false)}
        employee={employee}
        onSubmit={async (roleId) => {
          await changeRoleMutation.mutateAsync({ id, roleId });
          setIsRoleOpen(false);
        }}
        isLoading={changeRoleMutation.isPending}
      />

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="تعطيل حساب الموظف"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-txt-muted">
            هل أنت متأكد من رغبتك في تعطيل حساب الموظف <strong className="text-txt-primary">{employee?.name}</strong>؟ لن يتمكن من تسجيل الدخول للنظام مجددًا.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              تأكيد التعطيل
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isForceLogoutOpen}
        onClose={() => setIsForceLogoutOpen(false)}
        title="إنهاء جميع الجلسات النشطة"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-txt-muted">
            سيتم تسجيل خروج الموظف <strong className="text-txt-primary">{employee?.name}</strong> من جميع الأجهزة المتصلة فورًا وسيتعين عليه إعادة تسجيل الدخول.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsForceLogoutOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleForceLogout}
              isLoading={forceLogoutMutation.isPending}
            >
              إنهاء الجلسات
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
