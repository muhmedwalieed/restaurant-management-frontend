import { useState, useMemo, useRef } from 'react';
import {
  useTemplatesQuery,
  useUpdateTemplatesMutation,
  useResetTemplatesMutation,
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
} from './useTemplates.js';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { useOptionalBranch } from '../../auth/context/BranchContext.jsx';
import { resolveTemplateContext } from '../utils/templateContextResolver.js';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';

export const useTemplatesManager = () => {
  const { user, hasPermission } = useAuth();
  const branchCtx = useOptionalBranch();
  const activeBranch = branchCtx?.activeBranch;

  const canView = Boolean(
    hasPermission?.([
      'restaurants.manage',
      'whatsapp.manage',
      'whatsapp.view',
      'chats.view',
      'chats.reply',
    ])
  );

  const { data: templatesResponse, isLoading, isError, error, refetch } = useTemplatesQuery({
    enabled: canView,
  });
  const updateMutation = useUpdateTemplatesMutation();
  const resetMutation = useResetTemplatesMutation();
  const createMutation = useCreateTemplateMutation();
  const deleteMutation = useDeleteTemplateMutation();

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
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
    mode: 'create',
  });
  const [copiedKey, setCopiedKey] = useState(null);
  const [successMsg, setSuccessMsg] = useAutoDismiss();
  const [errorMsg, setErrorMsg] = useState(null);

  const textareaRefs = useRef({});

  const previewContext = useMemo(() => {
    return resolveTemplateContext({ user, activeBranch });
  }, [user, activeBranch]);

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
      const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;

      let matchesStatus = true;
      if (statusFilter === 'DEFAULT') {
        matchesStatus = !item.isCustom && !item.isUserCreated;
      } else if (statusFilter === 'MODIFIED') {
        matchesStatus = item.isCustom && !item.isUserCreated;
      } else if (statusFilter === 'USER_CREATED') {
        matchesStatus = item.isUserCreated;
      }

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

  const handleResetSingle = async (item) => {
    const key = item.key;
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
      await resetMutation.mutateAsync({ templateKey: null, resetAll: true });
      setSuccessMsg('تمت استعادة كافة القوالب إلى القيم الافتراضية بنجاح.');
      setEditedTemplates({});
      setConfirmResetAll(false);
      refetch();
    } catch (err) {
      setErrorMsg(err.message || 'فشل في استعادة القوالب');
    }
  };

  return {
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
  };
};
