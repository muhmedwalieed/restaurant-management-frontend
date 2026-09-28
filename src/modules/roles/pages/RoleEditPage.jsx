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
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import { RoleBasicInfoCard } from '../components/permissions/RoleBasicInfoCard.jsx';
import { RolePermissionsFilterBar } from '../components/permissions/RolePermissionsFilterBar.jsx';
import { RolePermissionModuleCard } from '../components/permissions/RolePermissionModuleCard.jsx';
import {
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Save,
  RotateCcw,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-default">
        <div className="space-y-1">
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
            disabled={isSavePending}
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

      {/* Notifications */}
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

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <RoleBasicInfoCard
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          nameError={nameError}
          setNameError={setNameError}
          isSystem={currentRole?.isSystem}
          selectedCount={selectedPermissions.length}
          totalCount={allPermissionKeys.length}
          isAllSelected={isAllGlobalSelected}
          onToggleAll={handleToggleGlobalAll}
        />

        <div className="lg:col-span-2 space-y-5">
          <RolePermissionsFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryTabs={categoryTabs}
            activeCategoryTab={activeCategoryTab}
            onCategoryTabChange={setActiveCategoryTab}
          />

          {filteredGroups.length === 0 ? (
            <div className="bg-bg-surface border border-border-default rounded-xl p-8 text-center space-y-2">
              <p className="text-xs text-txt-muted">لم يتم العثور على صلاحيات تطابق خيارات البحث.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredGroups.map((group) => (
                <RolePermissionModuleCard
                  key={group.module}
                  group={group}
                  selectedPermissions={selectedPermissions}
                  isDisabled={currentRole?.isSystem}
                  onTogglePermission={togglePermission}
                  onToggleGroup={handleToggleModuleGroup}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </form>
  );
};
