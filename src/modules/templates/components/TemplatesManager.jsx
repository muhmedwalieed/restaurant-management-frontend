import React from 'react';
import { CreateTemplateModal } from './CreateTemplateModal.jsx';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { TemplatesFilterHeader } from './manager/TemplatesFilterHeader.jsx';
import { TemplateCard } from './manager/TemplateCard.jsx';
import { useTemplatesManager } from '../hooks/useTemplatesManager.js';
import {
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const TemplatesManager = () => {
  const {
    canView,
    isLoading,
    isError,
    error,
    refetch,
    previewContext,
    totalTemplates,
    userCreatedCount,
    customCount,
    defaultCount,
    activeCategory,
    setActiveCategory,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    filteredTemplates,
    editedTemplates,
    expandedDefaults,
    savingKey,
    resettingKey,
    confirmResetAll,
    setConfirmResetAll,
    confirmResetSingle,
    setConfirmResetSingle,
    confirmDeleteTemplate,
    setConfirmDeleteTemplate,
    isDeleting,
    modalConfig,
    setModalConfig,
    copiedKey,
    successMsg,
    errorMsg,
    textareaRefs,
    handleTextChange,
    handleDiscardChanges,
    toggleDefaultText,
    insertVariableAtCursor,
    wrapSelectionWithFormat,
    handleModalSubmit,
    handleDeleteTemplate,
    handleCopyText,
    handleSave,
    handleResetSingle,
    handleResetAll,
  } = useTemplatesManager();

  if (!canView) return null;

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
      {/* Alert Messages */}
      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header, KPIs & Toolbar Filter */}
      <TemplatesFilterHeader
        totalTemplates={totalTemplates}
        customCount={customCount}
        defaultCount={defaultCount}
        userCreatedCount={userCreatedCount}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        statusFilter={statusFilter}
        onSelectStatusFilter={setStatusFilter}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        onOpenCreateModal={() => setModalConfig({ isOpen: true, initialData: null, mode: 'create' })}
        onConfirmResetAll={() => setConfirmResetAll(true)}
      />

      {/* Template Cards List */}
      <div className="space-y-4">
        {filteredTemplates.length === 0 ? (
          <div className="bg-bg-surface border border-border-default rounded-xl p-8 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-txt-dim mx-auto" />
            <p className="text-sm font-semibold text-txt-primary">لا توجد قوالب مطابقة للبحث أو الفلتر</p>
            <p className="text-xs text-txt-muted">جرّب تغيير التصنيف أو كلمات البحث للعثور على القوالب المطلوبة.</p>
          </div>
        ) : (
          filteredTemplates.map((item) => {
            const currentText = editedTemplates[item.key] !== undefined ? editedTemplates[item.key] : item.activeText;
            const isEdited = editedTemplates[item.key] !== undefined && editedTemplates[item.key] !== item.activeText;

            return (
              <TemplateCard
                key={item.key}
                item={item}
                currentText={currentText}
                isEdited={isEdited}
                isSaving={savingKey === item.key}
                isResetting={resettingKey === item.key}
                isExpandedDefault={expandedDefaults.has(item.key)}
                isCopied={copiedKey === item.key}
                previewContext={previewContext}
                onTextChange={(val) => handleTextChange(item.key, val)}
                onDiscardChanges={() => handleDiscardChanges(item.key)}
                onSave={() => handleSave(item.key)}
                onResetSingle={() => setConfirmResetSingle(item)}
                onOpenEditModal={(target) =>
                  setModalConfig({
                    isOpen: true,
                    mode: 'edit',
                    initialData: {
                      targetKey: target.key,
                      key: target.key,
                      title: target.title,
                      category: target.category,
                      description: target.description,
                      text: target.activeText,
                    },
                  })
                }
                onOpenDuplicateModal={(target) =>
                  setModalConfig({
                    isOpen: true,
                    mode: 'duplicate',
                    initialData: {
                      title: `${target.title} (نسخة)`,
                      category: target.category,
                      description: target.description,
                      text: target.activeText,
                    },
                  })
                }
                onConfirmDelete={(target) => setConfirmDeleteTemplate(target)}
                onToggleDefault={() => toggleDefaultText(item.key)}
                onCopyText={(txt) => handleCopyText(txt, item.key)}
                textareaRef={(el) => {
                  textareaRefs.current[item.key] = el;
                }}
                onInsertVariable={(varName) => insertVariableAtCursor(item.key, currentText, varName)}
                onWrapSelection={(wrapper) => wrapSelectionWithFormat(item.key, currentText, wrapper)}
              />
            );
          })
        )}
      </div>

      {/* Confirmation Dialog: Reset All */}
      <ConfirmDialog
        isOpen={confirmResetAll}
        title="استعادة كافة القوالب للافتراضي"
        message="هل أنت متأكد من استعادة كافة القوالب إلى القيم الافتراضية للنظام؟ سيتم إلغاء جميع التعديلات المحفوظة."
        confirmLabel="استعادة الكل"
        confirmVariant="danger"
        isLoading={Boolean(resettingKey) || confirmResetAll}
        onConfirm={handleResetAll}
        onCancel={() => setConfirmResetAll(false)}
      />

      {/* Confirmation Dialog: Reset Single */}
      <ConfirmDialog
        isOpen={Boolean(confirmResetSingle)}
        title="استعادة القالب للافتراضي"
        message={`هل أنت متأكد من استعادة النص الافتراضي لقالب "${confirmResetSingle?.title}"؟ سيتم إلغاء التعديلات الخاصة بمطعمك.`}
        confirmLabel="استعادة الافتراضي"
        confirmVariant="danger"
        isLoading={resettingKey === confirmResetSingle?.key}
        onConfirm={() => handleResetSingle(confirmResetSingle)}
        onCancel={() => setConfirmResetSingle(null)}
      />

      {/* Confirmation Dialog: Delete Template */}
      <ConfirmDialog
        isOpen={Boolean(confirmDeleteTemplate)}
        title="حذف القالب"
        message={`هل أنت متأكد من حذف قالب "${confirmDeleteTemplate?.title}" نهائياً؟ لن تتمكن من استعادته.`}
        confirmLabel="حذف نهائي"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteTemplate}
        onCancel={() => setConfirmDeleteTemplate(null)}
      />

      {/* Create / Edit / Duplicate Template Modal */}
      <CreateTemplateModal
        isOpen={modalConfig.isOpen}
        mode={modalConfig.mode}
        initialData={modalConfig.initialData}
        isLoading={false}
        onSubmit={handleModalSubmit}
        onClose={() => setModalConfig({ isOpen: false, initialData: null, mode: 'create' })}
      />
    </div>
  );
};

export default TemplatesManager;
