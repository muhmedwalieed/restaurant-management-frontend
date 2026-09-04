import { useState } from 'react';
import { Button } from '../../../shared/components/Button.jsx';
import {
  X,
  Sparkles,
  Plus,
  Eye,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Hash,
  Tag,
} from 'lucide-react';

const COMMON_VARIABLES = [
  { key: 'customerName', label: 'اسم العميل' },
  { key: 'customerSalutation', label: 'اللقب والتحية' },
  { key: 'orderNumber', label: 'رقم الطلب' },
  { key: 'restaurantName', label: 'اسم المطعم' },
  { key: 'agentName', label: 'اسم الموظف' },
  { key: 'total', label: 'إجمالي الحساب' },
  { key: 'time', label: 'الوقت' },
  { key: 'address', label: 'العنوان' },
];

const MOCK_VALUES = {
  customerName: 'أحمد محمود',
  customerSalutation: ' يا أستاذ أحمد',
  orderNumber: '1042',
  restaurantName: 'مطعمنا المتميز',
  agentName: 'سارة حسن',
  total: '285.00',
  time: '07:30 م',
  address: 'شارع النصر، المعادي',
};

const CATEGORIES = [
  { value: 'INBOX_SUPPORT', label: 'خدمة العملاء والدعم' },
  { value: 'QUICK_REPLY', label: 'رد سريع للمحادثات' },
  { value: 'WHATSAPP_BOT', label: 'بوت الواتساب التفاعلي' },
  { value: 'ORDER_STATUS', label: 'إشعارات حالات الطلب' },
  { value: 'GENERAL', label: 'عام / تسويقي' },
];

function renderPreviewText(text) {
  if (!text) return '';
  let rendered = text;
  for (const [key, val] of Object.entries(MOCK_VALUES)) {
    rendered = rendered.split(`{{${key}}}`).join(val);
  }
  return rendered;
}

export const CreateTemplateModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [key, setKey] = useState('');
  const [category, setCategory] = useState('INBOX_SUPPORT');
  const [description, setDescription] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleInsertVariable = (varKey) => {
    setText((prev) => prev + `{{${varKey}}}`);
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
      });
      // Reset form
      setTitle('');
      setKey('');
      setCategory('INBOX_SUPPORT');
      setDescription('');
      setText('');
      onClose();
    } catch (err) {
      setError(err.message || 'فشل في إنشاء القالب');
    }
  };

  const preview = renderPreviewText(text);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-bg-surface border border-border-default rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default bg-bg-base/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-txt-primary">إضافة قالب رسالة جديد</h3>
              <p className="text-[11px] text-txt-muted">
                أنشئ قالباً مخصصاً للردود السريعة أو إشعارات وتحديثات رسائل الواتساب
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-txt-muted hover:text-txt-primary hover:bg-bg-base transition-colors"
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
            {/* Title */}
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

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-txt-primary flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-txt-dim" />
                <span>التصنيف:</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-bg-base border border-border-default text-xs text-txt-primary focus:outline-none focus:border-brand-primary transition-colors"
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
            {/* Custom Key (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-txt-primary flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-txt-dim" />
                <span>معرف القالب (Key - اختياري):</span>
              </label>
              <input
                type="text"
                placeholder="مثال: ORDER_DELAY_APOLOGY"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                className="w-full h-9 px-3 rounded-lg bg-bg-base border border-border-default text-xs font-mono text-txt-primary placeholder:text-txt-dim focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>

            {/* Description (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-txt-primary">الوصف (اختياري):</label>
              <input
                type="text"
                placeholder="وصف مختصر للغرض من هذا القالب"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-bg-base border border-border-default text-xs text-txt-primary placeholder:text-txt-dim focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>
          </div>

          {/* Variables inserter */}
          <div className="bg-bg-base/70 border border-border-default rounded-lg p-2.5 space-y-1.5">
            <span className="text-[11px] font-semibold text-txt-dim flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              <span>إدراج متغيرات ذكية بنقرة واحدة:</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {COMMON_VARIABLES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  title={`إدراج {{${v.key}}}`}
                  onClick={() => handleInsertVariable(v.key)}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-bg-surface border border-border-default text-brand-primary hover:border-brand-primary hover:bg-brand-primary/10 transition-colors"
                >
                  {`{{${v.key}}}`}
                  <span className="text-[10px] text-txt-dim mr-1">({v.label})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Editor & Live Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-txt-muted">
                <span className="font-semibold flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5 text-txt-dim" />
                  <span>نص القالب:</span>
                  <span className="text-status-danger">*</span>
                </span>
                <span className="font-mono text-[11px] text-txt-dim">{text.length} / 2000</span>
              </div>
              <textarea
                rows={5}
                required
                placeholder="اكتب نص الرسالة هنا، يمكنك إدراج المتغيرات مثل {{customerName}}..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-3 text-xs leading-relaxed bg-bg-base border border-border-default rounded-lg text-txt-primary focus:outline-none focus:border-brand-primary transition-colors resize-y"
              />
            </div>

            {/* Live WhatsApp Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-txt-muted">
                <span className="font-semibold flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-brand-primary" />
                  <span>معاينة حية للمستلم:</span>
                </span>
                <span className="text-[10px] text-txt-dim bg-bg-base px-1.5 py-0.5 rounded">
                  قيم تجريبية
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-bg-base/80 border border-border-default flex flex-col justify-between min-h-[120px]">
                <div className="whitespace-pre-wrap text-xs text-txt-primary leading-relaxed font-sans">
                  {preview || <span className="text-txt-dim italic">نص الرسالة فارغ</span>}
                </div>
                <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-border-subtle text-[10px] text-txt-dim">
                  <span>12:00 م</span>
                  <CheckCircle2 className="w-3 h-3 text-brand-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-default">
            <Button size="sm" variant="outline" type="button" onClick={onClose} disabled={isLoading}>
              إلغاء
            </Button>
            <Button size="sm" variant="primary" type="submit" isLoading={isLoading} icon={Plus}>
              إنشاء القالب
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTemplateModal;
