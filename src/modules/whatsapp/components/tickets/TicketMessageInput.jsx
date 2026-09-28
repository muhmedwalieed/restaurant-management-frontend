import React from 'react';
import { Send, Lock, MessageSquare, BookOpen } from 'lucide-react';

export const TicketMessageInput = ({
  messageMode = 'REPLY',
  onChangeMode,
  messageText = '',
  onChangeText,
  onSendMessage,
  onOpenTemplatePicker,
  isLoading,
  disabled,
}) => {
  const isReply = messageMode === 'REPLY';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="p-3 border-t border-border-default bg-bg-base/80 space-y-2 shrink-0 select-none">
      {/* Mode Switcher & Template Picker */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-bg-surface p-0.5 rounded-lg border border-border-default">
          <button
            type="button"
            onClick={() => onChangeMode('REPLY')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              isReply ? 'bg-brand-primary text-white shadow-sm' : 'text-txt-muted hover:text-txt-primary'
            }`}
          >
            <MessageSquare size={12} />
            <span>رد للعميل</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeMode('NOTE')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              !isReply ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-txt-muted hover:text-txt-primary'
            }`}
          >
            <Lock size={12} />
            <span>ملاحظة داخلية</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenTemplatePicker}
          className="text-[11px] font-semibold text-brand-primary hover:underline flex items-center gap-1 px-2 py-1 rounded hover:bg-brand-primary/10 transition-colors"
        >
          <BookOpen size={12} />
          <span>إدراج قالب جاهز</span>
        </button>
      </div>

      {/* Input Box & Send Button */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={messageText}
          disabled={disabled}
          onChange={(e) => onChangeText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isReply
              ? 'اكتب رسالة واتساب للعميل في هذه التذكرة...'
              : 'اكتب ملاحظة داخلية خاصة بفريق العمل...'
          }
          className="flex-1 h-9 px-3 rounded-lg bg-bg-surface border border-border-default text-txt-primary text-xs focus:outline-none focus:border-brand-primary transition-colors disabled:opacity-50"
        />

        <button
          type="button"
          disabled={!messageText.trim() || isLoading || disabled}
          onClick={onSendMessage}
          className="h-9 px-4 rounded-lg font-bold text-xs text-white bg-brand-primary hover:bg-brand-primary-hover active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Send size={13} />
          <span>إرسال</span>
        </button>
      </div>
    </div>
  );
};
