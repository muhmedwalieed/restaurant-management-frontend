import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useConnectionQuery,
  useConnectConnectionMutation,
  useUpdateConnectionMutation,
  useDisconnectConnectionMutation,
  useSendMessageMutation,
  useMessagesQuery,
  useRetryWebhooksMutation,
} from '../hooks/useWhatsapp.js';
import {
  connectConnectionSchema,
  sendMessageSchema,
  CONNECTION_STATUS_LABELS,
  connectionStatusPill,
  MESSAGE_STATUS_LABELS,
  messageStatusPill,
  PROVIDER_LABELS,
} from '../schemas/whatsapp.schema.js';
import { DataTable } from '../../../shared/components/DataTable.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import {
  MessageSquare,
  Phone,
  Link2,
  Plus,
  AlertCircle,
  CheckCircle2,
  LogOut,
  RefreshCw,
  Send,
} from 'lucide-react';

export const WhatsAppPage = () => {
  const [activeTab, setActiveTab] = useState('connection');
  const [successMsg, setSuccessMsg] = useAutoDismiss();
  const [errorMsg, setErrorMsg] = useState(null);
  const [messagesPage, setMessagesPage] = useState(1);
  const [directionFilter, setDirectionFilter] = useState('ALL');

  const { data: connection, isLoading: isConnLoading, isError: isConnError, error: connError, refetch: refetchConn } = useConnectionQuery();
  const connectMutation = useConnectConnectionMutation();
  const updateMutation = useUpdateConnectionMutation();
  const disconnectMutation = useDisconnectConnectionMutation();
  const sendMutation = useSendMessageMutation();
  const { data: messagesResponse, isLoading: isMsgLoading, refetch: refetchMsg } = useMessagesQuery({
    page: messagesPage,
    limit: 20,
    direction: directionFilter === 'ALL' ? undefined : directionFilter,
  });
  const retryMutation = useRetryWebhooksMutation();

  const noConnection = isConnError && connError?.code === 'NOT_FOUND';
  const messages = messagesResponse?.items || [];

  const {
    register: registerConnect,
    handleSubmit: handleSubmitConnect,
    reset: resetConnect,
    formState: { errors: connectErrors },
  } = useForm({
    resolver: zodResolver(connectConnectionSchema),
    defaultValues: { provider: 'MOCK', providerAccountId: '', providerPhoneNumberId: '', displayName: '', webhookSecret: '' },
  });

  const {
    register: registerSend,
    handleSubmit: handleSubmitSend,
    reset: resetSend,
    formState: { errors: sendErrors },
  } = useForm({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: { to: '', text: '' },
  });

  const runAction = async (fn) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await fn();
      return true;
    } catch (err) {
      setErrorMsg(err?.message || 'حدث خطأ أثناء تنفيذ العملية.');
      return false;
    }
  };

  const handleConnect = async (data) => {
    const ok = await runAction(() => connectMutation.mutateAsync(data));
    if (ok) {
      setSuccessMsg('تم ربط حساب الواتساب بنجاح.');
      resetConnect();
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('هل تريد فصل اتصال الواتساب؟')) return;
    const ok = await runAction(() => disconnectMutation.mutateAsync());
    if (ok) setSuccessMsg('تم فصل الاتصال.');
  };

  const handleReconnect = async () => {
    const ok = await runAction(() => updateMutation.mutateAsync({ status: 'ACTIVE' }));
    if (ok) setSuccessMsg('تم إعادة تفعيل الاتصال.');
  };

  const handleSend = async (data) => {
    const ok = await runAction(() => sendMutation.mutateAsync(data));
    if (ok) {
      setSuccessMsg('تم إرسال الرسالة.');
      resetSend();
    }
  };

  const handleRetry = async () => {
    const ok = await runAction(() => retryMutation.mutateAsync());
    if (ok) setSuccessMsg('تمت إعادة معالجة الأحداث الفاشلة.');
  };

  const messageColumns = [
    {
      header: 'الاتجاه',
      accessorKey: 'direction',
      width: '100px',
      render: (row) => (
        <span className={`font-bold ${row.direction === 'INBOUND' ? 'text-brand-primary' : 'text-txt-primary'}`}>
          {row.direction === 'INBOUND' ? 'وارد' : 'صادر'}
        </span>
      ),
    },
    {
      header: 'الهاتف',
      accessorKey: 'fromPhone',
      render: (row) => (
        <span className="dir-ltr inline-block text-txt-primary">{row.direction === 'INBOUND' ? row.fromPhone : row.toPhone}</span>
      ),
    },
    {
      header: 'الرسالة',
      accessorKey: 'content',
      render: (row) => <span className="text-txt-muted truncate max-w-[260px] inline-block">{row.content || '—'}</span>,
    },
    {
      header: 'الحالة',
      accessorKey: 'status',
      render: (row) => (
        <StatusPill status={messageStatusPill(row.status)}>{MESSAGE_STATUS_LABELS[row.status] || row.status}</StatusPill>
      ),
    },
    {
      header: 'الوقت',
      accessorKey: 'createdAt',
      width: '130px',
      render: (row) => <span className="text-txt-muted text-[11px]">{new Date(row.createdAt).toLocaleString('ar-EG')}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-brand-primary" />
            <span>الواتساب والرسائل</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">ربط حساب الواتساب وإرسال الرسائل ومتابعة حالتها</p>
        </div>
        <PermissionGate permission="whatsapp.manage">
          <Button variant="outline" size="sm" icon={RefreshCw} isLoading={retryMutation.isPending} onClick={handleRetry}>
            إعادة معالجة الأحداث
          </Button>
        </PermissionGate>
      </div>

      {successMsg && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border-default bg-bg-surface px-4 pt-2 rounded-t-lg">
        {[
          { key: 'connection', label: 'الاتصال', icon: Phone },
          { key: 'messages', label: 'الرسائل', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-txt-muted hover:text-txt-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-bg-surface border border-border-default border-t-0 rounded-b-lg p-6">
        {/* Tab 1: Connection */}
        {activeTab === 'connection' && (
          <div className="max-w-2xl">
            {isConnLoading ? (
              <p className="text-sm text-txt-muted">جاري تحميل بيانات الاتصال...</p>
            ) : noConnection ? (
              <form onSubmit={handleSubmitConnect(handleConnect)} className="space-y-4">
                <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-brand-primary" />
                  ربط حساب واتساب جديد
                </h3>

                <Select
                  label="الـProvider"
                  options={[
                    { value: 'MOCK', label: 'Mock (اختباري)' },
                    { value: 'META', label: 'Meta Cloud API (إنتاج)' },
                  ]}
                  {...registerConnect('provider')}
                />

                <Input label="Account ID (WABA ID)" dir="ltr" icon={Phone} error={connectErrors.providerAccountId?.message} {...registerConnect('providerAccountId')} />
                <Input label="Phone Number ID" dir="ltr" icon={Phone} error={connectErrors.providerPhoneNumberId?.message} {...registerConnect('providerPhoneNumberId')} />
                <Input label="اسم العرض (اختياري)" icon={MessageSquare} {...registerConnect('displayName')} />
                <Input
                  label="Webhook Secret (اختياري — 16 حرفًا على الأقل)"
                  dir="ltr"
                  type="password"
                  error={connectErrors.webhookSecret?.message}
                  {...registerConnect('webhookSecret')}
                />

                <PermissionGate permission="whatsapp.manage">
                  <Button type="submit" variant="primary" size="sm" isLoading={connectMutation.isPending} icon={Plus}>
                    ربط الحساب
                  </Button>
                </PermissionGate>
              </form>
            ) : connection ? (
              <div className="space-y-4">
                <div className="bg-bg-base border border-border-default rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-txt-primary">بيانات الاتصال</h3>
                    <StatusPill status={connectionStatusPill(connection.status)}>
                      {CONNECTION_STATUS_LABELS[connection.status] || connection.status}
                    </StatusPill>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-txt-muted">
                    <p>
                      اسم العرض: <strong className="text-txt-primary">{connection.displayName || '—'}</strong>
                    </p>
                    <p>
                      الـProvider: <strong className="text-txt-primary">{PROVIDER_LABELS[connection.provider] || connection.provider}</strong>
                    </p>
                    <p className="dir-ltr">
                      Account ID: <strong className="text-txt-primary">{connection.providerAccountId}</strong>
                    </p>
                    <p className="dir-ltr">
                      Phone Number ID: <strong className="text-txt-primary">{connection.providerPhoneNumberId}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <PermissionGate permission="whatsapp.manage">
                    {connection.status === 'ACTIVE' ? (
                      <Button variant="danger" size="sm" icon={LogOut} isLoading={disconnectMutation.isPending} onClick={handleDisconnect}>
                        فصل الاتصال
                      </Button>
                    ) : (
                      <Button variant="primary" size="sm" icon={Link2} isLoading={updateMutation.isPending} onClick={handleReconnect}>
                        إعادة التفعيل
                      </Button>
                    )}
                  </PermissionGate>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-status-danger/10 border border-status-danger/30 rounded-md text-xs text-status-danger text-center">
                تعذر تحميل بيانات الاتصال.
                <Button size="sm" variant="outline" className="mr-2" onClick={() => refetchConn()}>
                  إعادة المحاولة
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Messages */}
        {activeTab === 'messages' && (
          <div className="space-y-5">
            {/* Send form */}
            <PermissionGate permission="whatsapp.manage">
              <form onSubmit={handleSubmitSend(handleSend)} className="bg-bg-base border border-border-default rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                  <Send className="w-4 h-4 text-brand-primary" />
                  إرسال رسالة
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto] gap-2 items-end">
                  <Input label="رقم المستلم" dir="ltr" icon={Phone} error={sendErrors.to?.message} {...registerSend('to')} />
                  <Input label="نص الرسالة" error={sendErrors.text?.message} {...registerSend('text')} />
                  <Button type="submit" variant="primary" size="sm" isLoading={sendMutation.isPending} icon={Send}>
                    إرسال
                  </Button>
                </div>
              </form>
            </PermissionGate>

            {/* Messages list */}
            <DataTable
              columns={messageColumns}
              data={messages}
              isLoading={isMsgLoading}
              searchQuery=""
              emptyTitle="لا توجد رسائل"
              emptyDescription="أرسل أول رسالة أو انتظر وصول رسائل العملاء."
              pagination={{
                page: messagesPage,
                totalPages: messagesResponse?.pagination?.totalPages || 1,
                total: messagesResponse?.pagination?.total,
                onPageChange: setMessagesPage,
              }}
              filters={
                <div className="w-44">
                  <Select
                    options={[
                      { value: 'ALL', label: 'الكل' },
                      { value: 'INBOUND', label: 'وارد' },
                      { value: 'OUTBOUND', label: 'صادر' },
                    ]}
                    value={directionFilter}
                    onChange={(e) => {
                      setMessagesPage(1);
                      setDirectionFilter(e.target.value);
                    }}
                    aria-label="فلترة بالاتجاه"
                  />
                </div>
              }
              onRetry={() => refetchMsg()}
            />
          </div>
        )}
      </div>
    </div>
  );
};