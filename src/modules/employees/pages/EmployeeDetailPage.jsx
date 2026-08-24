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
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  CalendarDays,
  AlertCircle,
  Edit3,
  Key,
  LogOut,
  Trash2,
  AlertTriangle,
  ChevronRight,
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

const Card = ({ title, icon: Icon, children }) => (
  <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
    <div className="px-4 py-3 border-b border-border-default flex items-center gap-2">
      <Icon className="w-4 h-4 text-brand-primary" />
      <h3 className="text-sm font-bold text-txt-primary">{title}</h3>
    </div>
    <div className="px-4 py-2 divide-y divide-border-subtle">{children}</div>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-3">
    <span className="p-1.5 rounded-md bg-bg-base text-brand-primary shrink-0">
      <Icon className="w-4 h-4" />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-txt-muted">{label}</p>
      <p className="text-sm font-semibold text-txt-primary truncate">{value || 'غير محدد'}</p>
    </div>
  </div>
);

const QuickViewRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-3">
    <span className="flex items-center gap-2 text-xs text-txt-muted">
      <Icon className="w-4 h-4 text-brand-primary" />
      {label}
    </span>
    <span className="text-xs font-semibold text-txt-primary">{value || 'غير محدد'}</span>
  </div>
);

const formatDate = (date) => {
  if (!date) return 'غير محدد';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 'غير محدد';
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
};

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
  const [actionError, setActionError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isForceLogoutOpen, setIsForceLogoutOpen] = useState(false);

  const runAction = async (fn) => {
    setActionError(null);
    try {
      await fn();
      return true;
    } catch (err) {
      setActionError(err?.message || 'حدث خطأ أثناء تنفيذ العملية.');
      return false;
    }
  };

  const handleEdit = async (formData) => {
    const ok = await runAction(() => updateMutation.mutateAsync({ id, payload: formData }));
    if (ok) setIsEditOpen(false);
  };

  const handlePassword = async (payload) => {
    const ok = await runAction(() => changePasswordMutation.mutateAsync({ id, payload }));
    if (ok) setIsPasswordOpen(false);
  };

  const handleRole = async (payload) => {
    const ok = await runAction(() => changeRoleMutation.mutateAsync({ id, payload }));
    if (ok) setIsRoleOpen(false);
  };

  const handleDelete = async () => {
    const ok = await runAction(() => deleteMutation.mutateAsync(id));
    if (ok) {
      setIsDeleteOpen(false);
      navigate('/settings/employees');
    }
  };

  const handleForceLogout = async () => {
    const ok = await runAction(() => forceLogoutMutation.mutateAsync(id));
    if (ok) setIsForceLogoutOpen(false);
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

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <PermissionGate permission="employees.manage_roles">
          <Button
            variant="primary"
            size="sm"
            icon={LogOut}
            onClick={() => setIsForceLogoutOpen(true)}
          >
            إغلاق الجلسات
          </Button>
        </PermissionGate>

        <PermissionGate permission="employees.manage">
          <Button size="sm" variant="outline" icon={Edit3} onClick={() => setIsEditOpen(true)}>
            تعديل البيانات
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={Key}
            onClick={() => setIsPasswordOpen(true)}
          >
            تغيير كلمة المرور
          </Button>
        </PermissionGate>

        <PermissionGate permission="employees.manage_roles">
          <Button size="sm" variant="outline" icon={ShieldCheck} onClick={() => setIsRoleOpen(true)}>
            تغيير الدور
          </Button>
        </PermissionGate>

        <PermissionGate permission="employees.manage">
          <Button
            size="sm"
            variant="danger"
            icon={Trash2}
            onClick={() => setIsDeleteOpen(true)}
          >
            تعطيل الحساب
          </Button>
        </PermissionGate>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-status-danger-bg text-status-danger border border-status-danger/30 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Content: two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main details (right column) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border-default">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 focus-visible:outline-none ${
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
            <Card title="معلومات الموظف" icon={User}>
              <InfoRow icon={User} label="الاسم" value={employee?.name} />
              <InfoRow icon={Phone} label="رقم الهاتف" value={employee?.phone} />
              <InfoRow icon={Mail} label="البريد الإلكتروني" value={employee?.email} />
              <InfoRow icon={CalendarDays} label="تاريخ الإنشاء" value={formatDate(employee?.createdAt)} />
              <InfoRow icon={CalendarDays} label="آخر تحديث" value={formatDate(employee?.updatedAt)} />
            </Card>
          ) : (
            <div className="bg-bg-surface border border-border-default rounded-lg p-10 text-center">
              <p className="text-sm text-txt-muted">هذا القسم غير متاح بعد.</p>
            </div>
          )}
        </div>

        {/* Profile & quick view (left column) */}
        <div className="space-y-6">
          {/* Quick view card */}
          <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border-default">
              <h3 className="text-sm font-bold text-txt-primary">نظرة سريعة</h3>
            </div>
            <div className="px-4 py-2 divide-y divide-border-subtle">
              <QuickViewRow
                icon={ShieldCheck}
                label="الدور الوظيفي"
                value={employee?.role?.name || 'غير محدد'}
              />
              <QuickViewRow
                icon={Building2}
                label="الفرع"
                value={employee?.branch?.name || 'غير محدد'}
              />
              <QuickViewRow
                icon={CalendarDays}
                label="تاريخ الإنشاء"
                value={formatDate(employee?.createdAt)}
              />
              <QuickViewRow
                icon={CalendarDays}
                label="آخر تحديث"
                value={formatDate(employee?.updatedAt)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EmployeeFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialValues={employee}
        onSubmit={handleEdit}
        isLoading={updateMutation.isPending}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
        employee={employee}
        onSubmit={handlePassword}
        isLoading={changePasswordMutation.isPending}
      />

      {/* Change Role Modal */}
      <ChangeRoleModal
        isOpen={isRoleOpen}
        onClose={() => setIsRoleOpen(false)}
        employee={employee}
        onSubmit={handleRole}
        isLoading={changeRoleMutation.isPending}
      />

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="تأكيد تعطيل الحساب"
        size="sm"
      >
        <div className="space-y-4 text-right">
          <p className="text-xs text-txt-muted">
            هل أنت متأكد من تعطيل/حذف الحساب الخاص بـ{' '}
            <span className="font-bold text-txt-primary">{employee?.name}</span>؟
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={handleDelete}
            >
              تعطيل الحساب
            </Button>
          </div>
        </div>
      </Modal>

      {/* Force Logout Confirm Modal */}
      <Modal
        isOpen={isForceLogoutOpen}
        onClose={() => setIsForceLogoutOpen(false)}
        title="إغلاق جلسات الموظف"
        size="sm"
      >
        <div className="space-y-4 text-right">
          <p className="text-xs text-txt-muted">
            سيتم تسجيل خروج فوري من جميع الأجهزة النشطة للحساب{' '}
            <span className="font-bold text-txt-primary">{employee?.name}</span>. هل أنت متأكد؟
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button variant="outline" size="sm" onClick={() => setIsForceLogoutOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={forceLogoutMutation.isPending}
              onClick={handleForceLogout}
            >
              إغلاق الجلسات
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};