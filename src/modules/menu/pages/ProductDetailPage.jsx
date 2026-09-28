import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useProductQuery,
  useUpdateProductMutation,
  useCategoriesQuery,
  useModifiersQuery,
  useDeleteModifierMutation,
} from '../hooks/useMenu.js';
import { productFormSchema } from '../schemas/menu.schema.js';
import { ModifierFormModal } from '../components/ModifierFormModal.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import { ProductBasicInfoForm } from '../components/detail/ProductBasicInfoForm.jsx';
import { ProductModifiersSection } from '../components/detail/ProductModifiersSection.jsx';
import {
  Utensils,
  ChevronRight,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const [generalSuccess, setGeneralSuccess] = useAutoDismiss();
  const [generalError, setGeneralError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [modifierToEdit, setModifierToEdit] = useState(null);
  const [modifierToDelete, setModifierToDelete] = useState(null);

  const { data: product, isLoading, isError, error, refetch } = useProductQuery(id);
  const updateProductMutation = useUpdateProductMutation();
  const categoriesQuery = useCategoriesQuery();
  const modifiersQuery = useModifiersQuery(id);
  const deleteModifierMutation = useDeleteModifierMutation();

  const categories = categoriesQuery.data?.items || [];
  const modifiers = modifiersQuery.data || [];
  const categoryOptions = categories.map((cat) => ({ value: cat.id, label: cat.name }));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productFormSchema),
    values: {
      categoryId: product?.categoryId || product?.category?.id || '',
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price !== undefined ? String(product.price) : '',
      imageUrl: product?.imageUrl || '',
      isAvailable: product?.isAvailable ?? true,
      status: product?.status || 'ACTIVE',
    },
  });

  const handleGeneralSubmit = async (formData) => {
    setGeneralSuccess(null);
    setGeneralError(null);
    try {
      await updateProductMutation.mutateAsync({ id, payload: formData });
      setGeneralSuccess('تم حفظ بيانات المنتج بنجاح.');
    } catch (err) {
      setGeneralError(err?.message || 'حدث خطأ أثناء تحديث بيانات المنتج.');
    }
  };

  const handleOpenModifierModal = (mod = null) => {
    setModifierToEdit(mod);
    setIsModifierModalOpen(true);
  };

  const handleDeleteModifier = async () => {
    if (!modifierToDelete) return;
    setActionError(null);
    try {
      await deleteModifierMutation.mutateAsync({ productId: id, modifierId: modifierToDelete.id });
      setModifierToDelete(null);
    } catch (err) {
      setActionError(err?.message || 'حدث خطأ أثناء حذف الإضافة.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton height={48} className="w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <LoadingSkeleton height={350} className="lg:col-span-7 w-full" />
          <LoadingSkeleton height={350} className="lg:col-span-5 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-status-danger/10 border border-status-danger/30 rounded-xl p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-status-danger mx-auto" />
        <h3 className="text-base font-bold text-txt-primary">فشل في تحميل بيانات الصنف</h3>
        <p className="text-xs text-txt-muted">{error?.message || 'تعذر التواصل مع الخادم.'}</p>
        <Button size="sm" variant="outline" onClick={refetch}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-default">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-txt-muted">
            <Link to="/menu" className="hover:text-txt-primary transition-colors">
              قائمة الطعام
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-txt-primary font-semibold truncate max-w-[200px]">
              {product?.name || 'تفاصيل الصنف'}
            </span>
          </div>

          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <Utensils className="w-5 h-5 text-brand-primary shrink-0" />
            <span className="truncate">{product?.name || 'صنف بدون اسم'}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={() => reset()}
            disabled={updateProductMutation.isPending}
            className="border-white/10 text-xs"
          >
            إلغاء التغييرات
          </Button>

          <PermissionGate permission="menu.manage">
            <Button
              type="submit"
              form="product-edit-form"
              size="sm"
              icon={Save}
              isLoading={updateProductMutation.isPending}
              className="bg-white text-slate-950 font-bold hover:bg-slate-200 border-none shadow-sm text-xs"
            >
              حفظ التعديلات
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Notifications */}
      {generalSuccess && (
        <div className="p-3 rounded-lg text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{generalSuccess}</span>
        </div>
      )}
      {generalError && (
        <div className="p-3 rounded-lg text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3 rounded-lg text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7 space-y-5">
          <ProductBasicInfoForm
            id={id}
            register={register}
            handleSubmit={handleSubmit}
            setValue={setValue}
            watch={watch}
            errors={errors}
            categoryOptions={categoryOptions}
            onSubmit={handleGeneralSubmit}
          />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <ProductModifiersSection
            modifiers={modifiers}
            isLoading={modifiersQuery.isLoading}
            isError={modifiersQuery.isError}
            errorMessage={modifiersQuery.error?.message}
            onAddModifier={() => handleOpenModifierModal()}
            onEditModifier={(mod) => handleOpenModifierModal(mod)}
            onDeleteModifier={(mod) => setModifierToDelete(mod)}
          />
        </div>
      </div>

      {/* Modals */}
      <ModifierFormModal
        isOpen={isModifierModalOpen}
        onClose={() => {
          setIsModifierModalOpen(false);
          setModifierToEdit(null);
        }}
        productId={id}
        modifierToEdit={modifierToEdit}
      />

      <ConfirmDialog
        isOpen={Boolean(modifierToDelete)}
        onClose={() => setModifierToDelete(null)}
        title="حذف الإضافة"
        message={`هل أنت متأكد من حذف الإضافة "${modifierToDelete?.name}"؟`}
        confirmLabel="حذف"
        variant="danger"
        isLoading={deleteModifierMutation.isPending}
        onConfirm={handleDeleteModifier}
      />
    </div>
  );
};
