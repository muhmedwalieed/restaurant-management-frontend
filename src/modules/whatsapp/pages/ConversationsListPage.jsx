import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConversationsQuery } from '../hooks/useWhatsappAutomation.js';
import { DataTable } from '../../../shared/components/DataTable.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import {
  CONVERSATION_STATUS_LABELS,
  conversationStatusPill,
  CONVERSATION_STATE_LABELS,
  CONVERSATION_STATUS_OPTIONS,
} from '../schemas/conversation.schema.js';
import { MessagesSquare, Eye, Phone } from 'lucide-react';

export const ConversationsListPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const { data: convResponse, isLoading, isError, error, refetch } = useConversationsQuery({
    page,
    limit: 20,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  const conversations = convResponse?.items || [];

  const columns = [
    {
      header: 'رقم العميل',
      accessorKey: 'customerPhone',
      render: (row) => (
        <span className="dir-ltr inline-block font-bold text-txt-primary">
          <Phone className="w-4 h-4 inline text-brand-primary ml-1" />
          {row.customerPhone}
        </span>
      ),
    },
    {
      header: 'الحالة',
      accessorKey: 'status',
      render: (row) => (
        <StatusPill status={conversationStatusPill(row.status)}>{CONVERSATION_STATUS_LABELS[row.status] || row.status}</StatusPill>
      ),
    },
    {
      header: 'مرحلة المحادثة',
      accessorKey: 'state',
      render: (row) => (
        <span className="font-semibold text-txt-primary">{CONVERSATION_STATE_LABELS[row.state] || row.state}</span>
      ),
    },
    {
      header: 'آخر رسالة',
      accessorKey: 'lastInboundAt',
      width: '140px',
      render: (row) => (
        <span className="text-txt-muted text-xs">{new Date(row.lastInboundAt).toLocaleString('ar-EG')}</span>
      ),
    },
    {
      header: 'التفاصيل',
      key: 'actions',
      render: (row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate(`/whatsapp/conversations/${row.id}`)}
          icon={Eye}
          className="text-txt-primary hover:text-brand-primary hover:bg-bg-surface-elevated"
          title="عرض تفاصيل المحادثة"
        >
          التفاصيل
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <MessagesSquare className="w-5 h-5 text-brand-primary" />
            <span>محادثات الواتساب (الروبوت)</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            محادثات الواتساب الآلية، حالتها ومرحلتها وتحويلها لموظف أو إغلاقها
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={conversations}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyTitle="لا توجد محادثات"
        emptyDescription="عند بدء العملاء محادثات واتساب، هتظهر المحادثات هنا."
        pagination={{
          page,
          totalPages: convResponse?.pagination?.totalPages || 1,
          total: convResponse?.pagination?.total,
          onPageChange: setPage,
        }}
        filters={
          <div className="w-44">
            <Select
              options={[{ value: 'ALL', label: 'جميع الحالات' }, ...CONVERSATION_STATUS_OPTIONS]}
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
              aria-label="فلترة بالحالة"
            />
          </div>
        }
        mobileCardRender={(c) => (
          <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="dir-ltr font-bold text-sm text-txt-primary">{c.customerPhone}</span>
              <StatusPill status={conversationStatusPill(c.status)}>{CONVERSATION_STATUS_LABELS[c.status] || c.status}</StatusPill>
            </div>
            <p className="text-xs text-txt-muted">
              المرحلة: <strong className="text-txt-primary">{CONVERSATION_STATE_LABELS[c.state] || c.state}</strong>
            </p>
            <p className="text-xs text-txt-muted">{new Date(c.lastInboundAt).toLocaleString('ar-EG')}</p>
            <div className="flex items-center justify-end pt-2 border-t border-border-default">
              <Button size="sm" variant="ghost" onClick={() => navigate(`/whatsapp/conversations/${c.id}`)} icon={Eye} className="text-txt-primary hover:text-brand-primary">
                التفاصيل
              </Button>
            </div>
          </div>
        )}
      />
    </div>
  );
};
