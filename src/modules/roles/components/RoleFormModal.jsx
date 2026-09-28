import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { usePermissionsCatalogQuery } from '../hooks/useRoles.js';
import {
  getLocalizedModuleTitle,
  getLocalizedPermissionName,
} from '../schemas/permissions.dict.js';
import { RolePermissionModuleCard } from './permissions/RolePermissionModuleCard.jsx';
import { ShieldCheck, Loader2, Search, CheckSquare, Square } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
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
      setSearchQuery('');
      if (initialValues) {
        reset({
          name: initialValues.name || '',
          description: initialValues.description || '',
        });

        setSelectedPermissions(
          (initialValues.permissions || [])
            .map((p) => (typeof p === 'string' ? p : p.permission?.key ?? p.key))
            .filter(Boolean)
        );
      } else {
        reset({
          name: '',
          description: '',
        });
        setSelectedPermissions([]);
      }
    }
  }, [isOpen, initialValues, reset]);

  const allPermissionKeys = permissionGroups.flatMap((g) => (g.permissions || []).map((p) => p.key));

  const togglePermission = (key) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const isAllGlobalSelected =
    allPermissionKeys.length > 0 &&
    allPermissionKeys.every((k) => selectedPermissions.includes(k));

  const handleToggleGlobalAll = () => {
    if (isAllGlobalSelected) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(allPermissionKeys);
    }
  };

  const handleToggleModuleGroup = (groupPermissions) => {
    const groupKeys = groupPermissions.map((p) => p.key);
    const isGroupAllSelected = groupKeys.every((k) => selectedPermissions.includes(k));

    if (isGroupAllSelected) {
      setSelectedPermissions((prev) => prev.filter((k) => !groupKeys.includes(k)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...groupKeys])));
    }
  };

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      permissions: selectedPermissions,
    });
  };

  const filteredGroups = permissionGroups
    .map((group) => {
      const localizedModule = getLocalizedModuleTitle(group.module);
      const matchingPermissions = (group.permissions || []).filter((p) => {
        const localizedName = getLocalizedPermissionName(p.key, p.name);
        const searchLower = searchQuery.toLowerCase().trim();
        return (
          !searchQuery ||
          localizedName.toLowerCase().includes(searchLower) ||
          p.key.toLowerCase().includes(searchLower) ||
          localizedModule.toLowerCase().includes(searchLower) ||
          (p.name && p.name.toLowerCase().includes(searchLower))
        );
      });
      return { ...group, localizedModule, matchingPermissions };
    })
    .filter((g) => g.matchingPermissions.length > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'تعديل الدور والصلاحيات' : 'إنشاء دور وظيفي جديد'}
      subtitle="تحديد مصفوفة الصلاحيات المتاحة لهذا المسمى الحسابي"
      size="xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 text-right" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-bg-base/40 p-3.5 rounded-xl border border-border-subtle">
          <Input
            label="اسم الدور الوظيفي"
            placeholder="مثال: كاشير، مشرف صالة..."
            required
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="الوصف المختصر"
            placeholder="وصف مسؤوليات ونطاق عمل هذا الدور..."
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border-default">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
              <h4 className="text-xs font-bold text-txt-primary">
                مصفوفة الصلاحيات المتاحة ({selectedPermissions.length} / {allPermissionKeys.length} محدد)
              </h4>
            </div>

            {!isCatalogLoading && allPermissionKeys.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleGlobalAll}
                  className="text-xs text-brand-primary hover:underline font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-primary/10 border border-brand-primary/20 transition-colors cursor-pointer"
                >
                  {isAllGlobalSelected ? (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>إلغاء تحديد الكل</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>تحديد كافة الصلاحيات</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {!isCatalogLoading && permissionGroups.length > 0 && (
            <div className="relative">
              <Search className="w-4 h-4 text-txt-muted absolute right-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الصلاحيات (مثال: طاولات، دفع، إلغاء)..."
                className="w-full bg-bg-base border border-border-default rounded-lg text-xs py-2 pr-10 pl-3 text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-brand-primary"
              />
            </div>
          )}

          {isCatalogLoading ? (
            <div className="flex items-center justify-center gap-2 text-xs text-txt-muted py-8">
              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
              <span>جاري تحميل كتالوج الصلاحيات...</span>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-6 bg-bg-base/40 rounded-xl border border-border-subtle">
              <p className="text-xs text-txt-muted">لم يتم العثور على صلاحيات تطابق البحث «{searchQuery}».</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
              {filteredGroups.map((group) => (
                <RolePermissionModuleCard
                  key={group.module}
                  group={group}
                  selectedPermissions={selectedPermissions}
                  onTogglePermission={togglePermission}
                  onToggleGroup={handleToggleModuleGroup}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-default">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {isEdit ? 'حفظ التعديلات' : 'إنشاء الدور'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
