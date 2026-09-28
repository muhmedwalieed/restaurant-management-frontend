import React from 'react';
import { Bold, Italic, Strikethrough, Code } from 'lucide-react';

export const TemplateMarkdownToolbar = ({ onWrapSelection }) => {
  return (
    <div className="flex items-center gap-1 bg-bg-base/70 p-1 rounded-t-lg border-t border-r border-l border-border-default">
      <button
        type="button"
        onClick={() => onWrapSelection('*')}
        className="p-1.5 rounded text-txt-muted hover:text-txt-primary hover:bg-bg-surface transition-colors cursor-pointer"
        title="عريض (*نص*)"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onWrapSelection('_')}
        className="p-1.5 rounded text-txt-muted hover:text-txt-primary hover:bg-bg-surface transition-colors cursor-pointer"
        title="مائل (_نص_)"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onWrapSelection('~')}
        className="p-1.5 rounded text-txt-muted hover:text-txt-primary hover:bg-bg-surface transition-colors cursor-pointer"
        title="يتوسطه خط (~نص~)"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onWrapSelection('```')}
        className="p-1.5 rounded text-txt-muted hover:text-txt-primary hover:bg-bg-surface transition-colors cursor-pointer"
        title="كود/كتلة أحادية الخط (```نص```)"
      >
        <Code className="w-3.5 h-3.5" />
      </button>
      <span className="text-[10px] text-txt-dim pr-2 mr-auto font-medium">
        تنسيق ماركداون واتساب
      </span>
    </div>
  );
};
