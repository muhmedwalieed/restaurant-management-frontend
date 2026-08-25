/* eslint-disable react-refresh/only-export-components */
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
        // Backend list returns permissions as [{ permission: { key } }] (RolePermission rows).
        // Normalize to plain keys so the checkboxes render checked and the saved payload is valid.
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

  const togglePermission = (key) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const allPermissionKeys = permissionGroups.flatMap((g) =>
    (g.permissions || []).map((p) => p.key)
  );

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

  // Filter groups & permissions based on search query
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
        {/* Basic Role Information Inputs */}
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

        {/* Permission Matrix Controls Header */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border-default">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
              <h4 className="text-xs font-bold text-txt-primary">
                مصفوفة الصلاحيات المتاحة ({selectedPermissions.length} / {allPermissionKeys.length} محدد)
              </h4>
            </div>

            {/* Global Actions: Select All / Deselect All */}
            {!isCatalogLoading && allPermissionKeys.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleGlobalAll}
                  className="text-xs text-brand-primary hover:underline font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-primary/10 border border-brand-primary/20 transition-colors"
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

          {/* Quick Search Filter */}
          {!isCatalogLoading && permissionGroups.length > 0 && (
            <div className="relative">
              <Search className="w-4 h-4 text-txt-muted absolute right-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الصلاحيات (مثال: طاولات، دفع، إلغاء)..."
                className="w-full bg-bg-base border border-border-default rounded-lg text-xs py-2 pr-9 pl-3 text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-brand-primary"
              />
            </div>
          )}

          {/* Permission Matrix Grid */}
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
              {filteredGroups.map((group) => {
                const groupKeys = group.matchingPermissions.map((p) => p.key);
                const selectedInGroup = groupKeys.filter((k) => selectedPermissions.includes(k)).length;
                const isGroupAllSelected = groupKeys.length > 0 && selectedInGroup === groupKeys.length;

                return (
                  <div
                    key={group.module}
                    className="bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-sm transition-all"
                  >
                    {/* Group Sub-header */}
                    <div className="px-4 py-3 bg-bg-base/60 border-b border-border-subtle flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-bold text-txt-primary truncate">
                          {group.localizedModule}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-white/[0.06] text-txt-muted border border-border-subtle">
                          {selectedInGroup} / {group.matchingPermissions.length} محدد
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleModuleGroup(group.matchingPermissions)}
                        className="text-[11px] font-semibold text-brand-primary hover:underline flex items-center gap-1.5 shrink-0"
                      >
                        {isGroupAllSelected ? 'إلغاء تحديد القسم' : 'تحديد الكل في القسم'}
                      </button>
                    </div>

                    {/* Permissions Grid inside Group */}
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {group.matchingPermissions.map((p) => {
                        const isChecked = selectedPermissions.includes(p.key);
                        const localizedName = getLocalizedPermissionName(p.key, p.name);

                        return (
                          <label
                            key={p.key}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                              isChecked
                                ? 'bg-brand-primary/10 border-brand-primary/30 text-txt-primary'
                                : 'bg-bg-base/40 border-border-subtle hover:border-white/10 text-txt-muted hover:text-txt-primary'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(p.key)}
                              className="mt-0.5 w-4 h-4 rounded border-border-default bg-bg-surface text-brand-primary focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0"
                            />
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="font-semibold text-txt-primary leading-tight">
                                {localizedName}
                              </span>
                              <span className="font-mono text-[10px] text-txt-muted/70 tracking-wider truncate" dir="ltr">
                                {p.key}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
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
