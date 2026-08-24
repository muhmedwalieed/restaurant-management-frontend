import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConversationQuery, useHandoffConversationMutation, useCloseConversationMutation } from '../hooks/useWhatsappAutomation.js';
import {
  CONVERSATION_STATUS_LABELS,
  conversationStatusPill,
  CONVERSATION_STATE_LABELS,
} from '../schemas/conversation.schema.js';
import { Button } from '../../../shared/components/Button.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { Modal } from '../../../shared/components/Modal.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import { Phone, ChevronRight, User, MapPin, ShoppingCart, Headset, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-3">
    <Icon className="w-4 h-4 text-brand-primary shrink-0" />
    <div className="min-w-0">
      <p className="text-xs text-txt-muted">{label}</p>
      <p className="text-sm font-semibold text-txt-primary truncate">{value || 'غير محدد'}</p>
    </div>
  </div>
);

export const ConversationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actionSuccess, setActionSuccess] = useAutoDismiss();
  const [actionError, setActionError] = useState(null);
  const [isHandoffOpen, setIsHandoffOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);

  const { data: conv, isLoading, isError, error, refetch } = useConversationQuery(id);
  const handoffMutation = useHandoffConversationMutation();
  const closeMutation = useCloseConversationMutation();

  const runAction = async (fn, closeModal) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await fn();
      setActionSuccess('تم تنفيذ العملية بنجاح.');
      closeModal();
    } catch (err) {
      setActionError(err?.message || 'حدث خطأ أثناء تنفيذ العملية.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton height={48} className="w-1/3" />
        <LoadingSkeleton height={300} className="w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-status-danger-bg border border-status-danger/30 rounded-lg p-6 text-center space-y-3">
        <AlertCircle className="w-6 h-6 text-status-danger mx-auto" />
        <h3 className="text-base font-bold text-txt-primary">فشل في تحميل المحادثة</h3>
        <p className="text-xs text-txt-muted">{error?.message || 'تعذر التواصل مع الخادم.'}</p>
        <Button size="sm" variant="outline" onClick={refetch}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  const cartItems = Array.isArray(conv?.cart) ? conv.cart : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => navigate('/whatsapp/conversations')} icon={ChevronRight}>
          العودة للمحادثات
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <Phone className="w-5 h-5 text-brand-primary" />
            <span className="dir-ltr">{conv?.customerPhone}</span>
          </h1>
          <StatusPill status={conversationStatusPill(conv?.status)}>{CONVERSATION_STATUS_LABELS[conv?.status] || conv?.status}</StatusPill>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border-default flex items-center gap-2">
              <User className="w-4 h-4 text-brand-primary" />
              <h3 className="text-sm font-bold text-txt-primary">معلومات المحادثة</h3>
            </div>
            <div className="px-4 py-2 divide-y divide-border-subtle">
              <InfoRow icon={Phone} label="رقم العميل" value={conv?.customerPhone} />
              <InfoRow icon={User} label="اسم العميل" value={conv?.customer?.name || 'غير محدد'} />
              <InfoRow icon={User} label="المرحلة الحالية" value={CONVERSATION_STATE_LABELS[conv?.state] || conv?.state} />
              <InfoRow icon={User} label="آخر رسالة" value={conv?.lastInboundAt ? new Date(conv.lastInboundAt).toLocaleString('ar-EG') : 'غير محدد'} />
            </div>
          </div>

          {/* Cart */}
          <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border-default flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-brand-primary" />
              <h3 className="text-sm font-bold text-txt-primary">السلة الحالية ({cartItems.length})</h3>
            </div>
            {cartItems.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-txt-muted">السلة فارغة.</p>
            ) : (
              <div className="divide-y divide-border-subtle">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="px-4 py-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-txt-primary">{item.productName}</span>
                    <span className="text-xs text-txt-muted">
                      {item.quantity}x · {(Number(item.unitPrice) * Number(item.quantity)).toFixed(2)} EGP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side */}
        <div className="space-y-6">
          <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border-default">
              <h3 className="text-sm font-bold text-txt-primary">العنوان</h3>
            </div>
            <div className="px-4 py-2">
              <p className="flex items-start gap-2 text-xs text-txt-muted py-3">
                <MapPin className="w-4 h-4 text-brand-primary shrink-0 mt-1" />
                {conv?.address || 'غير محدد'}
              </p>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border-default">
              <h3 className="text-sm font-bold text-txt-primary">الإجراءات</h3>
            </div>
            <div className="px-4 py-3 space-y-2">
              {conv?.status !== 'WAITING_AGENT' && (
                <PermissionGate permission="chats.assign">
                  <Button variant="outline" size="sm" icon={Headset} className="w-full" onClick={() => setIsHandoffOpen(true)}>
                    تحويل لموظف (Human Handoff)
                  </Button>
                </PermissionGate>
              )}
              {conv?.status !== 'CLOSED' && (
                <PermissionGate permission="chats.close">
                  <Button variant="danger" size="sm" icon={XCircle} className="w-full" onClick={() => setIsCloseOpen(true)}>
                    إغلاق المحادثة
                  </Button>
                </PermissionGate>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Handoff Modal */}
      <Modal isOpen={isHandoffOpen} onClose={() => setIsHandoffOpen(false)} title="تحويل المحادثة لموظف" size="sm">
        <div className="space-y-4 text-right">
          <p className="text-xs text-txt-muted">
            سيتم إيقاف ردود الروبوت وتحويل محادثة <span className="dir-ltr font-bold text-txt-primary">{conv?.customerPhone}</span> لموظف دعم.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button variant="outline" size="sm" onClick={() => setIsHandoffOpen(false)} disabled={handoffMutation.isPending}>
              تراجع
            </Button>
            <Button variant="primary" size="sm" isLoading={handoffMutation.isPending} onClick={() => runAction(() => handoffMutation.mutateAsync(id), () => setIsHandoffOpen(false))}>
              تأكيد التحويل
            </Button>
          </div>
        </div>
      </Modal>

      {/* Close Modal */}
      <Modal isOpen={isCloseOpen} onClose={() => setIsCloseOpen(false)} title="إغلاق المحادثة" size="sm">
        <div className="space-y-4 text-right">
          <p className="text-xs text-txt-muted">
            سيتم إغلاق محادثة <span className="dir-ltr font-bold text-txt-primary">{conv?.customerPhone}</span>. أي رسالة جديدة ستعيد فتحها.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button variant="outline" size="sm" onClick={() => setIsCloseOpen(false)} disabled={closeMutation.isPending}>
              تراجع
            </Button>
            <Button variant="danger" size="sm" isLoading={closeMutation.isPending} onClick={() => runAction(() => closeMutation.mutateAsync(id), () => setIsCloseOpen(false))}>
              تأكيد الإغلاق
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};