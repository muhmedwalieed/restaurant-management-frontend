import { useState, useEffect } from 'react';
import {
  useConnectionQuery,
  useConnectConnectionMutation,
  useUpdateConnectionMutation,
  useDisconnectConnectionMutation,
  useRetryWebhooksMutation,
} from '../hooks/useWhatsapp.js';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog.jsx';
import { WhatsAppSettingsModal } from '../components/WhatsAppSettingsModal.jsx';
import { WhatsAppTicketsView } from '../components/WhatsAppTicketsView.jsx';
import { WhatsAppConnectionTab } from '../components/WhatsAppConnectionTab.jsx';
import { WhatsAppPageHeader } from '../components/WhatsAppPageHeader.jsx';
import { TemplatesManager } from '../../templates/components/TemplatesManager.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import {
  Phone,
  AlertCircle,
  CheckCircle2,
  Tag,
  Sparkles,
} from 'lucide-react';

export const WhatsAppPage = () => {
  const { hasPermission } = useAuth();
  const canManageTemplates = Boolean(
    hasPermission?.([
      'restaurants.manage',
      'whatsapp.manage',
      'whatsapp.view',
      'chats.view',
      'chats.reply',
    ])
  );
  const canViewConnection = Boolean(hasPermission?.('whatsapp.manage'));

  const [activeTab, setActiveTab] = useState('tickets');
  const [successMsg, setSuccessMsg] = useAutoDismiss();
  const [errorMsg, setErrorMsg] = useState(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'templates' && !canManageTemplates) {
      setActiveTab('tickets');
    }
    if (activeTab === 'connection' && !canViewConnection) {
      setActiveTab('tickets');
    }
  }, [activeTab, canManageTemplates, canViewConnection]);

  const {
    data: connection,
    isLoading: isConnLoading,
    isError: isConnError,
    error: connError,
    refetch: refetchConn,
  } = useConnectionQuery();

  const connectMutation = useConnectConnectionMutation();
  const updateMutation = useUpdateConnectionMutation();
  const disconnectMutation = useDisconnectConnectionMutation();
  const retryMutation = useRetryWebhooksMutation();

  const noConnection = isConnError && connError?.code === 'NOT_FOUND';

  const handleConnect = async (data) => {
    setErrorMsg(null);
    try {
      await connectMutation.mutateAsync(data);
      setSuccessMsg('تم ربط حساب الواتساب بنجاح وتم تشفير المفاتيح!');
      refetchConn();
    } catch (err) {
      setErrorMsg(err.message || 'فشل في ربط حساب الواتساب');
    }
  };

  const handleUpdate = async (data) => {
    setErrorMsg(null);
    try {
      await updateMutation.mutateAsync(data);
      setSuccessMsg('تم تحديث إعدادات الواتساب بنجاح!');
      setIsSettingsModalOpen(false);
      refetchConn();
    } catch (err) {
      setErrorMsg(err.message || 'فشل في تحديث البيانات');
    }
  };

  const handleDisconnect = async () => {
    setErrorMsg(null);
    try {
      await disconnectMutation.mutateAsync();
      setSuccessMsg('تم فصل اتصال الواتساب بنجاح.');
      setConfirmDisconnect(false);
      refetchConn();
    } catch (err) {
      setErrorMsg(err.message || 'فشل في فصل الاتصال');
    }
  };

  const handleRetryWebhooks = async () => {
    setErrorMsg(null);
    try {
      const res = await retryMutation.mutateAsync();
      setSuccessMsg(`تمت إعادة معالجة ${res?.data?.processed || 0} من أحداث الـ Webhook بنجاح.`);
    } catch (err) {
      setErrorMsg(err.message || 'فشل في إعادة محاولة الـ Webhooks');
    }
  };

  return (
    <div className="space-y-6">
      <WhatsAppPageHeader
        connection={connection}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenDisconnect={() => setConfirmDisconnect(true)}
      />

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

      <div className="flex items-center gap-2 border-b border-border-default bg-bg-surface px-4 pt-2 rounded-t-lg">
        {[
          { key: 'tickets', label: 'تذاكر الدعم والطلبات (Tickets)', icon: Tag },
          ...(canManageTemplates
            ? [{ key: 'templates', label: 'قوالب الرسائل والإشعارات (Templates)', icon: Sparkles }]
            : []),
          ...(canViewConnection
            ? [{ key: 'connection', label: 'الاتصال والإعدادات', icon: Phone }]
            : []),
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
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

      <div className="bg-bg-surface border border-border-default border-t-0 rounded-b-lg p-3 sm:p-5">
        {activeTab === 'tickets' && (
          <div>
            <WhatsAppTicketsView />
          </div>
        )}

        {activeTab === 'templates' && canManageTemplates && (
          <div>
            <TemplatesManager />
          </div>
        )}

        {activeTab === 'connection' && canViewConnection && (
          <WhatsAppConnectionTab
            connection={connection}
            isLoading={isConnLoading}
            noConnection={noConnection}
            onConnect={handleConnect}
            isConnecting={connectMutation.isPending}
            onRetryWebhooks={handleRetryWebhooks}
            isRetrying={retryMutation.isPending}
            onRefetch={refetchConn}
          />
        )}
      </div>

      <WhatsAppSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        connection={connection}
        onUpdate={handleUpdate}
        isLoading={updateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={confirmDisconnect}
        onClose={() => setConfirmDisconnect(false)}
        title="فصل اتصال الواتساب"
        message="هل تريد فصل اتصال الواتساب؟ لن تستقبل أو ترسل رسائل من الواتساب بعد الفصل، لكن سيتم الاحتفاظ بالسجل التاريخي."
        confirmLabel="فصل الاتصال"
        variant="danger"
        isLoading={disconnectMutation.isPending}
        onConfirm={handleDisconnect}
      />
    </div>
  );
};

export default WhatsAppPage;
