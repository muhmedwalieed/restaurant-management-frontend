import { useState, useEffect, useRef } from 'react';
import { Button } from '../../../shared/components/Button.jsx';
import { TemplateVariableToolbar } from './editor/TemplateVariableToolbar.jsx';
import { TemplateMarkdownToolbar } from './editor/TemplateMarkdownToolbar.jsx';
import { TemplateLivePreview } from './editor/TemplateLivePreview.jsx';
import { renderDynamicPreview } from '../utils/templateContextResolver.js';
import {
  X,
  Plus,
  Edit3,
  AlertCircle,
  Hash,
  Tag,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'INBOX_SUPPORT', label: 'خدمة العملاء والدعم' },
  { value: 'QUICK_REPLY', label: 'رد سريع للمحادثات' },
  { value: 'WHATSAPP_BOT', label: 'بوت الواتساب التفاعلي' },
  { value: 'ORDER_STATUS', label: 'إشعارات حالات الطلب' },
  { value: 'GENERAL', label: 'عام / تسويقي' },
];

export const CreateTemplateModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData = null,
  mode = 'create', // 'create' | 'duplicate' | 'edit'
}) => {
  const [title, setTitle] = useState('');
  const [key, setKey] = useState('');
  const [category, setCategory] = useState('INBOX_SUPPORT');
  const [description, setDescription] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (initialData) {
        if (mode === 'duplicate') {
          setTitle(`${initialData.title || ''} (نسخة جديدة)`);
          setKey('');
          setCategory(initialData.category || 'INBOX_SUPPORT');
          setDescription(initialData.description || '');
          setText(initialData.activeText || initialData.text || initialData.defaultText || '');
        } else if (mode === 'edit') {
          setTitle(initialData.title || '');
          setKey(initialData.key || '');
          setCategory(initialData.category || 'INBOX_SUPPORT');
          setDescription(initialData.description || '');
          setText(initialData.activeText || initialData.text || initialData.defaultText || '');
        }
      } else {
        setTitle('');
        setKey('');
        setCategory('INBOX_SUPPORT');
        setDescription('');
        setText('');
      }
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  const insertAtCursor = (insertion) => {
    const el = textareaRef.current;
    if (!el) {
      setText((prev) => prev + insertion);
      return;
    }
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    const newText = text.substring(0, start) + insertion + text.substring(end);
    setText(newText);
    setTimeout(() => {
      el.focus();
      const pos = start + insertion.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const wrapSelection = (wrapper) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = text.substring(start, end);
    const replacement = `${wrapper}${selected || 'نص'}${wrapper}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setText(newText);
    setTimeout(() => {
      el.focus();
      const pos = selected ? start + replacement.length : start + wrapper.length + 2;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('يرجى إدخال عنوان القالب');
      return;
    }

    if (!text.trim()) {
      setError('يرجى كتابة نص القالب');
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        key: key.trim() ? key.trim() : undefined,
        category,
        description: description.trim() || undefined,
        text: text.trim(),
        targetKey: mode === 'edit' ? initialData?.key : undefined,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'فشل في حفظ القالب');
    }
  };

  const preview = renderDynamicPreview(text);

  const modalTitle =
    mode === 'edit'
      ? 'تعديل بيانات القالب'
      : mode === 'duplicate'
      ? 'تكرار كقالب رسالة جديد'
      : 'إضافة قالب رسالة جديد';

  const modalSubtitle =
    mode === 'edit'
      ? 'قم بتحديث بيانات ونص القالب المخصص'
      : mode === 'duplicate'
      ? 'أنشئ رسالة جديدة مبنية على هذا القالب مع إمكانية تخصيص أي جزء فيها'
      : 'أنشئ قالباً مخصصاً للردود السريعة أو إشعارات وتحديثات رسائل الواتساب';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-bg-surface border border-border-default rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default bg-bg-base/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
              {mode === 'edit' ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-txt-primary">{modalTitle}</h3>
              <p className="text-[11px] text-txt-muted">{modalSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-txt-muted hover:text-txt-primary hover:bg-bg-base transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-status-danger-bg border border-status-danger/30 text-status-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-txt-primary flex items-center gap-1">
                <span>عنوان القالب:</span>
                <span className="text-status-danger">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: اعتذار عن تأخر تحضير الطلب"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-bg-base border border-border-default text-xs text-txt-primary placeholder:text-txt-dim focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-txt-primary flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-txt-dim" />
                <span>التصنيف:</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-bg-base border border-border-default text-xs text-txt-primary focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-txt-primary flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-txt-dim" />
                <span>معرف القالب (Key - اختياري):</span>
              </label>
              <input
                type="text"
                disabled={mode === 'edit'}
                placeholder="مثال: ORDER_DELAY_APOLOGY"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                className="w-full h-9 px-3 rounded-lg bg-bg-base border border-border-default text-xs font-mono text-txt-primary placeholder:text-txt-dim focus:outline-none focus:border-brand-primary transition-colors disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-txt-primary">وصف الاستخدام (اختياري):</label>
              <input
                type="text"
                placeholder="متى يتم إرسال هذا القالب..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-bg-base border border-border-default text-xs text-txt-primary placeholder:text-txt-dim focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>
          </div>

          <TemplateVariableToolbar onInsertVariable={insertAtCursor} />

          <div className="space-y-0">
            <TemplateMarkdownToolbar onWrapSelection={wrapSelection} />
            <textarea
              ref={textareaRef}
              required
              rows={5}
              placeholder="اكتب نص الرسالة هنا... يمكنك استخدام المتغيرات مثل {{customerName}} أو {{orderNumber}}"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-3 bg-bg-base border border-border-default rounded-b-lg text-xs font-sans text-txt-primary placeholder:text-txt-dim focus:outline-none focus:border-brand-primary transition-colors resize-y leading-relaxed"
            />
          </div>

          <TemplateLivePreview previewText={preview} />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-default">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              {mode === 'edit' ? 'حفظ التعديلات' : 'إنشاء القالب'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
