import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useRolesQuery,
  usePermissionsCatalogQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from '../hooks/useRoles.js';
import {
  getLocalizedModuleTitle,
  getLocalizedPermissionName,
} from '../schemas/permissions.dict.js';
import { Button } from '../../../shared/components/Button.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import {
  ShieldCheck,
  ChevronRight,
  Search,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle2,
  Save,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

export const RoleEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState('ALL');

  const [actionSuccess, setActionSuccess] = useAutoDismiss();
  const [actionError, setActionError] = useState(null);

  const { data: rolesData, isLoading: isRolesLoading, isError, error, refetch } = useRolesQuery({ limit: 100 });
  const { data: catalog, isLoading: isCatalogLoading } = usePermissionsCatalogQuery();

  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();

  const rolesList = useMemo(
    () => rolesData?.items || (Array.isArray(rolesData) ? rolesData : []),
    [rolesData]
  );
  const currentRole = useMemo(() => {
    if (!isEdit) return null;
    return rolesList.find((r) => String(r.id) === String(id));
  }, [isEdit, rolesList, id]);

  const permissionGroups = useMemo(() => catalog || [], [catalog]);
  const allPermissionKeys = useMemo(
    () => permissionGroups.flatMap((g) => (g.permissions || []).map((p) => p.key)),
    [permissionGroups]
  );

  useEffect(() => {
    if (isEdit && currentRole) {
      setName(currentRole.name || '');
      setDescription(currentRole.description || '');

      setSelectedPermissions(
        (currentRole.permissions || [])
          .map((p) => (typeof p === 'string' ? p : p.permission?.key ?? p.key))
          .filter(Boolean)
      );
    } else if (!isEdit) {
      setName('');
      setDescription('');
      setSelectedPermissions([]);
    }
  }, [isEdit, currentRole]);

  const togglePermission = (key) => {
    if (currentRole?.isSystem) return;
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const isAllGlobalSelected =
    allPermissionKeys.length > 0 &&
    allPermissionKeys.every((k) => selectedPermissions.includes(k));

  const handleToggleGlobalAll = () => {
    if (currentRole?.isSystem) return;
    if (isAllGlobalSelected) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(allPermissionKeys);
    }
  };

  const handleToggleModuleGroup = (groupPermissions) => {
    if (currentRole?.isSystem) return;
    const groupKeys = groupPermissions.map((p) => p.key);
    const isGroupAllSelected = groupKeys.every((k) => selectedPermissions.includes(k));

    if (isGroupAllSelected) {
      setSelectedPermissions((prev) => prev.filter((k) => !groupKeys.includes(k)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...groupKeys])));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setNameError('اسم الدور الوظيفي يجب أن لا يقل عن حرفين');
      return;
    }
    setNameError(null);
    setActionError(null);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        permissions: selectedPermissions,
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id, payload });
        setActionSuccess('تم تحديث بيانات الدور والصلاحيات بنجاح.');
      } else {
        await createMutation.mutateAsync(payload);
        setActionSuccess('تم إنشاء الدور الوظيفي الجديد بنجاح.');
      }
      setTimeout(() => navigate('/settings/roles'), 800);
    } catch (err) {
      setActionError(err?.message || 'حدث خطأ أثناء حفظ الصلاحيات.');
    }
  };

  const categoryTabs = useMemo(() => {
    const tabs = [{ id: 'ALL', label: 'جميع الأقسام' }];
    permissionGroups.forEach((g) => {
      tabs.push({
        id: g.module,
        label: getLocalizedModuleTitle(g.module),
      });
    });
    return tabs;
  }, [permissionGroups]);

  const filteredGroups = useMemo(() => {
    return permissionGroups
      .map((group) => {
        const localizedModule = getLocalizedModuleTitle(group.module);
        const matchesCategory = activeCategoryTab === 'ALL' || activeCategoryTab === group.module;

        const matchingPermissions = (group.permissions || []).filter((p) => {
          if (!matchesCategory) return false;
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
  }, [permissionGroups, searchQuery, activeCategoryTab]);

  if ((isEdit && isRolesLoading) || isCatalogLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton height={48} className="w-1/3" />
        <LoadingSkeleton height={400} className="w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-status-danger-bg border border-status-danger/30 rounded-lg p-6 text-center space-y-3">
        <AlertCircle className="w-6 h-6 text-status-danger mx-auto" />
        <h3 className="text-base font-bold text-txt-primary">فشل في تحميل بيانات الأدوار</h3>
        <p className="text-xs text-txt-muted">{error?.message || 'تعذر التواصل مع الخادم.'}</p>
        <Button size="sm" variant="outline" onClick={refetch}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  const isSavePending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSave} className="space-y-6" noValidate>
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-default">
        <div className="space-y-1">
          {}
          <div className="flex items-center gap-1.5 text-xs text-txt-muted">
            <Link to="/settings/roles" className="hover:text-txt-primary transition-colors">
              الأدوار والصلاحيات
            </Link>
            <span>/</span>
            <span className="text-txt-primary font-semibold">
              {isEdit ? `تعديل دور: ${currentRole?.name || name}` : 'إنشاء دور جديد'}
            </span>
          </div>

          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-primary shrink-0" />
            <span>{isEdit ? 'تعديل الدور والصلاحيات' : 'إنشاء دور وظيفي جديد'}</span>
          </h1>
        </div>

        {}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings/roles')}
            icon={ChevronRight}
            className="text-xs"
          >
            العودة للأدوار
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings/roles')}
            icon={RotateCcw}
            className="text-xs border-white/10"
            isDisabled={isSavePending}
          >
            إلغاء
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={Save}
            isLoading={isSavePending}
            className="text-xs font-semibold px-4"
          >
            {isEdit ? 'حفظ الصلاحيات' : 'إنشاء الدور'}
          </Button>
        </div>
      </div>

      {}
      {actionSuccess && (
        <div className="p-3 rounded-lg text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3 rounded-lg text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {}
        <div className="lg:col-span-1 space-y-5 lg:sticky lg:top-4 self-start">
          {}
          <div className="bg-bg-surface border border-border-default rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-2.5">
              <SlidersHorizontal className="w-4 h-4 text-brand-primary shrink-0" />
              <h3 className="text-xs font-bold text-txt-primary">بيانات الدور الأساسية</h3>
            </div>

            <div className="space-y-3.5">
              <Input
                label="اسم الدور الوظيفي"
                placeholder="مثال: كاشير، مشرف صالة..."
                required
                disabled={currentRole?.isSystem}
                error={nameError}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(null);
                }}
              />

              <Input
                label="الوصف المختصر"
                placeholder="وصف مسؤوليات ونطاق هذا الدور..."
                disabled={currentRole?.isSystem}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {}
          <div className="bg-bg-surface border border-border-default rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
              <h3 className="text-xs font-bold text-txt-primary">ملخص الصلاحيات الممنوحة</h3>
              {currentRole?.isSystem ? (
                <StatusPill status="info" className="text-xs py-0.5 px-2">
                  دور نظام
                </StatusPill>
              ) : (
                <StatusPill status="success" className="text-xs py-0.5 px-2">
                  دور مخصص
                </StatusPill>
              )}
            </div>

            {}
            <div className="bg-bg-base/60 border border-border-subtle rounded-xl p-4 text-center space-y-1">
              <div className="text-2xl font-bold font-mono text-brand-primary tabular-nums">
                {selectedPermissions.length} <span className="text-sm text-txt-muted font-sans font-normal">/ {allPermissionKeys.length}</span>
              </div>
              <p className="text-xs text-txt-muted">صلاحية مفعّلة لهذا المسمى الوظيفي</p>
            </div>

            {}
            {!currentRole?.isSystem && (
              <div className="space-y-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleToggleGlobalAll}
                  className="w-full text-xs font-medium justify-center border-white/10 hover:bg-white/[0.05]"
                >
                  {isAllGlobalSelected ? (
                    <>
                      <Square className="w-3.5 h-3.5 shrink-0" />
                      <span>إلغاء تحديد كل الصلاحيات</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                      <span>منح كافة الصلاحيات ({allPermissionKeys.length})</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="lg:col-span-2 space-y-5">
          {}
          <div className="bg-bg-surface border border-border-default rounded-xl p-4 space-y-3.5 shadow-sm">
            {}
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

            {}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {categoryTabs.map((tab) => {
                const isSelected = activeCategoryTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategoryTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-brand-primary text-slate-950 shadow-sm'
                        : 'bg-bg-base text-txt-muted border border-border-subtle hover:text-txt-primary hover:border-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {}
          {filteredGroups.length === 0 ? (
            <div className="bg-bg-surface border border-border-default rounded-xl p-8 text-center space-y-2">
              <p className="text-xs text-txt-muted">لم يتم العثور على صلاحيات تطابق خيارات البحث.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredGroups.map((group) => {
                const groupKeys = group.matchingPermissions.map((p) => p.key);
                const selectedInGroup = groupKeys.filter((k) => selectedPermissions.includes(k)).length;
                const isGroupAllSelected = groupKeys.length > 0 && selectedInGroup === groupKeys.length;

                return (
                  <div
                    key={group.module}
                    className="bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-sm"
                  >
                    {}
                    <div className="px-4 py-3 bg-bg-base/60 border-b border-border-subtle flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <h3 className="text-xs font-bold text-txt-primary truncate">
                          {group.localizedModule}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-white/[0.06] text-txt-muted border border-border-subtle">
                          {selectedInGroup} / {group.matchingPermissions.length} محدد
                        </span>
                      </div>

                      {!currentRole?.isSystem && (
                        <button
                          type="button"
                          onClick={() => handleToggleModuleGroup(group.matchingPermissions)}
                          className="text-[11px] font-semibold text-brand-primary hover:underline shrink-0"
                        >
                          {isGroupAllSelected ? 'إلغاء تحديد القسم' : 'تحديد الكل في القسم'}
                        </button>
                      )}
                    </div>

                    {}
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {group.matchingPermissions.map((p) => {
                        const isChecked = selectedPermissions.includes(p.key);
                        const localizedName = getLocalizedPermissionName(p.key, p.name);

                        return (
                          <label
                            key={p.key}
                            className={`flex items-start gap-2.5 p-3 rounded-lg border transition-all select-none ${
                              currentRole?.isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                            } ${
                              isChecked
                                ? 'bg-brand-primary/10 border-brand-primary/30 text-txt-primary'
                                : 'bg-bg-base/40 border-border-subtle hover:border-white/10 text-txt-muted hover:text-txt-primary'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={currentRole?.isSystem}
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
      </div>
    </form>
  );
};
