import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '../hooks/useNotifications.js';
import { Button } from '../../../shared/components/Button.jsx';
import { DataTable } from '../../../shared/components/DataTable.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { Toggle } from '../../../shared/components/Toggle.jsx';

const NOTIFICATION_TYPES = [
  { value: 'ORDER_CREATED', label: 'أوردر جديد' },
  { value: 'ORDER_STATUS_CHANGED', label: 'تغيير حالة أوردر' },
  { value: 'ORDER_PAID', label: 'دفع أوردر' },
  { value: 'CHAT_ASSIGNED', label: 'تكليف محادثة' },
  { value: 'CHAT_MESSAGE', label: 'رسالة محادثة' },
  { value: 'SYSTEM', label: 'إشعارات النظام' },
];

const formatDate = (iso) => {
  if (!iso) return 'غير محدد';
  const d = new Date(iso);
  return d.toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const NotificationsPage = () => {
  const { hasPermission } = useAuth();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);

  const listQuery = useNotificationsQuery({ page, limit: 20, unreadOnly: unreadOnly || undefined });
  const unreadQuery = useUnreadCountQuery();
  const preferencesQuery = useNotificationPreferencesQuery();
  const markRead = useMarkNotificationReadMutation();
  const markAllRead = useMarkAllNotificationsReadMutation();
  const updatePrefs = useUpdateNotificationPreferencesMutation();

  if (!hasPermission('notifications.view')) {
    return (
      <div className="bg-bg-surface border border-border-default rounded-lg p-6 text-sm text-txt-muted">
        مش عندك صلاحية notifications.view لعرض الإشعارات.
      </div>
    );
  }

  const notifications = listQuery.data?.items || [];
  const disabledTypes = preferencesQuery.data?.disabledTypes || [];

  const toggleType = (type) => {
    const next = disabledTypes.includes(type) ? disabledTypes.filter((t) => t !== type) : [...disabledTypes, type];
    updatePrefs.mutate({ disabledTypes: next });
  };

  const columns = [
    {
      header: 'الإشعار',
      accessorKey: 'title',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className={`text-sm ${row.isRead ? 'text-txt-muted' : 'font-bold text-txt-primary'}`}>{row.title}</span>
          {row.body && <span className="text-xs text-txt-muted">{row.body}</span>}
        </div>
      ),
    },
    {
      header: 'الحالة',
      accessorKey: 'isRead',
      width: '100px',
      render: (row) => (
        <span className={`text-xs px-2 py-1 rounded-full ${row.isRead ? 'bg-bg-surface-elevated text-txt-muted' : 'bg-brand-primary/10 text-brand-primary font-bold'}`}>
          {row.isRead ? 'مقروء' : 'جديد'}
        </span>
      ),
    },
    {
      header: 'الوقت',
      accessorKey: 'createdAt',
      width: '140px',
      render: (row) => <span className="text-xs text-txt-muted">{formatDate(row.createdAt)}</span>,
    },
    {
      header: 'إجراء',
      key: 'actions',
      width: '110px',
      render: (row) =>
        !row.isRead ? (
          <Button size="sm" variant="ghost" onClick={() => markRead.mutate(row.id)}>
            تحديد كمقروء
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-primary" />
            <span>الإشعارات</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            {unreadQuery.data?.count ?? 0} إشعار غير مقروء، تنبيهات الطلبات والمحادثات
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setUnreadOnly(!unreadOnly)}>
            {unreadOnly ? 'كل الإشعارات' : 'غير المقروء فقط'}
          </Button>
          <Button variant="primary" size="sm" icon={CheckCheck} onClick={() => markAllRead.mutate()}>
            تحديد الكل كمقروء
          </Button>
        </div>
      </div>

      {}
      <section className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-bold text-txt-primary">تفضيلات الإشعارات</h2>
        {preferencesQuery.isLoading ? (
          <LoadingSkeleton height={40} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {NOTIFICATION_TYPES.map((t) => (
              <div key={t.value} className="flex items-center justify-between px-3 py-2 rounded-md border border-border-default">
                <span className="text-xs text-txt-primary">{t.label}</span>
                <Toggle checked={!disabledTypes.includes(t.value)} onChange={() => toggleType(t.value)} label={`تفعيل ${t.label}`} />
              </div>
            ))}
          </div>
        )}
      </section>

      <DataTable
        columns={columns}
        data={notifications}
        isLoading={listQuery.isLoading}
        isError={listQuery.isError}
        error={listQuery.error}
        onRetry={listQuery.refetch}
        emptyTitle={unreadOnly ? 'مفيش إشعارات غير مقروءة' : 'مفيش إشعارات'}
        emptyDescription="لما يحصل أوردر جديد أو تكليف محادثة، هيوصلك إشعار هنا."
        pagination={{
          page,
          totalPages: listQuery.data?.pagination?.totalPages || 1,
          total: listQuery.data?.pagination?.total,
          onPageChange: setPage,
        }}
      />
    </div>
  );
};

export default NotificationsPage;
