import { useState } from 'react';
import { ScrollText, Filter } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { useAuditLogsQuery } from '../hooks/useAuditLogs.js';
import { DataTable } from '../../../shared/components/DataTable.jsx';

const ACTION_LABELS = {
  ORDER_CREATED: 'إنشاء أوردر',
  ORDER_STATUS_CHANGED: 'تغيير حالة أوردر',
  ORDER_PAID: 'دفع أوردر',
  ORDER_CANCELLED: 'إلغاء أوردر',
  CHAT_ASSIGNED: 'تكليف محادثة',
  EMPLOYEE_FORCE_LOGGED_OUT: 'إنهاء جلسة موظف',
  ROLE_CREATED: 'إنشاء دور',
  ROLE_UPDATED: 'تعديل دور/صلاحيات',
  ROLE_DELETED: 'حذف دور',
  COUPON_CREATED: 'إنشاء كوبون',
  COUPON_UPDATED: 'تعديل كوبون',
  COUPON_DELETED: 'حذف كوبون',
  BRANCH_ACCESS_GRANTED: 'منح وصول لفرع',
  BRANCH_ACCESS_REVOKED: 'سحب وصول من فرع',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const AuditLogsPage = () => {
  const { hasPermission } = useAuth();
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useAuditLogsQuery({
    page,
    limit: 20,
    action: actionFilter || undefined,
    entityType: entityFilter || undefined,
  });

  if (!hasPermission('audit.view')) {
    return (
      <div className="bg-bg-surface border border-border-default rounded-lg p-6 text-sm text-txt-muted">
        مش عندك صلاحية audit.view لعرض سجل التدقيق.
      </div>
    );
  }

  const entries = data?.items || [];

  const columns = [
    {
      header: 'الإجراء',
      accessorKey: 'action',
      render: (row) => (
        <span className="text-xs font-semibold text-txt-primary">{ACTION_LABELS[row.action] || row.action}</span>
      ),
    },
    {
      header: 'الكيان',
      accessorKey: 'entityType',
      render: (row) => (
        <span className="text-xs text-txt-muted">
          {row.entityType}
          {row.entityId ? <span className="block text-[10px] dir-ltr truncate max-w-[160px]">{row.entityId}</span> : null}
        </span>
      ),
    },
    {
      header: 'المنفذ',
      accessorKey: 'actor',
      render: (row) => (
        <span className="text-xs text-txt-primary">
          {row.actor?.name || <span className="text-txt-muted">النظام / عام</span>}
        </span>
      ),
    },
    {
      header: 'التفاصيل',
      accessorKey: 'metadata',
      render: (row) =>
        row.metadata ? (
          <span className="text-[11px] text-txt-muted dir-ltr truncate max-w-[220px]" title={JSON.stringify(row.metadata)}>
            {JSON.stringify(row.metadata)}
          </span>
        ) : (
          <span className="text-txt-muted">—</span>
        ),
    },
    {
      header: 'الوقت',
      accessorKey: 'createdAt',
      width: '150px',
      render: (row) => <span className="text-xs text-txt-muted">{formatDate(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-brand-primary" />
            <span>سجل التدقيق (Audit Logs)</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">سجل append-only لكل الأحداث الحساسة — الأوردرات، الصلاحيات، الكوبونات، الجلسات</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={entries}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        filters={
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-[10px] text-txt-muted">
              <Filter className="w-3 h-3" />
            </span>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="bg-bg-base border border-border-default rounded-md text-xs px-3 py-2 text-txt-primary focus-visible:outline-none focus-visible:border-brand-primary"
            >
              <option value="">كل الإجراءات</option>
              {Object.entries(ACTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              className="bg-bg-base border border-border-default rounded-md text-xs px-3 py-2 text-txt-primary focus-visible:outline-none focus-visible:border-brand-primary"
            >
              <option value="">كل الكيانات</option>
              <option value="order">أوردر</option>
              <option value="employee">موظف</option>
              <option value="role">دور/صلاحية</option>
              <option value="coupon">كوبون</option>
              <option value="conversation">محادثة</option>
            </select>
          </div>
        }
        emptyTitle="لا توجد أحداث مسجلة"
        emptyDescription="الأحداث الحساسة هتتسجل هنا تلقائيًا (إلغاء أوردر، إنهاء جلسة، تغيير صلاحيات...)."
        pagination={{
          page,
          totalPages: data?.pagination?.totalPages || 1,
          total: data?.pagination?.total,
          onPageChange: setPage,
        }}
      />
    </div>
  );
};

export default AuditLogsPage;