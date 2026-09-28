import React from 'react';
import { Search, RotateCcw, Plus, MessageSquare, ShoppingBag, Headphones, Sparkles, Sliders } from 'lucide-react';
import { Button } from '../../../../shared/components/Button.jsx';

export const CATEGORY_META = {
  ALL: { label: 'جميع القوالب', icon: Sliders },
  WHATSAPP_BOT: { label: 'بوت الواتساب التفاعلي', icon: MessageSquare },
  ORDER_STATUS: { label: 'إشعارات حالات الطلب', icon: ShoppingBag },
  INBOX_SUPPORT: { label: 'خدمة العملاء والدعم', icon: Headphones },
  QUICK_REPLY: { label: 'ردود سريعة', icon: MessageSquare },
  GENERAL: { label: 'عام / تسويقي', icon: Sparkles },
};

export const TemplatesFilterHeader = ({
  totalTemplates = 0,
  customCount = 0,
  defaultCount = 0,
  userCreatedCount = 0,
  activeCategory = 'ALL',
  onSelectCategory,
  statusFilter = 'ALL',
  onSelectStatusFilter,
  searchQuery = '',
  onChangeSearchQuery,
  onOpenCreateModal,
  onConfirmResetAll,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Banner with Stats & Primary Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-l from-bg-base to-bg-surface border border-border-default rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shadow-sm">
              <MessageSquare className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-txt-primary leading-tight">
                قوالب رسائل وإشعارات الواتساب
              </h1>
              <p className="text-xs text-txt-muted mt-0.5">
                تخصيص ردود البوت، إشعارات حالات الطلب، والرسائل السريعة لخدمة العملاء
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="text-xs border-border-default hover:border-border-subtle"
            onClick={onConfirmResetAll}
          >
            <RotateCcw className="w-3.5 h-3.5 ml-1 text-txt-muted" />
            <span>استعادة الكل للافتراضي</span>
          </Button>

          <Button
            size="sm"
            variant="primary"
            className="text-xs shadow-sm"
            onClick={onOpenCreateModal}
          >
            <Plus className="w-3.5 h-3.5 ml-1" />
            <span>إضافة قالب جديد</span>
          </Button>
        </div>
      </div>

      {/* Stats Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-bg-surface border border-border-default/80 rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs text-txt-muted font-medium">إجمالي القوالب</span>
          <span className="text-sm font-bold font-mono text-txt-primary">{totalTemplates}</span>
        </div>
        <div className="bg-bg-surface border border-border-default/80 rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs text-emerald-400 font-medium">معدلة ومخصصة</span>
          <span className="text-sm font-bold font-mono text-emerald-400">{customCount}</span>
        </div>
        <div className="bg-bg-surface border border-border-default/80 rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs text-brand-primary font-medium">قوالب منشأة</span>
          <span className="text-sm font-bold font-mono text-brand-primary">{userCreatedCount}</span>
        </div>
        <div className="bg-bg-surface border border-border-default/80 rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">افتراضية النظام</span>
          <span className="text-sm font-bold font-mono text-slate-300">{defaultCount}</span>
        </div>
      </div>

      {/* Toolbar: Category Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-bg-surface border border-border-default rounded-xl p-3 shadow-sm">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {Object.entries(CATEGORY_META).map(([key, meta]) => {
            const Icon = meta.icon;
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectCategory(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-brand-primary text-txt-inverted font-bold shadow-sm'
                    : 'bg-bg-base text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated border border-border-default'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Filters */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-txt-dim pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onChangeSearchQuery(e.target.value)}
              placeholder="بحث بالعنوان، المفتاح، أو النص..."
              className="w-full pl-3 pr-10 py-1.5 text-xs bg-bg-surface border border-border-default rounded-lg text-txt-primary placeholder:text-txt-dim focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onSelectStatusFilter(e.target.value)}
            className="py-1.5 px-2.5 text-xs bg-bg-surface border border-border-default rounded-lg text-txt-primary focus:outline-none focus:border-brand-primary transition-colors"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="MODIFIED">المعدلة فقط</option>
            <option value="USER_CREATED">المنشأة يدوياً</option>
            <option value="DEFAULT">الافتراضية فقط</option>
          </select>
        </div>
      </div>
    </div>
  );
};
