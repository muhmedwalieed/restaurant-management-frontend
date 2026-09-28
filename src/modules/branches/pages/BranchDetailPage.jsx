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
import { BranchUsersPanel } from '../../multi-branch/components/BranchUsersPanel.jsx';
import { BranchDetailHeader } from '../components/detail/BranchDetailHeader.jsx';
import { BranchGeneralInfoTab } from '../components/detail/BranchGeneralInfoTab.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import {
  Building2,
  Clock,
  Sliders,
  AlertCircle,
  Users,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { branchFormSchema } from '../components/BranchFormModal.jsx';

export const BranchDetailPage = () => {
  const { id: branchId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [generalSuccess, setGeneralSuccess] = useAutoDismiss();
  const [generalError, setGeneralError] = useState(null);

  const { data: branch, isLoading: isBranchLoading, isError, error, refetch } = useBranchQuery(branchId);
  const updateBranchMutation = useUpdateBranchMutation();

  const { data: workingHours, isLoading: isHoursLoading } = useBranchWorkingHoursQuery(branchId);
  const updateHoursMutation = useUpdateWorkingHoursMutation();

  const { data: branchSettings, isLoading: isSettingsLoading } = useBranchSettingsQuery(branchId);
  const updateSettingsMutation = useUpdateBranchSettingsMutation();

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
        <AlertCircle className="w-6 h-6 text-status-danger mx-auto" />
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
      <BranchDetailHeader
        branch={branch}
        onBack={() => navigate('/settings/branches')}
      />

      {/* Tabs Nav */}
      <div className="flex items-center gap-2 border-b border-border-default bg-bg-surface px-4 pt-2 rounded-t-lg">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
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
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
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
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-txt-muted hover:text-txt-primary'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>إعدادات التشغيل</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-txt-muted hover:text-txt-primary'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>الموظفون</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-bg-surface border border-border-default border-t-0 rounded-b-lg p-6">
        {activeTab === 'general' && (
          <BranchGeneralInfoTab
            branch={branch}
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            onSubmit={handleGeneralSubmit}
            isLoading={updateBranchMutation.isPending}
            generalSuccess={generalSuccess}
            generalError={generalError}
          />
        )}

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

        {activeTab === 'users' && (
          <div>
            <BranchUsersPanel branchId={branchId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchDetailPage;
