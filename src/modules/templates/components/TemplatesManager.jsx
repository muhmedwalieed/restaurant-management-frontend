import { useState, useMemo } from 'react';
import {
  useTemplatesQuery,
  useUpdateTemplatesMutation,
  useResetTemplatesMutation,
} from '../hooks/useTemplates.js';
import { Button } from '../../../shared/components/Button.jsx';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import {
  Search,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShoppingBag,
  Headphones,
  Sliders,
  Sparkles,
  Eye,
  Edit3,
} from 'lucide-react';

const MOCK_VARIABLES = {
  restaurantName: 'مطعمنا السعيد',
  orderNumber: '1042',
  total: '285.00',
  address: 'شارع النصر، المعادي، شقة 4',
  customerName: 'أحمد محمود',
  customerSalutation: ' يا أستاذ أحمد',
  categoryName: 'وجبات التوفير',
  productName: 'برجر كلاسيك دبل',
  cartSummary: '1. 2x برجر كلاسيك دبل (200.00 ج.م)\n2. 1x كولا (40.00 ج.م)',
  status: 'قيد التجهيز بالمطبخ',
  time: '07:30 م',
  ticketNumber: '502',
  subject: 'استفسار عن حجز طاولة',
  agentName: 'سارة حسن',
  rating: '5',
  reason: 'استفسار عن الأصناف المتاحة',
  orderReference: ' بخصوص طلبك الأخير (#1042)',
  addressText: '\nالعنوان: شارع النصر، المعادي، شقة 4',
};

const CATEGORY_META = {
  ALL: { label: 'جميع القوالب', icon: Sliders },
  WHATSAPP_BOT: { label: 'بوت الواتساب التفاعلي', icon: MessageSquare },
  ORDER_STATUS: { label: 'إشعارات حالات الطلب', icon: ShoppingBag },
  INBOX_SUPPORT: { label: 'خدمة العملاء والدعم', icon: Headphones },
};

function renderPreviewText(text) {
  if (!text) return '';
  let rendered = text;
  for (const [key, val] of Object.entries(MOCK_VARIABLES)) {
    rendered = rendered.split(`{{${key}}}`).join(val);
  }
  return rendered;
}

export const TemplatesManager = () => {
  const { data: templatesResponse, isLoading, isError, error, refetch } = useTemplatesQuery();
  const updateMutation = useUpdateTemplatesMutation();
  const resetMutation = useResetTemplatesMutation();

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editedTemplates, setEditedTemplates] = useState({});
  const [savingKey, setSavingKey] = useState(null);
  const [resettingKey, setResettingKey] = useState(null);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [confirmResetSingle, setConfirmResetSingle] = useState(null);
  const [successMsg, setSuccessMsg] = useAutoDismiss();
  const [errorMsg, setErrorMsg] = useState(null);

  const templatesList = useMemo(() => {
    return Array.isArray(templatesResponse?.data) ? templatesResponse.data : [];
  }, [templatesResponse?.data]);

  const filteredTemplates = useMemo(() => {
    return templatesList.filter((item) => {
      const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.key?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [templatesList, activeCategory, searchQuery]);

  const totalTemplates = templatesList.length;
  const customCount = templatesList.filter((t) => t.isCustom).length;
  const defaultCount = totalTemplates - customCount;

  const handleTextChange = (key, text) => {
    setEditedTemplates((prev) => ({
      ...prev,
      [key]: text,
    }));
  };

  const insertVariable = (key, currentVal, varName) => {
    const textToInsert = `{{${varName}}}`;
    const newText = (currentVal || '') + textToInsert;
    handleTextChange(key, newText);
  };

  const handleSave = async (key) => {
    const newText = editedTemplates[key];
    if (newText === undefined) return;

    setErrorMsg(null);
    setSavingKey(key);
    try {
      await updateMutation.mutateAsync({
        templates: {
          [key]: newText,
        },
      });
      setSuccessMsg(`تم حفظ وتحديث القالب بنجاح!`);
      setEditedTemplates((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      refetch();
    } catch (err) {
      setErrorMsg(err.message || 'فشل في تحديث القالب');
    } finally {
      setSavingKey(null);
    }
  };

  const handleResetSingle = async (key) => {
    setErrorMsg(null);
    setResettingKey(key);
    try {
      await resetMutation.mutateAsync({ key });
      setSuccessMsg('تمت استعادة القالب إلى النص الافتراضي بنجاح.');
      setEditedTemplates((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setConfirmResetSingle(null);
      refetch();
    } catch (err) {
      setErrorMsg(err.message || 'فشل في استعادة القالب');
    } finally {
      setResettingKey(null);
    }
  };

  const handleResetAll = async () => {
    setErrorMsg(null);
    try {
      await resetMutation.mutateAsync({ resetAll: true });
      setSuccessMsg('تمت استعادة كافة القوالب إلى القيم الافتراضية بنجاح.');
      setEditedTemplates({});
      setConfirmResetAll(false);
      refetch();
    } catch (err) {
      setErrorMsg(err.message || 'فشل في استعادة القوالب');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-txt-muted flex flex-col items-center justify-center space-y-2">
        <Sparkles className="w-6 h-6 text-brand-primary animate-spin" />
        <p>جاري تحميل قوالب الرسائل والإشعارات...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-lg bg-status-danger-bg border border-status-danger/30 text-status-danger text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>تعذر تحميل القوالب</span>
        </div>
        <p>{error?.message || 'حدث خطأ أثناء الاتصال بالخادم.'}</p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-bg-base/60 border border-border-default rounded-xl p-4 sm:p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-primary shrink-0" />
            <h2 className="text-base font-bold text-txt-primary">
              قوالب الرسائل والإشعارات الذكية
            </h2>
          </div>
          <p className="text-xs text-txt-muted max-w-2xl leading-relaxed">
            خصص رسائل بوت الواتساب التفاعلي، وإشعارات تحديث حالات الطلبات، ورسائل تذاكر الدعم والإنبوكس الخاصة بمطعمك بسهولة مع ميزة التعويض التلقائي للمتغيرات.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-bg-surface px-3 py-1.5 rounded-lg border border-border-default text-xs">
            <span className="text-txt-muted">الإجمالي:</span>
            <span className="font-bold text-txt-primary font-mono">{totalTemplates}</span>
            <span className="text-border-default">|</span>
            <span className="text-brand-primary font-medium">مخصص:</span>
            <span className="font-bold text-brand-primary font-mono">{customCount}</span>
            <span className="text-border-default">|</span>
            <span className="text-txt-dim font-medium">افتراضي:</span>
            <span className="font-bold text-txt-muted font-mono">{defaultCount}</span>
          </div>

          <PermissionGate permission="restaurants.manage">
            {customCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                icon={RotateCcw}
                onClick={() => setConfirmResetAll(true)}
              >
                استعادة الكل للافتراضي
              </Button>
            )}
          </PermissionGate>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {Object.entries(CATEGORY_META).map(([catKey, meta]) => {
            const Icon = meta.icon;
            const isSelected = activeCategory === catKey;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setActiveCategory(catKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                  isSelected
                    ? 'bg-brand-primary text-txt-inverted border-brand-primary font-bold shadow-sm'
                    : 'bg-bg-surface text-txt-muted border-border-default hover:text-txt-primary hover:border-border-subtle'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-txt-dim pointer-events-none" />
          <input
            type="text"
            placeholder="بحث في القوالب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-1.5 text-xs bg-bg-surface border border-border-default rounded-lg text-txt-primary placeholder:text-txt-dim focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>
      </div>

      {/* Templates Cards Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="p-8 text-center bg-bg-base/40 rounded-xl border border-border-default text-xs text-txt-muted">
          لا توجد قوالب مطابقة لمعايير البحث الحالية.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTemplates.map((template) => {
            const key = template.key;
            const currentText =
              editedTemplates[key] !== undefined ? editedTemplates[key] : template.activeText;
            const isDirty =
              editedTemplates[key] !== undefined && editedTemplates[key] !== template.activeText;
            const previewText = renderPreviewText(currentText);

            return (
              <div
                key={key}
                className="bg-bg-surface border border-border-default rounded-xl p-4 sm:p-5 space-y-4 shadow-sm transition-all hover:border-border-subtle"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-default/60 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-txt-primary">{template.title}</h3>
                      <span className="font-mono text-[10px] text-txt-dim px-2 py-0.5 rounded bg-bg-base border border-border-default">
                        {template.key}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                          template.isCustom
                            ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/30'
                            : 'bg-bg-base text-txt-dim border-border-default'
                        }`}
                      >
                        {template.isCustom ? 'مخصص' : 'افتراضي'}
                      </span>
                    </div>
                    <p className="text-xs text-txt-muted">{template.description}</p>
                  </div>

                  <span className="text-[11px] text-txt-dim font-medium bg-bg-base px-2.5 py-1 rounded-md border border-border-default self-start sm:self-auto">
                    {template.categoryLabel || template.category}
                  </span>
                </div>

                {/* Allowed Variables Bar */}
                {Array.isArray(template.allowedVariables) && template.allowedVariables.length > 0 && (
                  <div className="bg-bg-base/60 border border-border-default rounded-lg p-2.5 flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-txt-dim text-[11px] font-medium shrink-0 flex items-center gap-1">
                      <Edit3 className="w-3 h-3 text-brand-primary" />
                      <span>المتغيرات المتاحة (اضغط للإدراج):</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {template.allowedVariables.map((varName) => (
                        <button
                          key={varName}
                          type="button"
                          title="اضغط لإدراج هذا المتغير في النص"
                          onClick={() => insertVariable(key, currentText, varName)}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-bg-surface border border-border-default text-brand-primary hover:border-brand-primary hover:bg-brand-primary/10 transition-colors cursor-pointer"
                        >
                          {`{{${varName}}}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Two-Column Editor & WhatsApp Live Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Column: Textarea Editor */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-txt-muted">
                      <span className="font-semibold flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5 text-txt-dim" />
                        <span>نص القالب:</span>
                      </span>
                      <span className="font-mono text-[11px] text-txt-dim">
                        {currentText?.length || 0} / 2000 حرف
                      </span>
                    </div>

                    <textarea
                      rows={6}
                      value={currentText}
                      onChange={(e) => handleTextChange(key, e.target.value)}
                      placeholder="اكتب نص القالب هنا..."
                      className="w-full p-3 text-xs leading-relaxed bg-bg-base border border-border-default rounded-lg text-txt-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-sans resize-y"
                    />
                  </div>

                  {/* Right Column: Live Message Preview */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-txt-muted">
                      <span className="font-semibold flex items-center gap-1 text-txt-dim">
                        <Eye className="w-3.5 h-3.5 text-brand-primary" />
                        <span>معاينة حية للمستلم (Live Preview):</span>
                      </span>
                      <span className="text-[10px] text-txt-dim bg-bg-base px-1.5 py-0.5 rounded">
                        قيم تجريبية
                      </span>
                    </div>

                    {/* WhatsApp-Style Bubble Box */}
                    <div className="p-3.5 rounded-xl bg-bg-base/80 border border-border-default flex flex-col justify-between min-h-[140px]">
                      <div className="whitespace-pre-wrap text-xs text-txt-primary leading-relaxed font-sans">
                        {previewText || <span className="text-txt-dim italic">نص الرسالة فارغ</span>}
                      </div>

                      <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-border-subtle text-[10px] text-txt-dim">
                        <span>12:00 م</span>
                        <CheckCircle2 className="w-3 h-3 text-brand-primary" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-border-default/50 flex-wrap">
                  <div className="text-[11px] text-txt-dim">
                    {isDirty && (
                      <span className="text-brand-primary font-medium">
                        يوجد تعديلات غير محفوظة لهذا القالب
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <PermissionGate permission="restaurants.manage">
                      {template.isCustom && (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={RotateCcw}
                          isLoading={resettingKey === key}
                          onClick={() => setConfirmResetSingle(template)}
                        >
                          استعادة الافتراضي
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant={isDirty ? 'primary' : 'outline'}
                        icon={Save}
                        disabled={!isDirty}
                        isLoading={savingKey === key}
                        onClick={() => handleSave(key)}
                      >
                        حفظ التعديل
                      </Button>
                    </PermissionGate>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={confirmResetAll}
        onClose={() => setConfirmResetAll(false)}
        onConfirm={handleResetAll}
        title="استعادة كافة القوالب للافتراضي"
        message="هل أنت متأكد من رغبتك في حذف جميع التخصيصات واستعادة النصوص الافتراضية لكافة قوالب الواتساب والإشعارات والإنبوكس؟"
        confirmLabel="نعم، استعادة الكل"
        cancelLabel="إلغاء"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={Boolean(confirmResetSingle)}
        onClose={() => setConfirmResetSingle(null)}
        onConfirm={() => confirmResetSingle && handleResetSingle(confirmResetSingle.key)}
        title="استعادة القالب الافتراضي"
        message={`هل أنت متأكد من استعادة النص الافتراضي لقالب "${confirmResetSingle?.title}"؟ سيتم إلغاء التعديلات الخاصة بمطعمك.`}
        confirmLabel="استعادة الافتراضي"
        cancelLabel="إلغاء"
        variant="danger"
      />
    </div>
  );
};

export default TemplatesManager;
