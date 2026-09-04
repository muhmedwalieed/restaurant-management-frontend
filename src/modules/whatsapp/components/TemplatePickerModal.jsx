import { useState, useMemo } from 'react';
import { useTemplatesQuery } from '../../templates/hooks/useTemplates.js';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import {
  X,
  Search,
  BookOpen,
  Sparkles,
  Check,
  Send,
  Sliders,
  Copy,
} from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'ALL', label: 'جميع القوالب' },
  { id: 'INBOX_SUPPORT', label: 'خدمة العملاء والدعم' },
  { id: 'QUICK_REPLY', label: 'ردود سريعة' },
  { id: 'ORDER_STATUS', label: 'حالات الطلب' },
  { id: 'WHATSAPP_BOT', label: 'بوت الواتساب' },
];

function interpolateVariables(templateText, variables = {}) {
  if (!templateText) return '';
  let result = templateText;
  for (const [k, v] of Object.entries(variables)) {
    result = result.split(`{{${k}}}`).join(v !== undefined && v !== null ? String(v) : '');
  }
  return result;
}

export const TemplatePickerModal = ({ isOpen, onClose, onSelect, ticket }) => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const { data: templatesResponse, isLoading } = useTemplatesQuery({
    enabled: isOpen,
  });

  const templates = useMemo(() => {
    return Array.isArray(templatesResponse?.data) ? templatesResponse.data : [];
  }, [templatesResponse?.data]);

  // Context variables from ticket
  const ticketVariables = useMemo(() => {
    const custName = ticket?.customerName || ticket?.customerPhone || 'العميل';
    return {
      customerName: custName,
      customerSalutation: ticket?.customerName ? ` يا أستاذ ${ticket.customerName}` : '',
      orderNumber: ticket?.orderNumber || '',
      ticketNumber: ticket?.ticketNumber || '',
      subject: ticket?.subject || '',
      restaurantName: ticket?.restaurantName || 'مطعمنا',
      agentName: user?.name || 'فريق خدمة العملاء',
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
  }, [ticket, user]);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchCat = activeCategory === 'ALL' || t.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        t.title?.toLowerCase().includes(q) ||
        t.key?.toLowerCase().includes(q) ||
        t.activeText?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [templates, activeCategory, searchQuery]);

  if (!isOpen) return null;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-bg-surface border border-border-default rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default bg-bg-base/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-txt-primary">اختيار قالب رد سريع</h3>
              <p className="text-[11px] text-txt-muted">
                اختر قالباً لإدراجه فوراً في الرد مع تعويض بيانات العميل ورقم التذكرة تلقائياً
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

        {/* Search & Tabs Controls */}
        <div className="p-4 border-b border-border-default bg-bg-base/40 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-txt-dim pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث في القوالب بالاسم أو النص..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 text-xs bg-bg-surface border border-border-default rounded-lg text-txt-primary placeholder:text-txt-dim focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORY_TABS.map((tab) => {
              const isSelected = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap border ${
                    isSelected
                      ? 'bg-brand-primary text-txt-inverted border-brand-primary font-bold'
                      : 'bg-bg-surface text-txt-muted border-border-default hover:text-txt-primary'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-txt-muted flex flex-col items-center justify-center space-y-2">
              <Sparkles className="w-6 h-6 text-brand-primary animate-spin" />
              <p>جاري تحميل القوالب...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-txt-muted bg-bg-base/30 rounded-xl border border-border-default">
              <Sliders className="w-8 h-8 mx-auto text-txt-dim mb-2 opacity-50" />
              <p>لا توجد قوالب مطابقة للبحث الحالي.</p>
            </div>
          ) : (
            filtered.map((t) => {
              const interpolated = interpolateVariables(t.activeText, ticketVariables);

              return (
                <div
                  key={t.key}
                  className="bg-bg-base border border-border-default rounded-xl p-3.5 space-y-2.5 transition-all hover:border-brand-primary/50 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-txt-primary">{t.title}</h4>
                      {t.isUserCreated && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary font-semibold border border-brand-primary/20">
                          مخصص
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-txt-dim bg-bg-surface px-2 py-0.5 rounded border border-border-default font-mono">
                      {t.category}
                    </span>
                  </div>

                  {/* Rendered Preview Balloon */}
                  <div className="p-3 rounded-lg bg-bg-surface border border-border-default text-xs text-txt-primary whitespace-pre-wrap leading-relaxed">
                    {interpolated}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={copiedKey === t.key ? Check : Copy}
                      onClick={() => handleCopy(interpolated, t.key)}
                      className="text-xs h-7 px-2"
                    >
                      {copiedKey === t.key ? 'تم النسخ' : 'نسخ النص'}
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Send}
                      onClick={() => {
                        onSelect(interpolated);
                        onClose();
                      }}
                      className="text-xs h-7 px-3 font-bold"
                    >
                      استخدام هذا القالب
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border-default bg-bg-base/70 flex items-center justify-between text-xs text-txt-dim shrink-0">
          <span>عدد القوالب المتاحة: {filtered.length}</span>
          <Button size="sm" variant="outline" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplatePickerModal;
