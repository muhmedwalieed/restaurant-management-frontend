import { useEffect, useState } from 'react';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { useRolesQuery } from '../../roles/hooks/useRoles.js';
import { Shield } from 'lucide-react';

export const ChangeRoleModal = ({
  isOpen,
  onClose,
  employee,
  onSubmit,
  isLoading = false,
}) => {
  const { data: rolesData } = useRolesQuery({ limit: 100 });
  const rolesList = rolesData?.items || (Array.isArray(rolesData) ? rolesData : []);
  const roleOptions = rolesList.map((role) => ({
    value: role.id,
    label: role.name,
  }));
  const [selectedRoleId, setSelectedRoleId] = useState('');

  useEffect(() => {
    if (isOpen && employee) {
      setSelectedRoleId(employee.roleId || employee.role?.id || '');
    }
  }, [isOpen, employee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ roleId: selectedRoleId });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تغيير الدور الوظيفي"
      subtitle={`تعديل صلاحية والدور الوظيفي للموظف ${employee?.name || ''}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        <div className="flex items-center gap-2 p-3 bg-bg-base border border-border-subtle rounded-md">
          <Shield className="w-5 h-5 text-brand-primary shrink-0" />
          <div className="text-xs">
            <span className="text-txt-muted">الدور الحالي: </span>
            <span className="font-bold text-txt-primary">{employee?.role?.name || employee?.role || 'غير محدد'}</span>
          </div>
        </div>

        <Select
          label="اختر الدور الوظيفي الجديد"
          options={roleOptions}
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
          required
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-subtle">
          <Button variant="outline" size="sm" onClick={onClose} isDisabled={isLoading}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            حفظ الدور الجديد
          </Button>
        </div>
      </form>
    </Modal>
  );
};