import React from 'react';
import { MessageSquare, History, Lock } from 'lucide-react';

export const TicketChatWindow = ({
  ticket,
  activeTab = 'CHAT',
  onSelectTab,
  messagesEndRef,
}) => {
  if (!ticket) return null;

  const messages = ticket.messages || [];
  const logs = ticket.logs || [];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-bg-surface">
      {/* Pane Tabs Header */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-border-default shrink-0 bg-bg-base/60">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectTab('CHAT')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'CHAT'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-txt-muted hover:text-txt-primary hover:bg-white/5'
            }`}
          >
            <MessageSquare size={13} />
            <span>المحادثة ({messages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('LOGS')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'LOGS'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-txt-muted hover:text-txt-primary hover:bg-white/5'
            }`}
          >
            <History size={13} />
            <span>سجل الأحداث ({logs.length})</span>
          </button>
        </div>
      </div>

      {/* Pane Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {activeTab === 'CHAT' ? (
          messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-txt-muted">
              <MessageSquare size={28} className="text-txt-dim mb-2" />
              <p className="text-xs font-semibold">لا توجد رسائل سابقة في هذه التذكرة</p>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isCust = m.senderType === 'CUSTOMER';
              const isNote = Boolean(m.isInternal);

              if (isNote) {
                return (
                  <div
                    key={m.id || idx}
                    className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1 mx-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between font-bold text-[11px] text-amber-400">
                      <span className="flex items-center gap-1">
                        <Lock size={12} />
                        <span>ملاحظة داخلية خاصة بالفريق:</span>
                      </span>
                      <span className="mono font-normal text-amber-400/70">
                        {new Date(m.createdAt).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </div>
                );
              }

              return (
                <div
                  key={m.id || idx}
                  className={`flex flex-col ${isCust ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-md p-3 rounded-2xl text-xs space-y-1 shadow-sm leading-relaxed whitespace-pre-wrap ${
                      isCust
                        ? 'bg-bg-base border border-border-default text-txt-primary rounded-tr-none'
                        : 'bg-emerald-800/40 border border-emerald-500/20 text-emerald-100 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] text-txt-dim font-medium">
                      <span>{isCust ? ticket.customer?.name || 'العميل' : 'فريق الدعم'}</span>
                      <span className="mono">
                        {new Date(m.createdAt).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p>{m.content}</p>
                  </div>
                </div>
              );
            })
          )
        ) : (
          /* Logs / History View */
          <div className="space-y-3 p-2">
            <h3 className="text-xs font-bold text-txt-primary border-b border-border-default pb-2">
              سجل النشاط والأحداث للتذكرة
            </h3>

            {logs.length === 0 ? (
              <p className="text-xs text-txt-muted text-center py-6">لا توجد أحداث مسجلة بعد.</p>
            ) : (
              <div className="space-y-2 relative before:absolute before:right-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-default/60">
                {logs.map((log, idx) => (
                  <div key={log.id || idx} className="flex items-start gap-2.5 relative pr-5 text-xs">
                    <div className="absolute right-0 top-1 w-4 h-4 rounded-full bg-brand-primary/20 border-2 border-brand-primary flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-txt-primary">
                          {log.action === 'CREATED' ? 'تم فتح التذكرة' : log.action}
                        </span>
                        <span className="text-[10px] text-txt-dim mono">
                          {new Date(log.createdAt).toLocaleString('ar-EG')}
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-[11px] text-txt-muted mt-0.5">{log.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
