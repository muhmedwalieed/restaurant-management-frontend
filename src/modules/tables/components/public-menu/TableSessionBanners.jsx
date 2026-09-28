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
      <Icon className="w-4 h-4 shrink-0" />
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
  return (
    <div className="max-w-6xl mx-auto px-4 pt-3 space-y-2">
      {localFlash && (
        <StatusBanner tone="success" icon={CheckCircle2}>
          {localFlash}
        </StatusBanner>
      )}

      {isAwaiting || session?.waiterCall?.type === 'CONFIRM_ORDER' ? (
        <StatusBanner tone="warning" icon={CheckCircle2}>
          {session?.waiterCall?.status === 'ACCEPTED'
            ? 'تم إرسال طلبكم بنجاح، والويتر في الطريق لطاولتكم لمراجعة وتأكيد الطلب.'
            : 'تم إرسال الطلب، والويتر قادم لمراجعة وتأكيد الطلب معكم حالاً.'}
        </StatusBanner>
      ) : (
        <>
          {waiterSent && session?.waiterCall?.status !== 'ACCEPTED' && (
            <StatusBanner tone="success" icon={session?.waiterCall?.type === 'BILL' ? Receipt : Bell}>
              {session?.waiterCall?.type === 'BILL'
                ? 'تم إرسال طلب الفاتورة والحساب، الويتر في الطريق لطاولتكم.'
                : 'تم استدعاء الويتر لطاولتكم بنجاح، سيصل إليكم قريباً.'}
            </StatusBanner>
          )}
          {session?.waiterCall?.status === 'PENDING' && (
            <StatusBanner tone="warning" icon={session?.waiterCall?.type === 'BILL' ? Receipt : Bell}>
              {session?.waiterCall?.type === 'BILL'
                ? 'تم طلب الفاتورة والحساب، بانتظار استلام الويتر للطلب.'
                : 'تم استدعاء الويتر، بانتظار وصوله للطاولة.'}
            </StatusBanner>
          )}
          {session?.waiterCall?.status === 'ACCEPTED' && (
            <StatusBanner tone="success" icon={CheckCircle2}>
              {session?.waiterCall?.type === 'BILL'
                ? 'الويتر في الطريق لطاولتكم ومعه الفاتورة والحساب.'
                : 'الويتر في الطريق لطاولتكم حالياً.'}
            </StatusBanner>
          )}
        </>
      )}

      {isClosed && (
        <StatusBanner tone="info" icon={ShieldCheck}>
          الجلسة انتهت، شكراً لزيارتكم.
        </StatusBanner>
      )}
    </div>
  );
};
