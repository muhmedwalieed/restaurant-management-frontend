import React from 'react';
import { Bold, Italic, Strikethrough, Code, RotateCcw, Save } from 'lucide-react';
import { Button } from '../../../../shared/components/Button.jsx';

export const TemplateTextEditor = ({
  _templateKey,
  currentText,
  _originalText,
  isEdited,
  isSaving,
  allowedVariables = [],
  onTextChange,
  onDiscard,
  onSave,
  textareaRef,
  onInsertVariable,
  onWrapSelection,
}) => {
  return (
    <div className="space-y-2">
      {/* Formatting & Variable Insertion Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-border-subtle/50">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onWrapSelection('*')}
            title="عريض (*نص*)"
            className="p-1 rounded hover:bg-bg-surface text-txt-muted hover:text-txt-primary transition-colors text-xs font-bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onWrapSelection('_')}
            title="مائل (_نص_)"
            className="p-1 rounded hover:bg-bg-surface text-txt-muted hover:text-txt-primary transition-colors text-xs italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onWrapSelection('~')}
            title="يتوسطه خط (~نص~)"
            className="p-1 rounded hover:bg-bg-surface text-txt-muted hover:text-txt-primary transition-colors text-xs line-through"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onWrapSelection('```')}
            title="كود منسق (```نص```)"
            className="p-1 rounded hover:bg-bg-surface text-txt-muted hover:text-txt-primary transition-colors text-xs font-mono"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>

        {allowedVariables.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-txt-dim">المتغيرات:</span>
            {allowedVariables.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onInsertVariable(v)}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/20 transition-colors"
                title={`إدراج {{${v}}}`}
              >
                {`{{${v}}}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editor Textarea */}
      <textarea
        ref={textareaRef}
        rows={5}
        value={currentText}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="اكتب نص القالب هنا..."
        className="w-full text-xs font-sans p-3 rounded-lg bg-bg-base border border-border-default text-txt-primary placeholder:text-txt-dim focus:outline-none focus:border-brand-primary transition-colors leading-relaxed resize-y"
      />

      {/* Action Buttons (Save / Discard) */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-txt-dim font-mono">
          {currentText?.length || 0} حرف
        </span>

        <div className="flex items-center gap-2">
          {isEdited && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 px-2.5 text-txt-muted hover:text-txt-primary"
              onClick={onDiscard}
            >
              <RotateCcw className="w-3 h-3 ml-1" />
              <span>تراجع عن التعديل</span>
            </Button>
          )}

          <Button
            size="sm"
            variant="primary"
            className="text-xs h-7 px-3 shadow-sm"
            disabled={!isEdited || isSaving}
            onClick={onSave}
          >
            <Save className="w-3 h-3 ml-1" />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التعديل'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
