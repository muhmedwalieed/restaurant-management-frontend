/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { usePermissionsCatalogQuery } from '../hooks/useRoles.js';
import { ShieldCheck, Loader2 } from 'lucide-react';

export const roleFormSchema = z.object({
  name: z.string().min(2, 'اسم الدور الوظيفي يجب أن لا يقل عن حرفين'),
  description: z.string().optional(),
});

export const RoleFormModal = ({
  isOpen,
  onClose,
  initialValues = null,
  onSubmit,
  isLoading = false,
}) => {
  const isEdit = Boolean(initialValues?.id);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const { data: catalog, isLoading: isCatalogLoading } = usePermissionsCatalogQuery();

  const permissionGroups = catalog || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        reset({
          name: initialValues.name || '',
          description: initialValues.description || '',
        });
        setSelectedPermissions((initialValues.permissions || []).map((p) =>
          typeof p === 'string' ? p : p.key
        ));
      } else {
        reset({
          name: '',
          description: '',
        });
        setSelectedPermissions([]);
      }
    }
  }, [isOpen, initialValues, reset]);

  const togglePermission = (key) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      permissions: selectedPermissions,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'تعديل الدور والصلاحيات' : 'إنشاء دور وظيفي جديد'}
      subtitle="تحديد مصفوفة الصلاحيات المتاحة لهذا المسمى الحسابي"
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 text-right" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="اسم الدور الوظيفي"
            placeholder="مثال: مشرف صالة"
            required
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="الوصف المختصر"
            placeholder="وصف مسؤوليات هذا الدور..."
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        {/* Permission Matrix */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold text-txt-primary flex items-center gap-1.5 border-b border-border-default pb-2">
            <ShieldCheck className="w-4 h-4 text-brand-primary" />
            <span>مصفوفة الصلاحيات المتاحة (Permissions Matrix)</span>
          </h4>

          {isCatalogLoading ? (
            <div className="flex items-center gap-2 text-xs text-txt-muted py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري تحميل كتالوج الصلاحيات...</span>
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {permissionGroups.map((group, idx) => (
              <div
                key={idx}
                className="bg-bg-base border border-border-subtle rounded-md p-3 space-y-2"
              >
                <span className="text-xs font-bold text-brand-primary block">
                  {group.module}
                </span>
                <div className="space-y-1.5">
                  {group.permissions.map((p) => {
                    const isChecked = selectedPermissions.includes(p.key);
                    return (
                      <label
                        key={p.key}
                        className="flex items-center gap-2 text-xs text-txt-primary cursor-pointer select-none hover:text-brand-primary transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(p.key)}
                          className="w-4 h-4 rounded border-border-default bg-bg-surface text-brand-primary focus:ring-brand-primary"
                        />
                        <span>{p.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-subtle">
          <Button variant="outline" size="md" onClick={onClose} isDisabled={isLoading}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            {isEdit ? 'حفظ الصلاحيات' : 'إنشاء الدور'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
