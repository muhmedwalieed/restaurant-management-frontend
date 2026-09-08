import { useState, useMemo, useRef } from 'react';
import {
  useTemplatesQuery,
  useUpdateTemplatesMutation,
  useResetTemplatesMutation,
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
} from '../hooks/useTemplates.js';
import { CreateTemplateModal } from './CreateTemplateModal.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';
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
  EyeOff,
  Edit3,
  Plus,
  Trash2,
  Copy,
  Check,
  Undo2,
  FileCode,
  Bold,
  Italic,
  Strikethrough,
  Code,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
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
  QUICK_REPLY: { label: 'ردود سريعة', icon: MessageSquare },
  GENERAL: { label: 'عام / تسويقي', icon: Sparkles },
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
  const { hasPermission } = useAuth();
  const canView = Boolean(
    hasPermission?.([
      'restaurants.manage',
      'whatsapp.manage',
      'whatsapp.view',
      'chats.view',
      'chats.reply',
    ])
  );
  const canManage = Boolean(hasPermission?.(['restaurants.manage', 'whatsapp.manage']));

  const { data: templatesResponse, isLoading, isError, error, refetch } = useTemplatesQuery({
    enabled: canView,
  });
  const updateMutation = useUpdateTemplatesMutation();
  const resetMutation = useResetTemplatesMutation();
  const createMutation = useCreateTemplateMutation();
  const deleteMutation = useDeleteTemplateMutation();

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'DEFAULT' | 'MODIFIED' | 'USER_CREATED'
  const [searchQuery, setSearchQuery] = useState('');
  const [editedTemplates, setEditedTemplates] = useState({});
  const [expandedDefaults, setExpandedDefaults] = useState(new Set());
  const [savingKey, setSavingKey] = useState(null);
  const [resettingKey, setResettingKey] = useState(null);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [confirmResetSingle, setConfirmResetSingle] = useState(null);
  const [confirmDeleteTemplate, setConfirmDeleteTemplate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    initialData: null,
    mode: 'create', // 'create' | 'duplicate' | 'edit'
  });
  const [copiedKey, setCopiedKey] = useState(null);
  const [successMsg, setSuccessMsg] = useAutoDismiss();
  const [errorMsg, setErrorMsg] = useState(null);

  const textareaRefs = useRef({});

  const templatesList = useMemo(() => {
    if (Array.isArray(templatesResponse)) return templatesResponse;
    if (Array.isArray(templatesResponse?.data)) return templatesResponse.data;
    if (Array.isArray(templatesResponse?.items)) return templatesResponse.items;
    return [];
  }, [templatesResponse]);

  const totalTemplates = templatesList.length;
  const userCreatedCount = templatesList.filter((t) => t.isUserCreated).length;
  const customCount = templatesList.filter((t) => t.isCustom && !t.isUserCreated).length;
  const defaultCount = templatesList.filter((t) => !t.isCustom && !t.isUserCreated).length;

  const filteredTemplates = useMemo(() => {
    return templatesList.filter((item) => {
      // Category filter
      const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'DEFAULT') {
        matchesStatus = !item.isCustom && !item.isUserCreated;
      } else if (statusFilter === 'MODIFIED') {
        matchesStatus = item.isCustom && !item.isUserCreated;
      } else if (statusFilter === 'USER_CREATED') {
        matchesStatus = item.isUserCreated;
      }

      // Search query filter
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.key?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.activeText?.toLowerCase().includes(q) ||
        item.defaultText?.toLowerCase().includes(q);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [templatesList, activeCategory, statusFilter, searchQuery]);

  const handleTextChange = (key, text) => {
    setEditedTemplates((prev) => ({
      ...prev,
      [key]: text,
    }));
  };

  const handleDiscardChanges = (key) => {
    setEditedTemplates((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const toggleDefaultText = (key) => {
    setExpandedDefaults((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const insertVariableAtCursor = (key, currentVal, varName) => {
    const el = textareaRefs.current[key];
    const textToInsert = `{{${varName}}}`;
    if (!el) {
      handleTextChange(key, (currentVal || '') + textToInsert);
      return;
    }
    const start = el.selectionStart ?? currentVal.length;
    const end = el.selectionEnd ?? currentVal.length;
    const newText = (currentVal || '').substring(0, start) + textToInsert + (currentVal || '').substring(end);
    handleTextChange(key, newText);
    setTimeout(() => {
      el.focus();
      const pos = start + textToInsert.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const wrapSelectionWithFormat = (key, currentVal, wrapper) => {
    const el = textareaRefs.current[key];
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const val = currentVal || '';
    const selected = val.substring(start, end);
    const replacement = `${wrapper}${selected || 'نص'}${wrapper}`;
    const newText = val.substring(0, start) + replacement + val.substring(end);
    handleTextChange(key, newText);
    setTimeout(() => {
      el.focus();
      const pos = selected ? start + replacement.length : start + wrapper.length + 2;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleModalSubmit = async (data) => {
    if (modalConfig.mode === 'edit' && data.targetKey) {
      // Update custom template metadata & text
      await updateMutation.mutateAsync({
        templates: {
          [data.targetKey]: {
            title: data.title,
            category: data.category,
            description: data.description,
            activeText: data.text,
          },
        },
      });
      setSuccessMsg('تم تحديث بيانات القالب بنجاح!');
    } else {
      // Create new template (standard or duplicated)
      await createMutation.mutateAsync({
        title: data.title,
        key: data.key,
        category: data.category,
        description: data.description,
        text: data.text,
      });
      setSuccessMsg('تم إنشاء القالب الجديد بنجاح!');
    }
    refetch();
  };

  const handleDeleteTemplate = async () => {
    if (!confirmDeleteTemplate) return;
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await deleteMutation.mutateAsync(confirmDeleteTemplate.key);
      setSuccessMsg(`تم حذف قالب "${confirmDeleteTemplate.title}" بنجاح.`);
      setConfirmDeleteTemplate(null);
      refetch();
    } catch (err) {
      setErrorMsg(err.message || 'فشل في حذف القالب');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
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
      await resetMutation.mutateAsync({ templateKey: key });
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
      await resetMutation.mutateAsync({ templateKey: null });
      setSuccessMsg('تمت استعادة كافة القوالب إلى القيم الافتراضية بنجاح.');
      setEditedTemplates({});
      setConfirmResetAll(false);
      refetch();
    } catch (err) {
      setErrorMsg(err.message || 'فشل في استعادة القوالب');
    }
  };

  if (!canView) {
    return null;
  }

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
      {/* Header & Stats Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-l from-bg-base to-bg-surface border border-border-default rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4.5 h-4.5 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-txt-primary">
                قوالب الرسائل والإشعارات
              </h2>
              <p className="text-[11px] text-txt-muted leading-relaxed">
                استعرض قوالب النظام الافتراضية، خصص نصوصها بحرية، أو أضف رسائل وقوالب جديدة بروابط ومتغيرات ذكية
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-bg-surface px-3 py-1.5 rounded-lg border border-border-default text-xs">
            <span className="text-txt-muted">الإجمالي:</span>
            <span className="font-bold text-txt-primary font-mono">{totalTemplates}</span>
            <span className="text-border-default">|</span>
            <span className="text-txt-muted">افتراضي:</span>
            <span className="font-bold text-txt-muted font-mono">{defaultCount}</span>
            <span className="text-border-default">|</span>
            <span className="text-status-warning font-medium">معدل:</span>
            <span className="font-bold text-status-warning font-mono">{customCount}</span>
            {userCreatedCount > 0 && (
              <>
                <span className="text-border-default">|</span>
                <span className="text-brand-primary font-medium">مخصص:</span>
                <span className="font-bold text-brand-primary font-mono">{userCreatedCount}</span>
              </>
            )}
          </div>

          <PermissionGate permission={['restaurants.manage', 'whatsapp.manage']}>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={() => setModalConfig({ isOpen: true, initialData: null, mode: 'create' })}
              >
                إضافة قالب جديد
              </Button>

              {customCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  icon={RotateCcw}
                  onClick={() => setConfirmResetAll(true)}
                  title="إلغاء جميع التعديلات والعودة للنصوص الافتراضية"
                >
                  استعادة الكل للافتراضي
                </Button>
              )}
            </div>
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

      {/* Search & Category Filter Section */}
      <div className="space-y-3">
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

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-txt-dim pointer-events-none" />
            <input
              type="text"
              placeholder="بحث بالعنوان، المفتاح، أو النص..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-1.5 text-xs bg-bg-surface border border-border-default rounded-lg text-txt-primary placeholder:text-txt-dim focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>
        </div>

        {/* Sub-Filters: Status Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-[11px] text-txt-dim font-medium ml-1">تصفية حسب الحالة:</span>
          {[
            { id: 'ALL', label: `الكل (${totalTemplates})` },
            { id: 'DEFAULT', label: `الافتراضية فقط (${defaultCount})` },
            { id: 'MODIFIED', label: `المعدلة فقط (${customCount})` },
            ...(userCreatedCount > 0
              ? [{ id: 'USER_CREATED', label: `المخصصة يدوياً (${userCreatedCount})` }]
              : []),
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setStatusFilter(pill.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border ${
                statusFilter === pill.id
                  ? 'bg-bg-surface border-brand-primary text-brand-primary font-bold shadow-sm'
                  : 'bg-bg-base/50 border-border-default text-txt-muted hover:text-txt-primary hover:bg-bg-surface'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Cards Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="p-8 text-center bg-bg-base/40 rounded-xl border border-border-default text-xs text-txt-muted space-y-2">
          <p>لا توجد قوالب مطابقة لمعايير البحث الحالية.</p>
          {(searchQuery || statusFilter !== 'ALL' || activeCategory !== 'ALL') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setActiveCategory('ALL');
              }}
            >
              إعادة ضبط الفلاتر
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTemplates.map((template) => {
            const key = template.key;
            const isUserCreated = Boolean(template.isUserCreated);
            const isSystemModified = Boolean(template.isCustom && !isUserCreated);
            const isDefault = !template.isCustom && !isUserCreated;

            const currentText =
              editedTemplates[key] !== undefined ? editedTemplates[key] : template.activeText;
            const isDirty =
              editedTemplates[key] !== undefined && editedTemplates[key] !== template.activeText;
            const isDefaultExpanded = expandedDefaults.has(key);
            const previewText = renderPreviewText(currentText);

            return (
              <div
                key={key}
                className={`bg-bg-surface border ${
                  isDirty
                    ? 'border-brand-primary/50 shadow-md ring-1 ring-brand-primary/20'
                    : 'border-border-default shadow-sm'
                } rounded-xl p-4 sm:p-5 space-y-4 transition-all hover:shadow-md`}
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-default/60 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-txt-primary">{template.title}</h3>
                      <span className="font-mono text-[10px] text-txt-dim px-2 py-0.5 rounded bg-bg-base border border-border-default">
                        {template.key}
                      </span>

                      {/* State Badges */}
                      {isUserCreated && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold border bg-brand-primary/10 text-brand-primary border-brand-primary/30">
                          قالب مخصص لك
                        </span>
                      )}
                      {isSystemModified && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold border bg-status-warning/10 text-status-warning border-status-warning/30">
                          تم تعديل النص الافتراضي
                        </span>
                      )}
                      {isDefault && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold border bg-status-success-bg text-status-success border-status-success/30">
                          قالب افتراضي للنظام
                        </span>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-xs text-txt-muted">{template.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <span className="text-[11px] text-txt-dim font-medium bg-bg-base px-2.5 py-1 rounded-md border border-border-default">
                      {template.categoryLabel || CATEGORY_META[template.category]?.label || template.category}
                    </span>

                    {/* View System Default Toggle for System Templates */}
                    {!isUserCreated && template.defaultText && (
                      <button
                        type="button"
                        onClick={() => toggleDefaultText(key)}
                        className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1 ${
                          isDefaultExpanded
                            ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary font-medium'
                            : 'bg-bg-base border-border-default text-txt-muted hover:text-txt-primary'
                        }`}
                        title="عرض ومقارنة النص الافتراضي الأصلي للنظام"
                      >
                        {isDefaultExpanded ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>إخفاء الافتراضي</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>عرض الافتراضي الأصلي</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible System Default Reference Box */}
                {!isUserCreated && template.defaultText && isDefaultExpanded && (
                  <div className="p-3.5 rounded-xl bg-bg-base/60 border border-border-default space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-txt-muted flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5 text-brand-primary" />
                        <span>النص الافتراضي الأصلي للنظام (System Factory Default):</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleTextChange(key, template.defaultText);
                            setSuccessMsg('تم تحميل النص الافتراضي في المحرر للتعديل عليه.');
                          }}
                          className="text-[11px] text-brand-primary hover:underline font-medium flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>نسخ للمحرر للبدء منه</span>
                        </button>
                        {isSystemModified && (
                          <button
                            type="button"
                            onClick={() => setConfirmResetSingle(template)}
                            className="text-[11px] text-status-warning hover:underline font-medium flex items-center gap-1 mr-2"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>استعادة للافتراضي فوراً</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-bg-surface border border-border-subtle text-xs text-txt-muted leading-relaxed font-sans whitespace-pre-wrap">
                      {template.defaultText}
                    </div>
                  </div>
                )}

                {/* Formatting Toolbar & Variables Bar */}
                <div className="bg-bg-base/60 border border-border-default rounded-lg p-2.5 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="text-txt-dim text-[11px] font-medium shrink-0 flex items-center gap-1">
                      <Edit3 className="w-3 h-3 text-brand-primary" />
                      <span>المتغيرات المتاحة (اضغط للإدراج عند المؤشر):</span>
                    </span>

                    {/* WhatsApp Formatting Shortcuts */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-txt-dim ml-1">تنسيق واتساب:</span>
                      <button
                        type="button"
                        title="تنسيق عريض *نص*"
                        onClick={() => wrapSelectionWithFormat(key, currentText, '*')}
                        className="p-1 rounded bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary hover:border-border-subtle"
                      >
                        <Bold className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        title="تنسيق مائل _نص_"
                        onClick={() => wrapSelectionWithFormat(key, currentText, '_')}
                        className="p-1 rounded bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary hover:border-border-subtle"
                      >
                        <Italic className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        title="تنسيق مشطوب ~نص~"
                        onClick={() => wrapSelectionWithFormat(key, currentText, '~')}
                        className="p-1 rounded bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary hover:border-border-subtle"
                      >
                        <Strikethrough className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        title="كود أحادي `نص`"
                        onClick={() => wrapSelectionWithFormat(key, currentText, '`')}
                        className="p-1 rounded bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary hover:border-border-subtle"
                      >
                        <Code className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Variables pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Array.isArray(template.allowedVariables) && template.allowedVariables.length > 0 ? (
                      template.allowedVariables.map((varName) => (
                        <button
                          key={varName}
                          type="button"
                          title="اضغط لإدراج هذا المتغير في النص"
                          onClick={() => insertVariableAtCursor(key, currentText, varName)}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-bg-surface border border-border-default text-brand-primary hover:border-brand-primary hover:bg-brand-primary/10 transition-colors cursor-pointer"
                        >
                          {`{{${varName}}}`}
                        </button>
                      ))
                    ) : (
                      <span className="text-[11px] text-txt-dim">لا توجد متغيرات إلزامية لهذا القالب.</span>
                    )}
                  </div>
                </div>

                {/* Two-Column Editor & WhatsApp Live Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Column: Textarea Editor */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-txt-muted">
                      <span className="font-semibold flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5 text-txt-dim" />
                        <span>
                          {isUserCreated
                            ? 'نص القالب المخصص:'
                            : isSystemModified
                            ? 'نص القالب المخصص (المعدل):'
                            : 'نص القالب (الافتراضي للنظام):'}
                        </span>
                      </span>
                      <span
                        className={`font-mono text-[11px] ${
                          (currentText?.length || 0) > 1900
                            ? 'text-status-danger font-bold'
                            : 'text-txt-dim'
                        }`}
                      >
                        {currentText?.length || 0} / 2000 حرف
                      </span>
                    </div>

                    <textarea
                      ref={(el) => {
                        if (el) textareaRefs.current[key] = el;
                      }}
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
                        <span>معاينة حية للمستلم (Live WhatsApp Preview):</span>
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
                  <div className="flex items-center gap-2 text-[11px]">
                    {isDirty && (
                      <span className="text-brand-primary font-medium flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                        يوجد تعديل غير محفوظ لهذا القالب
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Copy Preview */}
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={copiedKey === key ? Check : Copy}
                      onClick={() => handleCopyText(previewText, key)}
                      className="text-xs text-txt-muted hover:text-txt-primary"
                      title="نسخ نص المعاينة"
                    >
                      {copiedKey === key ? 'تم النسخ' : 'نسخ النص'}
                    </Button>

                    {/* Duplicate as New Custom Template */}
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Share2}
                      onClick={() =>
                        setModalConfig({
                          isOpen: true,
                          initialData: template,
                          mode: 'duplicate',
                        })
                      }
                      className="text-xs text-txt-muted hover:text-txt-primary"
                      title="استخدام هذا القالب لإنشاء قالب مخصص جديد"
                    >
                      تكرار كقالب جديد
                    </Button>

                    <PermissionGate permission="restaurants.manage">
                      {isUserCreated ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={Edit3}
                            onClick={() =>
                              setModalConfig({
                                isOpen: true,
                                initialData: template,
                                mode: 'edit',
                              })
                            }
                            className="text-xs text-txt-muted hover:text-txt-primary"
                          >
                            تعديل البيانات
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={Trash2}
                            className="text-status-danger hover:bg-status-danger-bg hover:text-status-danger"
                            onClick={() => setConfirmDeleteTemplate(template)}
                          >
                            حذف القالب
                          </Button>
                        </>
                      ) : (
                        isSystemModified && (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={RotateCcw}
                            isLoading={resettingKey === key}
                            onClick={() => setConfirmResetSingle(template)}
                          >
                            استعادة الافتراضي
                          </Button>
                        )
                      )}

                      {/* Discard Unsaved Changes */}
                      {isDirty && (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Undo2}
                          onClick={() => handleDiscardChanges(key)}
                        >
                          تراجع
                        </Button>
                      )}

                      {/* Save Changes */}
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

      <ConfirmDialog
        isOpen={Boolean(confirmDeleteTemplate)}
        onClose={() => setConfirmDeleteTemplate(null)}
        onConfirm={handleDeleteTemplate}
        title="حذف القالب المخصص"
        message={`هل أنت متأكد من حذف قالب "${confirmDeleteTemplate?.title}" نهائياً؟ لن تتمكن من استعادته.`}
        confirmLabel="حذف نهائي"
        cancelLabel="إلغاء"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Create / Edit / Duplicate Custom Template Modal */}
      <CreateTemplateModal
        isOpen={modalConfig.isOpen}
        initialData={modalConfig.initialData}
        mode={modalConfig.mode}
        onClose={() => setModalConfig({ isOpen: false, initialData: null, mode: 'create' })}
        onSubmit={handleModalSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default TemplatesManager;
