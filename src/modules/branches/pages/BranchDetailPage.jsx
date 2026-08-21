import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useBranchQuery,
  useUpdateBranchMutation,
  useBranchWorkingHoursQuery,
  useUpdateWorkingHoursMutation,
  useBranchSettingsQuery,
  useUpdateBranchSettingsMutation,
} from '../hooks/useBranches.js';
import { WorkingHoursEditor } from '../components/WorkingHoursEditor.jsx';
import { BranchSettingsForm } from '../components/BranchSettingsForm.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import {
  Building2,
  Clock,
  Sliders,
  ChevronRight,
  ShieldCheck,
  BadgeCheck,
  Hash,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { branchFormSchema } from '../components/BranchFormModal.jsx';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'نشط' },
  { value: 'INACTIVE', label: 'معطل' }
];

export const BranchDetailPage = () => {
  const { id: branchId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'working-hours' | 'settings'
  const [generalSuccess, setGeneralSuccess] = useAutoDismiss();
  const [generalError, setGeneralError] = useState(null);

  // Queries & Mutations
  const { data: branch, isLoading: isBranchLoading, isError, error, refetch } = useBranchQuery(branchId);
  const updateBranchMutation = useUpdateBranchMutation();

  const { data: workingHours, isLoading: isHoursLoading } = useBranchWorkingHoursQuery(branchId);
  const updateHoursMutation = useUpdateWorkingHoursMutation();

  const { data: branchSettings, isLoading: isSettingsLoading } = useBranchSettingsQuery(branchId);
  const updateSettingsMutation = useUpdateBranchSettingsMutation();

  // General Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(branchFormSchema),
    values: {
      name: branch?.name || '',
      code: branch?.code || '',
      address: branch?.address || '',
      phone: branch?.phone || '',
      status: branch?.status || 'ACTIVE',
      isMain: Boolean(branch?.isMain),
    },
  });

  const handleGeneralSubmit = async (formData) => {
    setGeneralSuccess(null);
    setGeneralError(null);
    try {
      await updateBranchMutation.mutateAsync({ id: branchId, payload: formData });
      setGeneralSuccess('تم تحديث البيانات العامة للفرع بنجاح.');
    } catch (err) {
      setGeneralError(err?.message || 'حدث خطأ أثناء تحديث بيانات الفرع.');
    }
  };

  const handleWorkingHoursSave = async (workingHoursArray) => {
    await updateHoursMutation.mutateAsync({ branchId, workingHours: workingHoursArray });
  };

  const handleTimezoneChange = async (timezone) => {
    const current = branchSettings || {};
    await updateSettingsMutation.mutateAsync({
      branchId,
      settings: { currency: current.currency || 'EGP', timezone },
    });
  };

  const handleSettingsSave = async (settingsData) => {
    await updateSettingsMutation.mutateAsync({ branchId, settings: settingsData });
  };

  if (isBranchLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton height={48} className="w-1/3" />
        <LoadingSkeleton height={300} className="w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-status-danger-bg border border-status-danger/30 rounded-lg p-6 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-status-danger mx-auto" />
        <h3 className="text-base font-bold text-txt-primary">فشل في تحميل تفاصيل الفرع</h3>
        <p className="text-xs text-txt-muted">{error?.message || 'تعذر التواصل مع الخادم.'}</p>
        <Button size="sm" variant="outline" onClick={refetch}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section with back button */}
      <div className="flex items-center gap-3 pb-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/settings/branches')}
          icon={ChevronRight}
        >
          العودة للفروع
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-txt-primary">{branch?.name || 'تفاصيل الفرع'}</h1>
          {branch?.isMain && branch?.status === 'ACTIVE' && (
            <span title="الفرع الرئيسي — نشط" aria-label="الفرع الرئيسي — نشط">
              <BadgeCheck className="w-5 h-5 text-status-success" />
            </span>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border-default bg-bg-surface px-4 pt-2 rounded-t-lg">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-txt-muted hover:text-txt-primary'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>البيانات العامة</span>
        </button>

        <button
          onClick={() => setActiveTab('working-hours')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'working-hours'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-txt-muted hover:text-txt-primary'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>مواعيد العمل</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-txt-muted hover:text-txt-primary'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>إعدادات التشغيل</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="bg-bg-surface border border-border-default border-t-0 rounded-b-lg p-6">
        {/* Tab 1: General Info */}
        {activeTab === 'general' && (
          <form onSubmit={handleSubmit(handleGeneralSubmit)} className="space-y-6 text-right" noValidate>
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
                className="text-xs font-semibold text-txt-primary cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-brand-primary" />
                <span>الفرع الرئيسي</span>
              </label>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-border-subtle">
              <PermissionGate permission="branches.manage">
                <Button type="submit" variant="primary" size="sm" isLoading={updateBranchMutation.isPending}>
                  حفظ البيانات العامة
                </Button>
              </PermissionGate>
            </div>
          </form>
        )}

        {/* Tab 2: Working Hours */}
        {activeTab === 'working-hours' && (
          <div>
            {isHoursLoading ? (
              <LoadingSkeleton height={200} className="w-full" />
            ) : (
              <WorkingHoursEditor
                initialData={workingHours}
                onSave={handleWorkingHoursSave}
                isLoading={updateHoursMutation.isPending}
                timezone={branchSettings?.timezone || 'Africa/Cairo'}
                onTimezoneChange={handleTimezoneChange}
              />
            )}
          </div>
        )}

        {/* Tab 3: Branch Settings */}
        {activeTab === 'settings' && (
          <div>
            {isSettingsLoading ? (
              <LoadingSkeleton height={150} className="w-full" />
            ) : (
              <BranchSettingsForm
                initialData={branchSettings}
                onSave={handleSettingsSave}
                isLoading={updateSettingsMutation.isPending}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
