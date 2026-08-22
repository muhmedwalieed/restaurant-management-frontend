import { useState } from 'react';
import { UserPlus, Trash2, Users } from 'lucide-react';
import { useBranchUsersQuery, useGrantBranchAccessMutation, useRevokeBranchAccessMutation } from '../hooks/useMultiBranch.js';
import { useEmployeesQuery } from '../../employees/hooks/useEmployees.js';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';

export const BranchUsersPanel = ({ branchId }) => {
  const { hasPermission } = useAuth();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [grantError, setGrantError] = useState(null);

  const { data: users, isLoading } = useBranchUsersQuery(branchId);
  const { data: employeesResponse } = useEmployeesQuery({ page: 1, limit: 100 });
  const grantMutation = useGrantBranchAccessMutation();
  const revokeMutation = useRevokeBranchAccessMutation();

  const employees = employeesResponse?.items || [];
  const currentUserIds = (users || []).map((u) => u.id);
  const grantableEmployees = employees.filter((e) => !currentUserIds.includes(e.id));

  const canManage = hasPermission('branches.manage');

  const handleGrant = async () => {
    if (!selectedEmployeeId) return;
    setGrantError(null);
    try {
      await grantMutation.mutateAsync({ branchId, employeeId: selectedEmployeeId });
      setSelectedEmployeeId('');
    } catch (err) {
      setGrantError(err?.message || 'تعذر منح الوصول للفرع');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-primary" />
          <span>موظفو الفرع</span>
        </h3>
        <p className="text-xs text-txt-muted mt-1">الموظفين القادرين على العمل في هذا الفرع (الفرع الرئيسي + المفوضين)</p>
      </div>

      {isLoading ? (
        <LoadingSkeleton height={120} />
      ) : (
        <div className="border border-border-default rounded-lg divide-y divide-border-subtle">
          {(users || []).map((u) => (
            <div key={u.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-txt-primary">{u.name}</span>
                <span className="text-[11px] text-txt-muted">
                  {u.roleName || 'بدون دور'}
                  {u.isHomeBranch && <span className="mr-1 text-brand-primary font-bold">(الفرع الرئيسي)</span>}
                </span>
              </div>
              {canManage && !u.isHomeBranch && (
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Trash2}
                  className="text-status-danger hover:text-status-danger"
                  onClick={() => revokeMutation.mutate({ branchId, employeeId: u.id })}
                >
                  سحب الوصول
                </Button>
              )}
            </div>
          ))}
          {(users || []).length === 0 && (
            <EmptyState title="لا يوجد موظفون" description="مفيش موظفين مسجلين في الفرع ده." />
          )}
        </div>
      )}

      {canManage && grantableEmployees.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="flex-1 bg-bg-base border border-border-default rounded-md text-xs px-3 py-2 text-txt-primary focus-visible:outline-none focus-visible:border-brand-primary"
          >
            <option value="">اختار موظفًا لمنحه الوصول...</option>
            {grantableEmployees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <Button size="sm" variant="primary" icon={UserPlus} onClick={handleGrant} isLoading={grantMutation.isPending}>
            منح الوصول
          </Button>
        </div>
      )}
      {grantError && <p className="text-xs text-status-danger">{grantError}</p>}
    </div>
  );
};

export default BranchUsersPanel;