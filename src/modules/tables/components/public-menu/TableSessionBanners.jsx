import React from 'react';
import { CheckCircle2, ShieldCheck, Receipt, Bell } from 'lucide-react';

const StatusBanner = ({ tone = 'success', icon: Icon, children }) => {
  const tones = {
    success: 'bg-status-success/10 text-status-success border-status-success/30',
    warning: 'bg-status-warning/10 text-status-warning border-status-warning/30',
    info: 'bg-brand-primary/10 text-brand-primary border-brand-primary/30',
  };
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-medium ${tones[tone]}`}>
      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
};

export const TableSessionBanners = ({
  localFlash,
  session,
  waiterSent,
  isAwaiting,
  isClosed,
}) => {
  const call = session?.waiterCall;

  const showAwaiting = isAwaiting || call?.type === 'CONFIRM_ORDER';
  const showSent = !showAwaiting && waiterSent && call?.status !== 'ACCEPTED';
  const showPending = !showAwaiting && call?.status === 'PENDING';
  const showAccepted = !showAwaiting && call?.status === 'ACCEPTED';

  // Nothing to announce → render nothing at all (no empty padded block).
  if (!localFlash && !isClosed && !showAwaiting && !showSent && !showPending && !showAccepted) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-3 space-y-2">
      {localFlash && (
        <StatusBanner tone="success" icon={CheckCircle2}>
          {localFlash}
        </StatusBanner>
      )}

      {showAwaiting && (
        <StatusBanner tone="warning" icon={CheckCircle2}>
          {call?.status === 'ACCEPTED'
            ? 'تم إرسال طلبكم بنجاح، والويتر في الطريق لطاولتكم لمراجعة وتأكيد الطلب.'
            : 'تم إرسال الطلب، والويتر قادم لمراجعة وتأكيد الطلب معكم حالاً.'}
        </StatusBanner>
      )}

      {showSent && (
        <StatusBanner tone="success" icon={call?.type === 'BILL' ? Receipt : Bell}>
          {call?.type === 'BILL'
            ? 'تم إرسال طلب الفاتورة والحساب، الويتر في الطريق لطاولتكم.'
            : 'تم استدعاء الويتر لطاولتكم بنجاح، سيصل إليكم قريباً.'}
        </StatusBanner>
      )}

      {showPending && (
        <StatusBanner tone="warning" icon={call?.type === 'BILL' ? Receipt : Bell}>
          {call?.type === 'BILL'
            ? 'تم طلب الفاتورة والحساب، بانتظار استلام الويتر للطلب.'
            : 'تم استدعاء الويتر، بانتظار وصوله للطاولة.'}
        </StatusBanner>
      )}

      {showAccepted && (
        <StatusBanner tone="success" icon={CheckCircle2}>
          {call?.type === 'BILL'
            ? 'الويتر في الطريق لطاولتكم ومعه الفاتورة والحساب.'
            : 'الويتر في الطريق لطاولتكم حالياً.'}
        </StatusBanner>
      )}

      {isClosed && (
        <StatusBanner tone="info" icon={ShieldCheck}>
          الجلسة انتهت، شكراً لزيارتكم.
        </StatusBanner>
      )}
    </div>
  );
};

export default TableSessionBanners;
