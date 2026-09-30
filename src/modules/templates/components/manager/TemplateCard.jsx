import React from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../../../shared/components/Button.jsx';
import { TemplateTextEditor } from './TemplateTextEditor.jsx';
import { TemplatePreviewBox } from './TemplatePreviewBox.jsx';
import { CATEGORY_META } from './TemplatesFilterHeader.jsx';

export const TemplateCard = ({
  item,
  currentText,
  isEdited,
  isSaving,
  isResetting,
  isExpandedDefault,
  isCopied,
  previewContext,
  onTextChange,
  onDiscardChanges,
  onSave,
  onResetSingle,
  onOpenEditModal,
  onOpenDuplicateModal,
  onConfirmDelete,
  onToggleDefault,
  onCopyText,
  textareaRef,
  onInsertVariable,
  onWrapSelection,
}) => {
  const categoryMeta = CATEGORY_META[item.category] || CATEGORY_META.WHATSAPP_BOT;
  const CategoryIcon = categoryMeta.icon;

  return (
    <div className="bg-bg-surface border border-border-default/80 rounded-xl overflow-hidden shadow-sm hover:border-border-default transition-colors">
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-border-default flex flex-col sm:flex-row sm:items-start justify-between gap-3 bg-bg-surface">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1 rounded-md bg-bg-surface-elevated text-txt-primary border border-border-default">
              <CategoryIcon className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-sm font-bold text-txt-primary">{item.title}</h2>

            {item.isUserCreated ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg-surface-elevated text-txt-primary border border-border-default">
                قالب مخصص لك
              </span>
            ) : item.isCustom ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg-surface text-txt-primary border border-border-default">
                معدّل عن الافتراضي
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg-surface text-txt-muted border border-border-default">
                افتراضي النظام
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-txt-dim">
            <span className="font-mono text-txt-muted">{item.key}</span>
            <span>•</span>
            <span>{item.description}</span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-txt-muted hover:text-txt-primary"
            onClick={() => onCopyText(currentText)}
            title="نسخ النص الحقيقي للقالب"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-txt-primary" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>

          {item.isUserCreated && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-txt-muted hover:text-txt-primary"
                onClick={() => onOpenEditModal(item)}
                title="تعديل تفاصيل القالب"
              >
                <Edit3 className="w-3.5 h-3.5 text-txt-muted hover:text-txt-primary" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-txt-muted hover:text-status-danger"
                onClick={() => onConfirmDelete(item)}
                aria-label="حذف القالب"
                title="حذف القالب نهائياً"
              >
                <Trash2 className="w-3.5 h-3.5 text-status-danger" />
                <span className="text-[11px] mr-1">حذف القالب</span>
              </Button>
            </>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-txt-muted hover:text-txt-primary"
            onClick={() => onOpenDuplicateModal(item)}
            title="إنشاء نسخة من هذا القالب"
          >
            <Sparkles className="w-3.5 h-3.5 text-txt-muted" />
            <span className="text-[11px] mr-1">تكرار</span>
          </Button>

          {item.isCustom && !item.isUserCreated && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs border-border-default text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated"
              disabled={isResetting}
              onClick={() => onResetSingle(item)}
              title="استعادة النص الافتراضي لهذا القالب"
            >
              <RotateCcw className="w-3 h-3 ml-1" />
              <span>استعادة الافتراضي</span>
            </Button>
          )}
        </div>
      </div>

      {/* Card Body (Two Columns: Editor on Left, Live Preview on Right) */}
      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Editor Column */}
        <TemplateTextEditor
          templateKey={item.key}
          currentText={currentText}
          originalText={item.activeText}
          isEdited={isEdited}
          isSaving={isSaving}
          allowedVariables={item.allowedVariables || []}
          onTextChange={onTextChange}
          onDiscard={onDiscardChanges}
          onSave={onSave}
          textareaRef={textareaRef}
          onInsertVariable={onInsertVariable}
          onWrapSelection={onWrapSelection}
        />

        {/* Live Preview Column */}
        <div className="space-y-4">
          <TemplatePreviewBox
            text={currentText}
            context={previewContext}
          />

          {/* Collapsible Default Text */}
          {item.defaultText && (
            <div className="pt-2 border-t border-border-subtle/40">
              <button
                type="button"
                onClick={onToggleDefault}
                className="text-[11px] font-medium text-txt-muted hover:text-txt-primary flex items-center gap-1.5 transition-colors"
              >
                {isExpandedDefault ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{isExpandedDefault ? 'إخفاء النص الافتراضي الأصلي' : 'عرض النص الافتراضي الأصلي'}</span>
              </button>

              {isExpandedDefault && (
                <div className="mt-2 p-3 rounded-lg bg-bg-base/60 border border-border-default/60 text-xs text-txt-muted whitespace-pre-wrap font-mono leading-relaxed">
                  {item.defaultText}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
