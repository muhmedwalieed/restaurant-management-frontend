
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { useRolesQuery } from '../../roles/hooks/useRoles.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { User, Mail, Phone, Lock } from 'lucide-react';

export const employeeFormSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن لا يقل عن حرفين'),
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('صيغة البريد الإلكتروني غير صحيحة'),
  phone: z.string().optional(),
  roleId: z.string().min(1, 'يرجى اختيار دور الموظف'),
  branchId: z.string().min(1, 'يرجى اختيار الفرع'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
  password: z.string().optional(),
});

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'نشط' },
  { value: 'INACTIVE', label: 'معطل' },
  { value: 'SUSPENDED', label: 'موقوف' },
];

export const EmployeeFormModal = ({
  isOpen,
  onClose,
  initialValues = null,
  onSubmit,
  isLoading = false,
}) => {
  const isEdit = Boolean(initialValues?.id);
  const { data: rolesData } = useRolesQuery({ limit: 100 });
  const { branches } = useBranch();

  const rolesList = rolesData?.items || (Array.isArray(rolesData) ? rolesData : []);
  const roleOptions = rolesList.map((role) => ({
    value: role.id,
    label: role.name,
  }));
  const branchOptions = (branches || []).map((b) => ({ value: b.id, label: b.name }));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      roleId: '',
      branchId: '',
      status: 'ACTIVE',
      password: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      const roleId = initialValues?.roleId || initialValues?.role?.id || '';
      reset({
        name: initialValues?.name || '',
        email: initialValues?.email || '',
        phone: initialValues?.phone || '',
        roleId,
        branchId: initialValues?.branchId || initialValues?.branch?.id || '',
        status: initialValues?.status || 'ACTIVE',
        password: '',
      });
    }
  }, [isOpen, initialValues, reset]);

  const handleFormSubmit = (data) => {
    const payload = { ...data };
    if (isEdit && !payload.password) {
      delete payload.password;
    }
    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
      subtitle={isEdit ? `تعديل بيانات الحساب لـ ${initialValues?.name}` : 'ادخل بيانات الحساب والدور الوظيفي للموظف'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-right" noValidate>
        <Input
          label="اسم الموظف بالكامل"
          placeholder="مثال: محمد علي"
          icon={User}
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="البريد الإلكتروني"
          type="email"
          placeholder="employee@restaurant.com"
          icon={Mail}
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="رقم الهاتف"
          type="tel"
          placeholder="01012345678"
          icon={Phone}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="الدور الوظيفي والصلاحية"
            options={roleOptions}
            required
            error={errors.roleId?.message}
            {...register('roleId')}
          />

          <Select
            label="الفرع"
            options={branchOptions}
            required
            error={errors.branchId?.message}
            {...register('branchId')}
          />
        </div>

        <Select
          label="الحالة"
          options={STATUS_OPTIONS}
          required
          error={errors.status?.message}
          {...register('status')}
        />

        {!isEdit && (
          <Input
            label="كلمة المرور الابتدائية"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            required
            error={errors.password?.message}
            {...register('password')}
          />
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-subtle">
          <Button variant="outline" size="md" onClick={onClose} isDisabled={isLoading}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            {isEdit ? 'حفظ التعديلات' : 'إضافة الموظف'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
