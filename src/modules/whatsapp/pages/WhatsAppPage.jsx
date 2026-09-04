import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useConnectionQuery,
  useConnectConnectionMutation,
  useUpdateConnectionMutation,
  useDisconnectConnectionMutation,
  useRetryWebhooksMutation,
} from '../hooks/useWhatsapp.js';
import {
  connectConnectionSchema,
  CONNECTION_STATUS_LABELS,
  connectionStatusPill,
  PROVIDER_LABELS,
} from '../schemas/whatsapp.schema.js';
import { Button } from '../../../shared/components/Button.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog.jsx';
import { WhatsAppSettingsModal } from '../components/WhatsAppSettingsModal.jsx';
import { WhatsAppTicketsView } from '../components/WhatsAppTicketsView.jsx';
import { TemplatesManager } from '../../templates/components/TemplatesManager.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import {
  Phone,
  Link2,
  AlertCircle,
  CheckCircle2,
  LogOut,
  RefreshCw,
  Settings,
  ShieldCheck,
  Key,
  Copy,
  Check,
  ExternalLink,
  Tag,
  Sparkles,
} from 'lucide-react';

export const WhatsAppPage = () => {
  const { hasPermission } = useAuth();
  const canManageTemplates = Boolean(hasPermission?.(['restaurants.manage', 'whatsapp.manage']));
  const canViewConnection = Boolean(hasPermission?.('whatsapp.manage'));

  const [activeTab, setActiveTab] = useState('tickets');
  const [successMsg, setSuccessMsg] = useAutoDismiss();
  const [errorMsg, setErrorMsg] = useState(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

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

  const {
    register: registerConnect,
    handleSubmit: handleSubmitConnect,
    reset: resetConnect,
    watch: watchConnect,
    formState: { errors: connectErrors },
  } = useForm({
    resolver: zodResolver(connectConnectionSchema),
    defaultValues: {
      provider: 'META',
      providerAccountId: '',
      providerPhoneNumberId: '',
      apiToken: '',
      webhookSecret: '',
      verifyToken: 'PrimeRestaurantVerify2026_8xK',
      displayName: 'Restaurant WhatsApp',
    },
  });

  const selectedProvider = watchConnect('provider');

  const handleConnect = async (data) => {
    setErrorMsg(null);
    try {
      await connectMutation.mutateAsync(data);
      setSuccessMsg('تم ربط حساب الواتساب بنجاح وتم تشفير المفاتيح!');
      resetConnect();
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

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const webhookCallbackUrl = `${window.location.origin}/api/webhooks/whatsapp`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <Phone className="w-6 h-6 text-brand-primary" />
            <span>خدمة عملاء وتذاكر الواتساب</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            إدارة تذاكر الدعم والشكاوى المعزولة، الرد على العملاء، وإعدادات ربط رقم الواتساب الخاص بالمطعم
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {connection && (
            <div className="flex items-center gap-2">
              <StatusPill status={connectionStatusPill(connection.status)}>
                {CONNECTION_STATUS_LABELS[connection.status] || connection.status}
              </StatusPill>
              <span className="text-xs text-txt-muted bg-bg-surface px-2.5 py-1 rounded-md border border-border-default">
                {PROVIDER_LABELS[connection.provider] || connection.provider}
              </span>
            </div>
          )}

          <PermissionGate permission="whatsapp.manage">
            {connection && connection.status === 'CONNECTED' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  icon={Settings}
                  onClick={() => setIsSettingsModalOpen(true)}
                >
                  تعديل المفاتيح
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  icon={LogOut}
                  onClick={() => setConfirmDisconnect(true)}
                >
                  فصل الرقم
                </Button>
              </>
            )}
          </PermissionGate>
        </div>
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
          <div className="space-y-6">
            {isConnLoading ? (
              <p className="text-sm text-txt-muted">جاري تحميل بيانات الاتصال...</p>
            ) : noConnection ? (
              <div className="max-w-3xl space-y-6">
                <div className="bg-bg-base border border-border-default rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-txt-primary">ربط حساب واتساب جديد للمطعم</h3>
                      <p className="text-xs text-txt-muted">
                        أدخل بيانات حساب Meta Cloud API أو اختر Mock للتجربة والاختبار المحلي
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitConnect(handleConnect)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select
                        label="نوع المزود (Provider)"
                        options={[
                          { value: 'META', label: 'Meta Cloud API (الرسمي)' },
                          { value: 'MOCK', label: 'Mock (اختباري محلي)' },
                        ]}
                        {...registerConnect('provider')}
                      />

                      <Input
                        label="اسم الحساب التعريفي"
                        placeholder="مثال: مطعمنا - الفرع الرئيسي"
                        error={connectErrors.displayName?.message}
                        {...registerConnect('displayName')}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="معرّف حساب واتساب للأعمال (WABA Account ID)"
                        placeholder="1105591915343508"
                        dir="ltr"
                        error={connectErrors.providerAccountId?.message}
                        {...registerConnect('providerAccountId')}
                      />

                      <Input
                        label="معرّف رقم الهاتف (Phone Number ID)"
                        placeholder="1233113343227409"
                        dir="ltr"
                        error={connectErrors.providerPhoneNumberId?.message}
                        {...registerConnect('providerPhoneNumberId')}
                      />
                    </div>

                    {selectedProvider === 'META' && (
                      <div className="space-y-4 pt-2 border-t border-border-subtle">
                        <div className="p-3 bg-bg-surface rounded-md border border-border-default text-xs text-txt-muted flex items-start gap-2">
                          <ShieldCheck className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                          <span>
                            يتم تشفير الـ <strong>API Token</strong> والـ <strong>Webhook Secret</strong> تلقائياً بخوارزمية <strong>AES-256-GCM</strong> داخل قاعدة البيانات ولن تظهر كنص صريح أبداً.
                          </span>
                        </div>

                        <Input
                          label="رمز الوصول الدائم (System User API Token)"
                          type="password"
                          placeholder="EAAc4OTk0YyM..."
                          dir="ltr"
                          error={connectErrors.apiToken?.message}
                          {...registerConnect('apiToken')}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="السر الخاص بالـ Webhook (App Secret / Webhook Secret)"
                            type="password"
                            placeholder="9755d936ab8ba8e3..."
                            dir="ltr"
                            error={connectErrors.webhookSecret?.message}
                            {...registerConnect('webhookSecret')}
                          />

                          <Input
                            label="رمز التحقق (Verify Token)"
                            placeholder="PrimeRestaurantVerify2026_8xK"
                            dir="ltr"
                            error={connectErrors.verifyToken?.message}
                            {...registerConnect('verifyToken')}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={connectMutation.isPending}
                        icon={Link2}
                      >
                        ربط الحساب وتشفير المفاتيح
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            ) : connection ? (
              <div className="max-w-4xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-bg-base border border-border-default rounded-lg p-4 space-y-3">
                    <h3 className="text-xs font-bold text-txt-dim uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-brand-primary" />
                      <span>بيانات الرقم والاتصال</span>
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-border-subtle">
                        <span className="text-txt-muted">اسم الحساب:</span>
                        <span className="font-bold text-txt-primary">{connection.displayName || 'غير محدد'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border-subtle">
                        <span className="text-txt-muted">المزود:</span>
                        <span className="font-medium text-txt-primary">{PROVIDER_LABELS[connection.provider] || connection.provider}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border-subtle">
                        <span className="text-txt-muted">WABA Account ID:</span>
                        <span className="font-mono text-txt-primary dir-ltr">{connection.providerAccountId || '-'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border-subtle">
                        <span className="text-txt-muted">Phone Number ID:</span>
                        <span className="font-mono text-txt-primary dir-ltr">{connection.providerPhoneNumberId || '-'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-txt-muted">تاريخ الربط:</span>
                        <span className="text-txt-primary">{new Date(connection.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-bg-base border border-border-default rounded-lg p-4 space-y-3">
                    <h3 className="text-xs font-bold text-txt-dim uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
                      <span>حالة التشفير والأمان</span>
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-2 rounded bg-bg-surface border border-border-default">
                        <span className="flex items-center gap-1.5 text-txt-primary">
                          <Key className="w-3.5 h-3.5 text-brand-primary" />
                          <span>Meta API Token</span>
                        </span>
                        <span className="flex items-center gap-1 text-status-success font-medium">
                          <Check className="w-3.5 h-3.5" />
                          <span>مشفر (AES-256)</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-bg-surface border border-border-default">
                        <span className="flex items-center gap-1.5 text-txt-primary">
                          <Key className="w-3.5 h-3.5 text-brand-primary" />
                          <span>Webhook HMAC Secret</span>
                        </span>
                        <span className="flex items-center gap-1 text-status-success font-medium">
                          <Check className="w-3.5 h-3.5" />
                          <span>مشفر ومفعل</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-bg-surface border border-border-default">
                        <span className="flex items-center gap-1.5 text-txt-primary">
                          <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
                          <span>Webhook Verify Token</span>
                        </span>
                        <span className="flex items-center gap-1 text-status-success font-medium">
                          <Check className="w-3.5 h-3.5" />
                          <span>تم الضبط</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {connection.provider === 'META' && (
                  <div className="bg-bg-base border border-border-default rounded-lg p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-brand-primary" />
                          <span>إعدادات Webhook في Meta Developer Portal</span>
                        </h3>
                        <p className="text-xs text-txt-muted mt-0.5">
                          انسخ هذه القيم وضعها داخل إعدادات تطبيق Meta الخاص برقم المطعم لتلقي الرسائل فورياً
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={RefreshCw}
                        isLoading={retryMutation.isPending}
                        onClick={handleRetryWebhooks}
                        title="إعادة معالجة الرسائل العالقة"
                      >
                        إعادة محاولة Webhooks
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-txt-muted mb-1">
                          رابط الاستقبال (Callback URL):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={webhookCallbackUrl}
                            className="flex-1 h-8 px-3 rounded-md bg-bg-surface border border-border-default font-mono text-xs text-txt-primary dir-ltr select-all"
                          />
                          <Button
                            size="sm"
                            icon={copiedField === 'url' ? Check : Copy}
                            onClick={() => copyToClipboard(webhookCallbackUrl, 'url')}
                          >
                            {copiedField === 'url' ? 'تم النسخ' : 'نسخ'}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-txt-muted mb-1">
                          رمز التحقق (Verify Token):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={connection.verifyToken || 'PrimeRestaurantVerify2026_8xK'}
                            className="flex-1 h-8 px-3 rounded-md bg-bg-surface border border-border-default font-mono text-xs text-txt-primary dir-ltr select-all"
                          />
                          <Button
                            size="sm"
                            icon={copiedField === 'verify' ? Check : Copy}
                            onClick={() =>
                              copyToClipboard(connection.verifyToken || 'PrimeRestaurantVerify2026_8xK', 'verify')
                            }
                          >
                            {copiedField === 'verify' ? 'تم النسخ' : 'نسخ'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
